#!/bin/zsh
# Script to create a DynamoDB table called 'Settings' with 'settingsId' as the primary key
# Usage: ./create-settings-table.sh

# Set the table name
TABLE_NAME="Settings"

# Create the table
aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=settingsId,AttributeType=S \
    --key-schema AttributeName=settingsId,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

echo "DynamoDB table '$TABLE_NAME' created with primary key 'settingsId' (string)."
