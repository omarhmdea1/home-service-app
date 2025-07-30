#!/bin/bash

# 🚀 Hausly - Deploy Environment Variables to Heroku
# This script helps transfer your .env variables to Heroku

echo "🚀 Hausly - Environment Variable Deployment Script"
echo "================================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged into Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Please login to Heroku first: heroku login"
    exit 1
fi

# Get app name
echo ""
read -p "Enter your Heroku app name: " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ App name cannot be empty"
    exit 1
fi

echo ""
echo "🔍 Looking for .env files..."

# Function to load and set environment variables
load_env_file() {
    local env_file="$1"
    local env_name="$2"
    
    if [ -f "$env_file" ]; then
        echo "✅ Found $env_file"
        echo "🚀 Setting $env_name environment variables..."
        
        # Read .env file and set variables (excluding comments and empty lines)
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip comments and empty lines
            if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
                continue
            fi
            
            # Extract key=value
            if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]// /}"
                value="${BASH_REMATCH[2]}"
                
                # Remove quotes if present
                value="${value%\"}"
                value="${value#\"}"
                value="${value%\'}"
                value="${value#\'}"
                
                echo "  Setting: $key"
                heroku config:set "$key=$value" --app "$APP_NAME"
            fi
        done < "$env_file"
        
        echo "✅ $env_name variables set successfully!"
    else
        echo "⚠️  $env_file not found"
    fi
}

# Load environment variables from different possible locations
load_env_file ".env" "Root"
load_env_file "server/.env" "Server"

echo ""
echo "🎉 Environment variable deployment complete!"
echo ""
echo "📋 To verify your variables were set correctly:"
echo "   heroku config --app $APP_NAME"
echo ""
echo "🚀 Ready to deploy:"
echo "   git push heroku main"
echo "" 