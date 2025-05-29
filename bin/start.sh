#!/bin/bash

# This script is used to start the Kreslidlo app.
# It is used to pull the latest changes from the git repository,
# install the npm dependencies, and restart the Node.js app service.

cd ~/kreslidlo

# Create logs directory if it doesn't exist
mkdir -p logs

echo "---- Startup initiated at $(date) ----" >> logs/startup.log

# Keep log file from growing too large by limiting to last 1000 lines
if [ -f logs/startup.log ]; then
    tail -n 1000 logs/startup.log > logs/startup.log.tmp
    mv logs/startup.log.tmp logs/startup.log
fi

# Pull the latest changes
git pull origin master >> logs/startup.log 2>&1

# Install npm dependencies
npm install >> logs/startup.log 2>&1

# Restart the Node.js app service
sudo systemctl restart kreslidlo-app.service

echo "---- Startup complete at $(date) ----" >> logs/startup.log