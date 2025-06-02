#!/bin/bash

echo "Finding all NAT Gateways..."
nat_gateways=$(aws ec2 describe-nat-gateways --query 'NatGateways[*].{Id:NatGatewayId, VpcId:VpcId, SubnetId:SubnetId}' --output json)

echo "$nat_gateways" | jq -c '.[]' | while read -r nat; do
  nat_id=$(echo "$nat" | jq -r '.Id')
  nat_subnet=$(echo "$nat" | jq -r '.SubnetId')
  nat_vpc=$(echo "$nat" | jq -r '.VpcId')

  echo -e "\n🔍 NAT Gateway: $nat_id"
  echo "  Subnet: $nat_subnet"
  echo "  VPC: $nat_vpc"

  echo "  Checking route tables pointing to this NAT Gateway..."

  aws ec2 describe-route-tables \
    --filters Name=vpc-id,Values=$nat_vpc \
    --query 'RouteTables[*].{Id:RouteTableId,Routes:Routes,Associations:Associations}' \
    --output json | jq -c '.[]' | while read -r rt; do
      rt_id=$(echo "$rt" | jq -r '.Id')
      if echo "$rt" | jq -e --arg nat "$nat_id" '.Routes[] | select(.NatGatewayId == $nat)' > /dev/null; then
        echo "  ⚠️  Route table $rt_id uses NAT Gateway $nat_id"

        echo "    Associated subnets:"
        echo "$rt" | jq -r '.Associations[] | select(.SubnetId != null) | "      - " + .SubnetId'
      fi
    done
done

echo -e "\nLooking for EC2 instances with public IPs..."
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].{ID:InstanceId,Subnet:SubnetId,PubIP:PublicIpAddress,State:State.Name}' \
  --output json | jq -c '.[][]' | while read -r inst; do
    pub_ip=$(echo "$inst" | jq -r '.PubIP')
    state=$(echo "$inst" | jq -r '.State')
    if [[ "$pub_ip" != "null" && "$state" == "running" ]]; then
      inst_id=$(echo "$inst" | jq -r '.ID')
      subnet=$(echo "$inst" | jq -r '.Subnet')
      echo "✅ Instance $inst_id has public IP $pub_ip in subnet $subnet"
    fi
done