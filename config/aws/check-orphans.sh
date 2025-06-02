#!/bin/bash

echo -e "\n🔎 Checking for orphaned Elastic IPs (EIPs)..."
aws ec2 describe-addresses \
  --query "Addresses[?AssociationId==null].{AllocationId:AllocationId,PublicIp:PublicIp}" \
  --output table

echo -e "\n🔎 Checking for subnets with zero running EC2 instances..."

subnets=$(aws ec2 describe-subnets --query 'Subnets[*].{SubnetId:SubnetId, VpcId:VpcId, AZ:AvailabilityZone}' --output json)

echo "$subnets" | jq -c '.[]' | while read -r subnet; do
  subnet_id=$(echo "$subnet" | jq -r '.SubnetId')
  count=$(aws ec2 describe-instances \
    --filters Name=subnet-id,Values=$subnet_id Name=instance-state-name,Values=running \
    --query 'Reservations[*].Instances[*].InstanceId' --output json | jq 'flatten | length')

  if [[ "$count" -eq 0 ]]; then
    echo "🛑 Subnet $subnet_id has NO running instances"
  fi
done