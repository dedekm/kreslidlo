#!/bin/bash

cd ~/kreslidlo

# Create logs directory if it doesn't exist
mkdir -p logs

echo "---- Git Pull at $(date) ----" >> logs/startup.log

# Pull the latest changes
git pull origin master >> logs/startup.log 2>&1

echo "---- Git Pull complete at $(date) ----" >> logs/startup.log

# Install npm dependencies
npm install >> logs/startup.log 2>&1

# Restart the Node.js app service
sudo systemctl restart kreslidlo-app.service

echo "---- Startup complete at $(date) ----" >> logs/startup.log