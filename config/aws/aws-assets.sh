#!/bin/bash

echo "AWS Resource List"
echo "================="

# S3 Buckets
echo -e "\nS3 Buckets:"
aws s3 ls | awk '{print $3}'

# EC2 Instances
echo -e "\nEC2 Instances:"
aws ec2 describe-instances --query 'Reservations[].Instances[].{Name:Tags[?Key==`Name`].Value|[0],InstanceId:InstanceId}' --output table

# RDS Databases
echo -e "\nRDS Databases:"
aws rds describe-db-instances --query 'DBInstances[].{DBName:DBName,Identifier:DBInstanceIdentifier}' --output table

# Lambda Functions
echo -e "\nLambda Functions:"
aws lambda list-functions --query 'Functions[].FunctionName' --output table

# DynamoDB Tables
echo -e "\nDynamoDB Tables:"
aws dynamodb list-tables --query 'TableNames' --output table

# CloudFormation Stacks
echo -e "\nCloudFormation Stacks:"
aws cloudformation list-stacks --query 'StackSummaries[?StackStatus!=`DELETE_COMPLETE`].StackName' --output table

# ECS Clusters
echo -e "\nECS Clusters:"
aws ecs list-clusters --query 'clusterArns[]' --output table

# IAM Roles
echo -e "\nIAM Roles:"
aws iam list-roles --query 'Roles[].RoleName' --output table

