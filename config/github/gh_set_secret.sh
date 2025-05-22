# Set credentials as GitHub repository secrets

#
# SEE ALSO:
# ../aws/push_secret.sh
#

# List of all environment variables to set as secrets
VARIABLES=(
  "AWS_ACCESS_KEY_ID"
  "AWS_REGION"
  "AWS_SECRET_ACCESS_KEY"
  "AZURE_DEFAULT_VOICE"
  "AZURE_ENDPOINT"
  "AZURE_SPEECH_KEY"
  "AZURE_SPEECH_REGION"
  "GOOGLE_API_KEY"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "OPENAI_API_KEY"
  "OPENAI_MODEL"
  "SESSION_SECRET"
  "SPEECH_KEY"
  "SPEECH_REGION"
)

# Loop through each variable
for VAR_NAME in "${VARIABLES[@]}"; do
  # Get the value using indirect reference
  VAR_VALUE="${!VAR_NAME}"
  
  # Check if the variable is set
  if [ -n "${VAR_VALUE}" ]; then
    # For sensitive values, don't echo the actual value
    if [[ "${VAR_NAME}" == *"KEY"* || "${VAR_NAME}" == *"SECRET"* ]]; then
      echo "Setting ${VAR_NAME}"
    else
      echo "Setting ${VAR_NAME}: ${VAR_VALUE}"
    fi
    
    # Set the GitHub secret
    gh secret set "${VAR_NAME}" -b"${VAR_VALUE}"
  fi
done

