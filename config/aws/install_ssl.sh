#!/bin/bash

# Entiendo SSL Installation Script
# Script to install Let's Encrypt SSL for the Entiendo application

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables - Set these before running or pass as environment variables
DOMAIN=${DOMAIN:-"****YOUR DOMAIN HERE****"}

# Function to install SSL with Let's Encrypt
install_ssl() {
  if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}No domain provided. Skipping SSL installation.${NC}"
    return 1
  fi
  
  echo -e "${BLUE}Installing Let's Encrypt SSL for $DOMAIN...${NC}"
  
  # Check if certbot is installed
  if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Certbot not found. Installing certbot...${NC}"
    # Check distribution type
    if command -v apt-get &> /dev/null; then
      # For Debian/Ubuntu
      sudo apt-get update
      sudo apt-get install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
      # For CentOS/RHEL/Amazon Linux
      sudo yum install -y epel-release
      sudo yum install -y certbot python3-certbot-nginx
    elif command -v dnf &> /dev/null; then
      # For Fedora/newer RHEL
      sudo dnf install -y certbot python3-certbot-nginx
    else
      echo -e "${RED}Could not determine package manager. Please install certbot manually.${NC}"
      return 1
    fi
    echo -e "${GREEN}Certbot installed successfully.${NC}"
  fi
  
  # Use admin@domain.com as default contact
  EMAIL="admin@${DOMAIN}"
  
  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL || (
    echo -e "${YELLOW}SSL installation failed. Your domain may not be pointed to this server yet.${NC}"
    echo -e "${YELLOW}You can install SSL later with: sudo certbot --nginx${NC}"
    return 1
  )
  
  echo -e "${GREEN}SSL installed.${NC}"
  
  # Setup automatic renewal
  echo -e "${BLUE}Setting up automatic SSL renewal...${NC}"
  
  # Try to enable certbot timer (systemd)
  if systemctl list-unit-files | grep -q certbot.timer; then
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
    echo -e "${GREEN}SSL renewal scheduled using systemd timer.${NC}"
  else
    # Fallback to cron
    echo -e "${YELLOW}Systemd timer not found. Trying alternative renewal methods...${NC}"
    
    # Check if crontab exists
    if command -v crontab &> /dev/null; then
      # Check if crontab entry already exists
      if ! sudo crontab -l 2>/dev/null | grep -q 'certbot renew'; then
        # Add to root's crontab (runs twice daily at random times to avoid peak hours)
        (sudo crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet") | sudo crontab -
        echo -e "${GREEN}Cron job added to renew certificates twice daily.${NC}"
      else
        echo -e "${GREEN}Cron job for certificate renewal already exists.${NC}"
      fi
    else
      # Create a renewal script if crontab is not available
      echo -e "${YELLOW}Crontab not found. Creating a renewal script in /etc/cron.daily/...${NC}"
      
      # Create a daily renewal script
      RENEWAL_SCRIPT="/etc/cron.daily/certbot-renew"
      echo '#!/bin/sh' | sudo tee $RENEWAL_SCRIPT > /dev/null
      echo 'certbot renew --quiet' | sudo tee -a $RENEWAL_SCRIPT > /dev/null
      sudo chmod +x $RENEWAL_SCRIPT
      
      if [ -f "$RENEWAL_SCRIPT" ] && [ -x "$RENEWAL_SCRIPT" ]; then
        echo -e "${GREEN}Daily renewal script created at $RENEWAL_SCRIPT${NC}"
      else
        echo -e "${RED}Failed to create renewal script. You will need to manually renew certificates.${NC}"
        echo -e "${YELLOW}To renew manually, run: sudo certbot renew${NC}"
      fi
    fi
  fi
  
  return 0
}

# Main execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo -e "${BLUE}======================================${NC}"
  echo -e "${BLUE}= Entiendo SSL Installation Script   =${NC}"
  echo -e "${BLUE}======================================${NC}"
  
  # Run SSL installation
  install_ssl
fi 