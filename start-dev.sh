#!/bin/bash

# Start the backend server
echo "Starting backend server..."
cd server && npm run dev &

# Wait a moment for backend to start
sleep 3

# Start the frontend server
echo "Starting frontend server..."
cd .. && npm run dev &

# Wait for both servers
wait
