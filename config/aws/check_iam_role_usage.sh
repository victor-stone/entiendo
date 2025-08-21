#!/bin/bash

# check_iam_role_usage.sh
# Reports IAM roles in use by querying CloudTrail for AssumeRole events (last 36 hours), listing service-linked roles, and showing roles attached to Lambda, EC2, and ECS resources.
# Requires: awscli, jq

set -euo pipefail

REGION=$(aws configure get region)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Calculate start time for last 36 hours in ISO 8601 format
START_TIME=$(date -u -v-36H '+%Y-%m-%dT%H:%M:%SZ')

# 1. Query CloudTrail for AssumeRole events in the last 36 hours

echo "\n=== IAM Roles Used via CloudTrail AssumeRole Events (last 36 hours) ==="
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole --start-time "$START_TIME" --max-results 1000 --region "$REGION" \
  | jq -r '.Events[].CloudTrailEvent' \
  | jq -r '.requestParameters.roleArn' \
  | sort | uniq

# 2. List service-linked roles

echo "\n=== Service-Linked IAM Roles ==="
aws iam list-roles --query "Roles[?contains(RoleName, 'AWSServiceRole')].RoleName" --output text

# 3. List roles attached to Lambda functions

echo "\n=== IAM Roles Attached to Lambda Functions ==="
aws lambda list-functions --region "$REGION" --query 'Functions[*].{FunctionName:FunctionName,Role:Role}' --output table

# 4. List roles attached to EC2 instances (via instance profile)

echo "\n=== IAM Roles Attached to EC2 Instances ==="
aws ec2 describe-instances --region "$REGION" --query 'Reservations[*].Instances[*].IamInstanceProfile.Arn' --output text | sort | uniq

# 5. List roles attached to ECS tasks (via task role)

echo "\n=== IAM Roles Attached to ECS Task Definitions ==="
TASK_DEFS=$(aws ecs list-task-definitions --region "$REGION" --query 'taskDefinitionArns' --output text)
for TD_ARN in $TASK_DEFS; do
  ROLE=$(aws ecs describe-task-definition --task-definition "$TD_ARN" --region "$REGION" --query 'taskDefinition.taskRoleArn' --output text)
  if [[ "$ROLE" != "None" ]]; then
    echo "$TD_ARN uses $ROLE"
  fi
done

echo "\n=== Done. Review the above for all IAM roles in use. ==="
