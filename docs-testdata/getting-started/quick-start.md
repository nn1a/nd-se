# Quick Start Guide

Get up and running with our system in just a few minutes! This guide will help you set up a basic working environment.

:::tip Time to Complete
⏱️ Estimated time: 5-10 minutes
:::

## Before You Start

Make sure you have completed the [Installation Guide](installation) first.

## Step-by-Step Quick Start

### 1. Verify Installation

First, let's make sure everything is working:

```bash
# Check Node.js version
node --version
# Should output v18.x.x or higher

# Check Python version  
python --version
# Should output Python 3.8.x or higher

# Check if MongoDB is running
mongo --eval "db.runCommand('ping')"
# Should output: { "ok" : 1 }
```

### 2. Start the Development Servers

Use our convenient start script:

```bash
./start-dev.sh
```

This will:
- Start MongoDB (if using Docker)
- Launch the FastAPI backend
- Launch the Next.js frontend

### 3. Access the Application

Once the servers are running, open your browser and navigate to:

- **Main App**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Create Your First User

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Fill in the registration form
3. Click "Create Account"
4. You should be redirected to the dashboard

### 5. Explore the Documentation

1. Navigate to [http://localhost:3000/docs](http://localhost:3000/docs)
2. Browse through the available documentation
3. Try the search functionality
4. Test the navigation menu

## Quick Tasks to Try

### Task 1: Create a New Document

```bash
# Using the API
curl -X POST "http://localhost:8000/api/docs" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-first-doc",
    "title": "My First Document",
    "content": "# Hello World\n\nThis is my first document!"
  }'
```

### Task 2: Test the Dashboard

1. Login to your account
2. Visit the dashboard at [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
3. Explore the different sections
4. Try changing your profile settings

### Task 3: API Integration

Test the API endpoints:

```javascript
// Fetch all documents
fetch('http://localhost:8000/api/docs')
  .then(response => response.json())
  .then(data => console.log(data))

// Get a specific document
fetch('http://localhost:8000/api/docs/getting-started')
  .then(response => response.json())
  .then(data => console.log(data))
```

## What's Working?

After completing this quick start, you should have:

- ✅ A running development environment
- ✅ A registered user account
- ✅ Access to the documentation system
- ✅ A working dashboard
- ✅ API endpoints responding correctly

## Common Quick Start Issues

### Frontend won't start
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend API errors
```bash
# Check the backend logs
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --log-level debug
```

### Database connection issues
```bash
# Restart MongoDB
docker restart mongodb

# Or if installed manually
sudo systemctl restart mongod  # Linux
brew services restart mongodb  # macOS
```

:::info What's Next?
Now that you have a working setup, you can:

- 📚 Learn about [Configuration](configuration)
- 🎨 Customize the [Frontend](guides/frontend/overview)
- ⚙️ Extend the [Backend](guides/backend/overview)
- 🔌 Explore the [API](api/overview)
:::

## Getting Help

Stuck? Here's how to get help:

1. **Check the logs** - Look for error messages in your terminal
2. **Review the docs** - Check our comprehensive guides
3. **Search issues** - Look through GitHub issues
4. **Ask the community** - Join our Discord server

:::tip Pro Tip
Keep your development servers running in separate terminal windows so you can see the logs and debug any issues that arise!
:::

## Ready for More?

Great job! You now have a working development environment. Here are some recommended next steps:

1. 🛠️ [Development Workflow](guides/development-workflow)
2. 🎨 [Customizing the UI](guides/frontend/customization)
3. 📊 [Working with Data](guides/backend/data-management)
4. 🚀 [Deployment Guide](guides/deployment)
