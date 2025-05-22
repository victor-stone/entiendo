#!/bin/bash

# Launch EC2 Instance for Entiendo Application
# This script creates an EC2 instance with security groups and a public IP

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - customize these or pass as environment variables
INSTANCE_NAME=${INSTANCE_NAME:-"entiendo-server"}
INSTANCE_TYPE=${INSTANCE_TYPE:-"t2.micro"}
AMI_ID=${AMI_ID:-""} # Will be set automatically if empty
KEY_NAME=${KEY_NAME:-""}
REGION=${AWS_REGION:-"us-east-1"}
VPC_ID=${VPC_ID:-""}
SUBNET_ID=${SUBNET_ID:-""}
SECURITY_GROUP_NAME=${SECURITY_GROUP_NAME:-"entiendo-sg"}
VOLUME_SIZE=${VOLUME_SIZE:-"20"}
SSH_CIDR=${SSH_CIDR:-"0.0.0.0/0"} # Restrict this in production
USER_DATA_FILE=${USER_DATA_FILE:-""}
TAGS=${TAGS:-"Environment=production,Project=entiendo"}

# Function to get the default VPC
get_default_vpc() {
  echo -e "${BLUE}Identifying default VPC...${NC}"
  DEFAULT_VPC=$(aws ec2 describe-vpcs \
    --filters "Name=isDefault,Values=true" \
    --query "Vpcs[0].VpcId" \
    --region $REGION \
    --output text)
  
  if [ -z "$DEFAULT_VPC" ] || [ "$DEFAULT_VPC" == "None" ]; then
    echo -e "${RED}No default VPC found. Please specify VPC_ID.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Default VPC: $DEFAULT_VPC${NC}"
  VPC_ID=$DEFAULT_VPC
}

# Function to get a public subnet in the VPC
get_public_subnet() {
  echo -e "${BLUE}Identifying a public subnet...${NC}"
  PUBLIC_SUBNET=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query "Subnets[0].SubnetId" \
    --region $REGION \
    --output text)
  
  if [ -z "$PUBLIC_SUBNET" ] || [ "$PUBLIC_SUBNET" == "None" ]; then
    echo -e "${RED}No subnet found in VPC $VPC_ID. Please specify SUBNET_ID.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Using subnet: $PUBLIC_SUBNET${NC}"
  SUBNET_ID=$PUBLIC_SUBNET
}

# Function to get latest Amazon Linux 2 AMI
get_latest_ami() {
  echo -e "${BLUE}Finding latest Amazon Linux 2023 AMI...${NC}"
  LATEST_AMI=$(aws ec2 describe-images \
    --owners amazon \
    --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" \
    --query "sort_by(Images, &CreationDate)[-1].ImageId" \
    --region $REGION \
    --output text)
  
  if [ -z "$LATEST_AMI" ] || [ "$LATEST_AMI" == "None" ]; then
    echo -e "${RED}Failed to find a suitable AMI. Please specify AMI_ID.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Latest Amazon Linux 2023 AMI: $LATEST_AMI${NC}"
  AMI_ID=$LATEST_AMI
}

# Function to create security group
create_security_group() {
  echo -e "${BLUE}Creating security group: $SECURITY_GROUP_NAME...${NC}"
  
  # Check if security group already exists
  SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$SECURITY_GROUP_NAME" "Name=vpc-id,Values=$VPC_ID" \
    --query "SecurityGroups[0].GroupId" \
    --region $REGION \
    --output text 2>/dev/null || echo "")
  
  if [ -z "$SG_ID" ] || [ "$SG_ID" == "None" ]; then
    # Create security group
    SG_ID=$(aws ec2 create-security-group \
      --group-name "$SECURITY_GROUP_NAME" \
      --description "Security group for Entiendo application" \
      --vpc-id "$VPC_ID" \
      --region $REGION \
      --output text \
      --query "GroupId")
    
    echo -e "${GREEN}Created security group: $SG_ID${NC}"
    
    # Tag the security group
    aws ec2 create-tags \
      --resources "$SG_ID" \
      --tags "Key=Name,Value=$SECURITY_GROUP_NAME" \
      --region $REGION
    
    # Add rules for SSH, HTTP, and HTTPS
    echo -e "${BLUE}Adding inbound rules...${NC}"
    
    # SSH
    aws ec2 authorize-security-group-ingress \
      --group-id "$SG_ID" \
      --protocol tcp \
      --port 22 \
      --cidr "$SSH_CIDR" \
      --region $REGION
    
    # HTTP
    aws ec2 authorize-security-group-ingress \
      --group-id "$SG_ID" \
      --protocol tcp \
      --port 80 \
      --cidr "0.0.0.0/0" \
      --region $REGION
    
    # HTTPS
    aws ec2 authorize-security-group-ingress \
      --group-id "$SG_ID" \
      --protocol tcp \
      --port 443 \
      --cidr "0.0.0.0/0" \
      --region $REGION
  else
    echo -e "${GREEN}Using existing security group: $SG_ID${NC}"
  fi
}

# Function to create key pair if not exists
ensure_key_pair() {
  if [ -z "$KEY_NAME" ]; then
    KEY_NAME="entiendo-key"
    echo -e "${YELLOW}No key pair specified. Using default: $KEY_NAME${NC}"
  fi
  
  # Check if key pair exists
  KEY_EXISTS=$(aws ec2 describe-key-pairs \
    --key-names "$KEY_NAME" \
    --region $REGION \
    --query "KeyPairs[0].KeyName" \
    --output text 2>/dev/null || echo "")
  
  if [ -z "$KEY_EXISTS" ] || [ "$KEY_EXISTS" == "None" ]; then
    echo -e "${BLUE}Creating new key pair: $KEY_NAME...${NC}"
    
    # Create key pair and save private key
    aws ec2 create-key-pair \
      --key-name "$KEY_NAME" \
      --query "KeyMaterial" \
      --region $REGION \
      --output text > "${KEY_NAME}.pem"
    
    # Set proper permissions
    chmod 400 "${KEY_NAME}.pem"
    echo -e "${GREEN}Created key pair and saved to ${KEY_NAME}.pem${NC}"
    echo -e "${YELLOW}Keep this file secure. It's required to SSH into your instance.${NC}"
  else
    echo -e "${GREEN}Using existing key pair: $KEY_NAME${NC}"
    echo -e "${YELLOW}Make sure you have the private key file for $KEY_NAME${NC}"
  fi
}

# Function to launch EC2 instance
launch_instance() {
  echo -e "${BLUE}Launching EC2 instance...${NC}"
  
  # Prepare user data if specified
  USER_DATA_PARAM=""
  if [ -n "$USER_DATA_FILE" ] && [ -f "$USER_DATA_FILE" ]; then
    USER_DATA_PARAM="--user-data file://$USER_DATA_FILE"
    echo -e "${GREEN}Using user data from file: $USER_DATA_FILE${NC}"
  fi
  
  # Prepare tags
  TAG_SPECIFICATIONS="ResourceType=instance,Tags=["
  # Add Name tag
  TAG_SPECIFICATIONS="${TAG_SPECIFICATIONS}{Key=Name,Value=$INSTANCE_NAME}"
  
  # Add additional tags if provided
  if [ -n "$TAGS" ]; then
    IFS=',' read -ra TAG_ARRAY <<< "$TAGS"
    for i in "${TAG_ARRAY[@]}"; do
      IFS='=' read -ra KV <<< "$i"
      if [ ${#KV[@]} -eq 2 ]; then
        TAG_SPECIFICATIONS="${TAG_SPECIFICATIONS},{Key=${KV[0]},Value=${KV[1]}}"
      fi
    done
  fi
  TAG_SPECIFICATIONS="${TAG_SPECIFICATIONS}]"
  
  # Launch the instance
  INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SG_ID" \
    --subnet-id "$SUBNET_ID" \
    --associate-public-ip-address \
    --block-device-mappings "[{\"DeviceName\":\"/dev/xvda\",\"Ebs\":{\"VolumeSize\":$VOLUME_SIZE,\"VolumeType\":\"gp3\"}}]" \
    --tag-specifications "$TAG_SPECIFICATIONS" \
    --region $REGION \
    $USER_DATA_PARAM \
    --query "Instances[0].InstanceId" \
    --output text)
  
  echo -e "${GREEN}Launched instance: $INSTANCE_ID${NC}"
  
  # Wait for the instance to be running
  echo -e "${BLUE}Waiting for instance to enter 'running' state...${NC}"
  aws ec2 wait instance-running \
    --instance-ids "$INSTANCE_ID" \
    --region $REGION
  
  echo -e "${GREEN}Instance is now running.${NC}"
}

# Function to get instance details
get_instance_details() {
  echo -e "${BLUE}Retrieving instance details...${NC}"
  
  # Get the public IP address
  PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query "Reservations[0].Instances[0].PublicIpAddress" \
    --region $REGION \
    --output text)
  
  # Get the private IP address
  PRIVATE_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query "Reservations[0].Instances[0].PrivateIpAddress" \
    --region $REGION \
    --output text)
  
  # Get the public DNS name
  PUBLIC_DNS=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --query "Reservations[0].Instances[0].PublicDnsName" \
    --region $REGION \
    --output text)
  
  echo -e "${GREEN}Instance details:${NC}"
  echo -e "  Instance ID: ${YELLOW}$INSTANCE_ID${NC}"
  echo -e "  Public IP: ${YELLOW}$PUBLIC_IP${NC}"
  echo -e "  Private IP: ${YELLOW}$PRIVATE_IP${NC}"
  echo -e "  Public DNS: ${YELLOW}$PUBLIC_DNS${NC}"
}

# Function to output connection info
output_connection_info() {
  echo -e "\n${BLUE}====== Connection Information ======${NC}"
  echo -e "${GREEN}SSH Command:${NC}"
  echo -e "  ${YELLOW}ssh -i \"${KEY_NAME}.pem\" ec2-user@$PUBLIC_IP${NC}"
  
  echo -e "\n${GREEN}Web Access:${NC}"
  echo -e "  HTTP: ${YELLOW}http://$PUBLIC_IP${NC}"
  echo -e "  HTTPS: ${YELLOW}https://$PUBLIC_IP${NC}"
  
  echo -e "\n${BLUE}====== Next Steps ======${NC}"
  echo -e "1. Connect to your instance using the SSH command above"
  echo -e "2. Deploy your application to the instance"
  echo -e "3. Set up DNS records to point to your instance IP: $PUBLIC_IP"
  
  # Save connection info to a file
  echo "Instance ID: $INSTANCE_ID" > entiendo-instance-info.txt
  echo "Public IP: $PUBLIC_IP" >> entiendo-instance-info.txt
  echo "Private IP: $PRIVATE_IP" >> entiendo-instance-info.txt
  echo "Public DNS: $PUBLIC_DNS" >> entiendo-instance-info.txt
  echo "SSH Command: ssh -i \"${KEY_NAME}.pem\" ec2-user@$PUBLIC_IP" >> entiendo-instance-info.txt
  
  echo -e "\n${GREEN}Connection information saved to entiendo-instance-info.txt${NC}"
}

# Main execution
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}= Entiendo EC2 Launch Script         =${NC}"
echo -e "${BLUE}======================================${NC}"

# Set up AWS resources
if [ -z "$VPC_ID" ]; then
  get_default_vpc
fi

if [ -z "$SUBNET_ID" ]; then
  get_public_subnet
fi

if [ -z "$AMI_ID" ]; then
  get_latest_ami
fi

ensure_key_pair
create_security_group
launch_instance
get_instance_details
output_connection_info

echo -e "\n${GREEN}EC2 instance successfully launched for Entiendo application!${NC}"
