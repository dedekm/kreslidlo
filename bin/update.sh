#!/bin/bash

# This script is used to start the Kreslidlo app.
# It is used to pull the latest changes from the git repository,
# install the npm dependencies, and restart the Node.js app service.

cd ~/kreslidlo

# Create logs directory if it doesn't exist
mkdir -p logs

echo "---- Update initiated at $(date) ----" >> logs/system.log

# Pull the latest changes
git pull origin master >> logs/system.log 2>&1

# Install npm dependencies
npm install >> logs/system.log 2>&1

# Restart the Node.js app service
sudo systemctl restart kreslidlo-app.service

echo "---- Update complete, restarting Kreslidlo at $(date) ----" >> logs/system.log