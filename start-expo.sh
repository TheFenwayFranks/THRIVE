#!/bin/bash
cd /home/user/webapp

# Kill any processes on ports that might conflict
pkill -f "expo"
pkill -f "metro"

# Start expo with automatic yes responses using expect
expect << EOF
spawn npx expo start --web --port 8083
expect {
    "Use port 8083 instead?" { send "y\r"; exp_continue }
    "Would you like to run the app in a web browser?" { send "n\r"; exp_continue }
    timeout { exit 1 }
    eof
}
EOF