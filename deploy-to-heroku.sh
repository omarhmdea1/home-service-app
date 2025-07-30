#!/bin/bash

# 🚀 Hausly - Complete Heroku Deployment Script
# Replace 'hausly-home-services' with your preferred app name

APP_NAME="hausly-home-services"

echo "🚀 Deploying Hausly to Heroku..."
echo "================================"

# Step 1: Login and create app
echo "Step 1: Creating Heroku app..."
heroku login
heroku create $APP_NAME

# Step 2: Set environment variables
echo "Step 2: Setting environment variables..."

heroku config:set \
  NODE_ENV=production \
  PORT=5001 \
  MONGO_URI='mongodb+srv://HomeServeDB:omar1999@cluster0.9bceetl.mongodb.net/homeserviceapp?retryWrites=true&w=majority' \
  JWT_SECRET='your_jwt_secret_key_change_this' \
  FIREBASE_PROJECT_ID='home-serve-d3d4a' \
  FIREBASE_CLIENT_EMAIL='firebase-adminsdk-fbsvc@home-serve-d3d4a.iam.gserviceaccount.com' \
  CLIENT_URL="https://${APP_NAME}.herokuapp.com" \
  --app $APP_NAME

# Set Firebase private key (separate command for better formatting)
heroku config:set FIREBASE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+NH78ISziiU5z
YVxCZdzLsct4bilMdC2JncXO1m3m82lAoOsxXFtEexS0jI1AGN2dCZ+s37rODt3c
5jwT/EFpnL0UOV/cQs4IfAZ0lvQ0FYNMSHz2/kmLbuXHS6esfrCIHH1mTkkZq9Pm
yMl8ugIyLHqsRNtvhKmLmyRLPGlhCS8kbaR2hv27zNe05B822mPEzzI3bL06luKY
Z5eJbazQM28qvyYRe/kakqT6dXVojqNaJ1rPwObR3OaT/v1QJh3+red8ZGYwjmLf
Tz3A+eqeeYqF71+PiVm5hC9QiPSsihL3yu8807CO3T6t1O1Qk1km5i9fJviJYnmY
P1OtTLTTAgMBAAECggEAGZkPDfeZBtPbzwNnWzhCQtemvop03Gk2R7MIEBIjsFVJ
8Py3Kml3jvvRiYrw55NxH9VPvABQL7MogLYrl7T3SLNjbvlZwVbsS5AFfmNicjAC
/50x1DvcwfsmyW+RHVHfiDHtXntisyXA2upi03plGUOLLuwFbDi6aKN0evuiYwCR
zrknMp41+D89x+DOvmxEaEkcxKNerBaPFVmGPWSgPyZDfmgb684sb3ibB64PLzEt
c9QN1UlIw90DD55rkTAi2uGTlzfZKLZHyQ5oE55EuGf9cJDgs1x7EWEqxemE3x+4
tCefr1srbQssPhJh4+0JjbRmo9pcqVSXvBfY2jQVoQKBgQDwZPx5tdWB2+UiliN/
R8oHYQWZU8sHPViHNKLP/y5yjSLjeFecY+IHmAjW7WwUcVCMbgS582xRrvpVp0AZ
bkcPii1702Or7sunMAZjNAIDIQc+msSO50t9GyR9QbBxs+YMH740p07wcer2UgSE
awimMpyMWnioZXJwkdB3P9JZbwKBgQDKjW7nxRBvupoYEAx6VwB9OuBSe169yJ1Z
xFiWHOn2d1pO9Q6nZvOuePznPH1lOaQfXlVujPGbI+DbGB+9smUmhCmfTS8oEi0Q
69M2NfELZ0A0N9eI5o2NRLzrUmhHRv2pJ69F7vLZLzb59IZ0jkQRQ4btbk14jVHg
XswPzOKA3QKBgQC8pxO31CoM8et83ARZc5Ypektxi1+ue8cIvBb1UhY6UWZKyvs+
QOh1+yscuE/0LwT+X6yX3V9pLv9HzqwwCOn9WPvezALRP+JUfwzUN1FI8VeFGuIc
H4mPUYiuP6nfYUWsyBB1s8LwUQYKbk0bOgAcpWVThABibtKDYvsNSmmiQwKBgAjK
MnHkX1453s4EhEYa2G6Wy31I1UevGQT4PE/nWU/Uxhp/D++7y/9aSL9QJLDr229x
DIwLmcB9whg/58C3qSQOwC+ljdJTV5lQYo4LsTYpeOPLOJM8ThA/V2Nu5A+TyRY6
HqUORYOfROd78QnF0rZdE9Hh44LDvzXZZ0mYPowRAoGAPWS7YHLWMe9jWUJIokqn
WG3dz2DIru07HKLY2UNl4MT3PcON8OOlz01rDhCP6Fs5n4JHgKIDN1pJuDxjRQI/
qKXfbKDIsAqCn9Vw+/q8PgnZ/0JNOY/ABHuiFIgtB13q1T63Ok8TB4pdiLkIbevE
PIAYFQ4jPOVw63SLJvImf8w=
-----END PRIVATE KEY-----' --app $APP_NAME

# Step 3: Deploy
echo "Step 3: Deploying to Heroku..."
git push heroku main

# Step 4: Open app
echo "Step 4: Opening your live app..."
heroku open --app $APP_NAME

echo ""
echo "🎉 Deployment complete!"
echo "✅ Your Hausly app is live at: https://${APP_NAME}.herokuapp.com"
echo ""
echo "📋 Useful commands:"
echo "   heroku logs --tail --app $APP_NAME"
echo "   heroku config --app $APP_NAME"
echo "   heroku restart --app $APP_NAME" 