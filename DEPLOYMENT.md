# 🚀 Hausly - Heroku Deployment Guide

This guide will help you deploy your Hausly home services application to Heroku.

## 📋 Prerequisites

1. **Heroku Account**: [Sign up for free](https://signup.heroku.com/)
2. **Heroku CLI**: [Install Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Make sure your project is in a Git repository
4. **MongoDB Atlas**: Set up a cloud MongoDB database
5. **Firebase Project**: For authentication

## 🔧 Quick Setup Commands

### 1. Install Heroku CLI and Login
```bash
# Install Heroku CLI (if not already installed)
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login
```

### 2. Create Heroku App
```bash
# Create a new Heroku app (replace 'your-app-name' with your desired name)
heroku create your-hausly-app

# Or if you want Heroku to generate a name
heroku create
```

### 3. Set Environment Variables
```bash
# MongoDB Connection
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/hausly?retryWrites=true&w=majority"

# Server Configuration
heroku config:set NODE_ENV=production
heroku config:set PORT=5001

# Client URL (replace with your actual Heroku app URL)
heroku config:set CLIENT_URL="https://your-hausly-app.herokuapp.com"

# Firebase Configuration (get these from Firebase Console)
heroku config:set FIREBASE_PROJECT_ID="your-firebase-project-id"
heroku config:set FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your-private-key-here
-----END PRIVATE KEY-----"
```

### 4. Deploy to Heroku
```bash
# Add Heroku remote (if not automatically added)
heroku git:remote -a your-hausly-app

# Push to Heroku
git push heroku main

# Or if your default branch is 'master'
git push heroku master
```

### 5. Open Your App
```bash
# Open your deployed app in browser
heroku open
```

## 🛠️ Environment Variables Setup

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Heroku
5. Get your connection string

### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Generate new private key
5. Use the credentials in environment variables

## 📱 Client Configuration

Update your client-side API calls to use relative URLs in production:

```javascript
// In your API service files, use:
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production
  : 'http://localhost:5001/api';
```

## 🔍 Monitoring and Debugging

### View Logs
```bash
# View real-time logs
heroku logs --tail

# View specific number of lines
heroku logs -n 500
```

### Monitor App
```bash
# Check app status
heroku ps

# Check dyno usage
heroku ps:scale
```

### Restart App
```bash
# Restart all dynos
heroku restart
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **App Crashes**: Check logs with `heroku logs --tail`
3. **Database Connection**: Verify MongoDB URI and whitelist Heroku IPs
4. **Firebase Issues**: Check environment variables are set correctly

### Quick Fixes

```bash
# If build fails, try:
heroku config:set NPM_CONFIG_PRODUCTION=false

# Force rebuild:
heroku repo:reset -a your-app-name
git push heroku main

# Check environment variables:
heroku config
```

## 📊 Performance Optimization

### Enable Compression
The server already includes compression middleware for better performance.

### Database Optimization
- Use MongoDB indexes for frequently queried fields
- Enable connection pooling (already configured)

## 🔐 Security Checklist

- ✅ Environment variables are set (not hardcoded)
- ✅ MongoDB has authentication enabled
- ✅ Firebase rules are configured properly
- ✅ CORS is configured for production domain
- ✅ Sensitive files are in .gitignore

## 📞 Support

If you encounter issues:
1. Check the logs: `heroku logs --tail`
2. Verify environment variables: `heroku config`
3. Check Heroku status: [status.heroku.com](https://status.heroku.com)

## 🎉 Success!

Your Hausly app should now be live at: `https://your-app-name.herokuapp.com`

### Next Steps
- Set up custom domain (optional)
- Configure SSL certificate (automatic with Heroku)
- Set up monitoring and alerts
- Configure backup strategies 