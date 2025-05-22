#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if a variable name was provided
if [ $# -eq 0 ]; then
  echo -e "${RED}Error: No variable name provided.${NC}"
  echo "Usage: $0 VARIABLE_NAME [KEY_FILE_PATH] [APP_DIR]"
  echo "Example: $0 OPENAI_API_KEY /path/to/entiendo-key.pem /home/ec2-user/entiendo"
  exit 1
fi

VAR_NAME=$1
KEY_FILE_PATH=${2:-"entiendo-key.pem"}  # Default to entiendo-key.pem in current directory
APP_DIR=${3:-"/home/ec2-user/entiendo"}  # Default app directory on EC2
ENV_FILE_PATH="$APP_DIR/src/client/.env"  # Full path to .env file

# Check if the variable exists in the environment
if [ -z "${!VAR_NAME}" ]; then
  echo -e "${RED}Error: Variable $VAR_NAME is not set in your environment.${NC}"
  exit 1
fi

VAR_VALUE="${!VAR_NAME}"

# Function to update SSM Parameter Store
update_ssm() {
  echo -e "${BLUE}Updating AWS SSM Parameter Store...${NC}"
  
  # Set AWS region if not already configured
  if [ -z "$AWS_REGION" ]; then
    AWS_REGION=$(aws configure get region)
    if [ -z "$AWS_REGION" ]; then
      echo -e "${YELLOW}AWS region not found. Skipping SSM update.${NC}"
      return
    fi
  fi
  
  # Update parameter in SSM
  aws ssm put-parameter \
    --name "/entiendo/production/$VAR_NAME" \
    --value "$VAR_VALUE" \
    --type "SecureString" \
    --overwrite

  echo -e "${GREEN}Updated SSM parameter: /entiendo/production/$VAR_NAME${NC}"
}

# Function to update the .env file on EC2
update_ec2_env() {
  echo -e "${BLUE}Updating .env file on EC2 instance...${NC}"
  
  # Check if key file exists
  if [ ! -f "$KEY_FILE_PATH" ]; then
    echo -e "${RED}Error: Key file '$KEY_FILE_PATH' not found.${NC}"
    echo "Please provide the correct path to the key file."
    return
  fi
  
  # Check key file permissions and fix if needed
  KEY_PERMS=$(stat -f "%Lp" "$KEY_FILE_PATH")
  if [ "$KEY_PERMS" != "400" ]; then
    echo -e "${YELLOW}Warning: Key file has incorrect permissions. Fixing...${NC}"
    chmod 400 "$KEY_FILE_PATH"
  fi
  
  EC2_HOST="ec2-user@52.67.65.76"
  
  # Check if we can connect to the EC2 instance
  echo -e "${BLUE}Testing connection to EC2 instance...${NC}"
  if ! ssh -i "$KEY_FILE_PATH" -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=5 $EC2_HOST "echo 2>&1 > /dev/null"; then
    echo -e "${RED}Error: Cannot connect to EC2 instance.${NC}"
    echo "Make sure the key file is correct and the EC2 instance is running."
    return
  fi
  
  # Update the .env file on the EC2 instance
  echo -e "${BLUE}Connecting to EC2 instance to update .env file...${NC}"
  ssh -i "$KEY_FILE_PATH" $EC2_HOST "
    # Check if .env file exists
    if [ -f $ENV_FILE_PATH ]; then
      # Check if variable already exists in .env
      if grep -q \"^$VAR_NAME=\" $ENV_FILE_PATH; then
        # Replace the value
        sed -i \"s|^$VAR_NAME=.*|$VAR_NAME=$VAR_VALUE|\" $ENV_FILE_PATH
      else
        # Add the variable
        echo \"$VAR_NAME=$VAR_VALUE\" >> $ENV_FILE_PATH
      fi
    else
      # Create .env file if it doesn't exist
      mkdir -p $(dirname $ENV_FILE_PATH)
      echo \"$VAR_NAME=$VAR_VALUE\" > $ENV_FILE_PATH
    fi
    echo 'Updated .env file successfully'
  "
  
  echo -e "${GREEN}Updated .env file on EC2 instance${NC}"
  
  # Restart the application if it's managed by PM2
  echo -e "${BLUE}Attempting to restart application...${NC}"
  ssh -i "$KEY_FILE_PATH" $EC2_HOST "
    if command -v pm2 &> /dev/null && pm2 list | grep -q entiendo; then
      pm2 restart entiendo
      echo 'Application restarted'
    else
      echo 'PM2 not found or application not running with PM2. Manual restart may be required.'
    fi
  " || echo -e "${YELLOW}Could not restart application. Manual restart may be required.${NC}"
}

# Function to update GitHub secrets
update_github_secret() {
  echo -e "${BLUE}Updating GitHub secret...${NC}"
  
  # Check if gh CLI is installed
  if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from https://cli.github.com/"
    return
  fi
  
  # Check if user is authenticated with GitHub
  if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}You need to authenticate with GitHub first.${NC}"
    echo "Run: gh auth login"
    return
  fi
  
  # Get repository information
  REPO=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\).git/\1/')
  
  if [ -z "$REPO" ]; then
    echo -e "${YELLOW}Not in a git repository or GitHub repository not configured.${NC}"
    echo "Please provide the repository in format owner/repo:"
    read -p "> " REPO
  fi
  
  # Set the secret
  echo -e "${BLUE}Setting secret $VAR_NAME for repository $REPO...${NC}"
  if gh secret set "$VAR_NAME" --body "$VAR_VALUE" --repo "$REPO"; then
    echo -e "${GREEN}Successfully set GitHub secret: $VAR_NAME${NC}"
  else
    echo -e "${RED}Failed to set GitHub secret.${NC}"
  fi
}

# Main execution
echo -e "${BLUE}Pushing secret $VAR_NAME to multiple platforms...${NC}"

# Update SSM Parameter Store
update_ssm

# Update EC2 .env file
update_ec2_env

# Update GitHub secret
update_github_secret

echo -e "${GREEN}All operations completed!${NC}" 