#!/bin/bash

# This script is used to start the Kreslidlo app.
# It is used to pull the latest changes from the git repository,
# install the npm dependencies, and restart the Node.js app service.

cd ~/kreslidlo

# Create logs directory if it doesn't exist
mkdir -p logs

# Keep logs files from growing too large by limiting to last 100.000 lines
if [ -f logs/system.log ]; then
    tail -n 100000 logs/system.log > logs/system.log.tmp
    mv logs/system.log.tmp logs/system.log
fi

if [ -f logs/app.log ]; then
    tail -n 100000 logs/app.log > logs/app.log.tmp
    mv logs/app.log.tmp logs/app.log
fi

echo "---- Starting Kreslidlo at $(date) ----" >> logs/system.log

# Run the Node.js application
node app.js