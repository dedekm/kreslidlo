#!/bin/bash

# Create logs directory if it doesn't exist
mkdir -p ~/kreslidlo/logs

echo "---- Git Pull at $(date) ----" >> ~/kreslidlo/logs/startup.log

# Pull the latest changes
git pull origin master >> ~/kreslidlo/logs/startup.log 2>&1

# Restart the Node.js app service
sudo systemctl restart kreslidlo-app.service