#!/bin/bash

# Generated script to create DynamoDB tables

aws dynamodb create-table \
  --table-name "EntendoUsers" \
  --attribute-definitions '[{"AttributeName":"userId","AttributeType":"S"}]' \
  --key-schema '[{"AttributeName":"userId","KeyType":"HASH"}]' \
  --provisioned-throughput "ReadCapacityUnits=0,WriteCapacityUnits=0" \
  --region sa-east-1

aws dynamodb create-table \
  --table-name "IdiomExamples" \
  --attribute-definitions '[{"AttributeName":"exampleId","AttributeType":"S"},{"AttributeName":"idiomId","AttributeType":"S"}]' \
  --key-schema '[{"AttributeName":"exampleId","KeyType":"HASH"}]' \
  --provisioned-throughput "ReadCapacityUnits=0,WriteCapacityUnits=0" \
  --global-secondary-indexes '[
  {
    "IndexName": "IdiomIndex",
    "KeySchema": [
      {
        "AttributeName": "idiomId",
        "KeyType": "HASH"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    },
    "ProvisionedThroughput": {
      "NumberOfDecreasesToday": 0,
      "ReadCapacityUnits": 0,
      "WriteCapacityUnits": 0
    }
  }
]' \
  --region sa-east-1

aws dynamodb create-table \
  --table-name "Idioms" \
  --attribute-definitions '[{"AttributeName":"idiomId","AttributeType":"S"}]' \
  --key-schema '[{"AttributeName":"idiomId","KeyType":"HASH"}]' \
  --provisioned-throughput "ReadCapacityUnits=0,WriteCapacityUnits=0" \
  --region sa-east-1

aws dynamodb create-table \
  --table-name "Prompts" \
  --attribute-definitions '[{"AttributeName":"PromptId","AttributeType":"S"}]' \
  --key-schema '[{"AttributeName":"PromptId","KeyType":"HASH"}]' \
  --provisioned-throughput "ReadCapacityUnits=5,WriteCapacityUnits=5" \
  --region sa-east-1

aws dynamodb create-table \
  --table-name "Settings" \
  --attribute-definitions '[{"AttributeName":"settingsId","AttributeType":"S"}]' \
  --key-schema '[{"AttributeName":"settingsId","KeyType":"HASH"}]' \
  --provisioned-throughput "ReadCapacityUnits=5,WriteCapacityUnits=5" \
  --region sa-east-1

aws dynamodb create-table \
  --table-name "UserIdiomProgress" \
  --attribute-definitions '[{"AttributeName":"idiomId","AttributeType":"S"},{"AttributeName":"nextDueDate","AttributeType":"N"},{"AttributeName":"progressId","AttributeType":"S"},{"AttributeName":"userId","AttributeType":"S"}]' \
  --key-schema '[{"AttributeName":"progressId","KeyType":"HASH"}]' \
  --provisioned-throughput "ReadCapacityUnits=0,WriteCapacityUnits=0" \
  --global-secondary-indexes '[
  {
    "IndexName": "UserIdiomIndex",
    "KeySchema": [
      {
        "AttributeName": "userId",
        "KeyType": "HASH"
      },
      {
        "AttributeName": "idiomId",
        "KeyType": "RANGE"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    },
    "ProvisionedThroughput": {
      "NumberOfDecreasesToday": 0,
      "ReadCapacityUnits": 0,
      "WriteCapacityUnits": 0
    }
  },
  {
    "IndexName": "UserIndex",
    "KeySchema": [
      {
        "AttributeName": "userId",
        "KeyType": "HASH"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    },
    "ProvisionedThroughput": {
      "NumberOfDecreasesToday": 0,
      "ReadCapacityUnits": 0,
      "WriteCapacityUnits": 0
    }
  },
  {
    "IndexName": "UserDueIndex",
    "KeySchema": [
      {
        "AttributeName": "userId",
        "KeyType": "HASH"
      },
      {
        "AttributeName": "nextDueDate",
        "KeyType": "RANGE"
      }
    ],
    "Projection": {
      "ProjectionType": "ALL"
    },
    "ProvisionedThroughput": {
      "NumberOfDecreasesToday": 0,
      "ReadCapacityUnits": 0,
      "WriteCapacityUnits": 0
    }
  }
]' \
  --region sa-east-1

