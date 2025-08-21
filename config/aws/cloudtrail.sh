#!/bin/bash

# enable_cloudtrail_logging.sh
# Enables AWS CloudTrail logging for all regions in your account.
# Requires: awscli

set -euo pipefail

TRAIL_NAME="Default-Organization-Trail"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
S3_BUCKET_NAME="cloudtrail-logs-$ACCOUNT_ID-$REGION"

echo "Creating S3 bucket for CloudTrail logs: $S3_BUCKET_NAME"
# Create S3 bucket (ignore error if it exists)
aws s3api create-bucket --bucket "$S3_BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || true

# Set S3 bucket policy for CloudTrail
cat > /tmp/cloudtrail-bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AWSCloudTrailAclCheck",
      "Effect": "Allow",
      "Principal": { "Service": "cloudtrail.amazonaws.com" },
      "Action": "s3:GetBucketAcl",
      "Resource": "arn:aws:s3:::$S3_BUCKET_NAME"
    },
    {
      "Sid": "AWSCloudTrailWrite",
      "Effect": "Allow",
      "Principal": { "Service": "cloudtrail.amazonaws.com" },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/AWSLogs/$ACCOUNT_ID/*",
      "Condition": { "StringEquals": { "s3:x-amz-acl": "bucket-owner-full-control" } }
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$S3_BUCKET_NAME" --policy file:///tmp/cloudtrail-bucket-policy.json

echo "Enabling CloudTrail logging with trail: $TRAIL_NAME"
# Create CloudTrail trail (ignore error if it exists)
aws cloudtrail create-trail --name "$TRAIL_NAME" --s3-bucket-name "$S3_BUCKET_NAME" --is-multi-region-trail 2>/dev/null || true

# Start logging
aws cloudtrail start-logging --name "$TRAIL_NAME"

echo "CloudTrail logging enabled for all regions. Logs will be delivered to: $S3_BUCKET_NAME"