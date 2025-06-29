#!/bin/bash

# N.B.
#
# This script has never been tested (or run for that matter)
#
set -e

# Installation script for Entiendo environment (generated)
INSTANCE_NAME="entiendo-server"
INSTANCE_TYPE="t2.micro"
KEY_NAME="entiendo-key"
REGION="sa-east-1"
VOLUME_SIZE="20"

# Set AMI_ID if not supplied (fetch latest Amazon Linux 2 AMI for the region)
if [ -z "$AMI_ID" ]; then
  AMI_ID=$(aws ec2 describe-images \
    --owners "amazon" \
    --filters "Name=name,Values=amzn2-ami-hvm-*-x86_64-gp2" "Name=state,Values=available" \
    --region $REGION \
    --query "Images | sort_by(@, &CreationDate)[-1].ImageId" \
    --output text)
  echo "Using latest Amazon Linux 2 AMI: $AMI_ID"
fi

# Create VPC if not supplied
if [ -z "$VPC_ID" ]; then
  VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region $REGION --query "Vpc.VpcId" --output text)
  aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support "{\"Value\":true}" --region $REGION
  aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames "{\"Value\":true}" --region $REGION
  echo "Created VPC: $VPC_ID"
fi

# Create subnet if not supplied
if [ -z "$SUBNET_ID" ]; then
  SUBNET_ID=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --region $REGION --query "Subnet.SubnetId" --output text)
  echo "Created Subnet: $SUBNET_ID"
fi

# Create security group if not supplied
if [ -z "$SECURITY_GROUP_ID" ]; then
  SECURITY_GROUP_ID=$(aws ec2 create-security-group --group-name "entiendo-sg" --description "Entiendo SG" --vpc-id $VPC_ID --region $REGION --query "GroupId" --output text)
  # Allow SSH and HTTP
  aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $REGION
  aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION
  echo "Created Security Group: $SECURITY_GROUP_ID"
fi

aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SECURITY_GROUP_ID" \
  --subnet-id "$SUBNET_ID" \
  --associate-public-ip-address \
  --block-device-mappings "[{\"DeviceName\":\"/dev/xvda\",\"Ebs\":{\"VolumeSize\":$VOLUME_SIZE,\"VolumeType\":\"gp3\"}}]" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
  --region $REGION

echo "Entiendo EC2 instance launched."
