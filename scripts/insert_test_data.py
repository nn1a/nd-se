#!/usr/bin/env python3
"""
MongoDB 테스트 데이터 삽입 스크립트
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import sys
import os

# MongoDB 연결 설정
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "nd_se_db"

# 테스트 문서 데이터
test_documents = [
    {
        "_id": "getting-started",
        "slug": "getting-started",
        "title": "Getting Started",
        "content": """# Getting Started

Welcome to our documentation! This guide will help you get up and running quickly.

## Overview

Our platform provides a comprehensive solution for building modern applications with cutting-edge technologies.

### Key Features

- **Fast Development**: Rapid prototyping and development capabilities
- **Scalable Architecture**: Built for scale from day one with microservices
- **Developer Friendly**: Intuitive APIs and comprehensive documentation
- **Modern Stack**: Using the latest technologies and best practices

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js 18+** - JavaScript runtime environment
2. **Python 3.8+** - For backend development
3. **MongoDB** - Database system
4. **Git** - Version control system
5. **A code editor** (we recommend VS Code)

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space minimum
- **Network**: Stable internet connection for package downloads

## Installation Process

Follow these steps to get started:

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/nd-se-platform.git
cd nd-se-platform
```

### Step 2: Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Step 3: Environment Configuration

Create environment files for both frontend and backend:

```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="ND-SE Platform"

# Backend .env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se_db
JWT_SECRET=your-secret-key-here
```

## Next Steps

Once installation is complete, you can:

1. [Start the development environment](quick-start)
2. [Configure your settings](configuration)
3. [Explore the API documentation](api-reference)
4. [Deploy to production](deployment)

## Getting Help

If you encounter any issues:

- Check our [Troubleshooting Guide](troubleshooting)
- Visit our [Community Forum](https://forum.example.com)
- Submit an issue on [GitHub](https://github.com/your-org/issues)

## What's Next?

Ready to dive deeper? Here are some recommended next steps:

- **For Developers**: Start with our [API Reference](api-reference)
- **For Designers**: Check out our [Design System](design-system)
- **For DevOps**: Review our [Deployment Guide](deployment)
""",
        "metadata": {
            "title": "Getting Started Guide",
            "description": "Complete guide to getting started with our platform",
            "category": "Introduction",
            "tags": ["setup", "installation", "beginner"],
            "author": "Documentation Team",
            "lastUpdated": datetime.utcnow().isoformat(),
            "readingTime": 8
        },
        "navigation": {
            "parent": None,
            "order": 1,
            "children": ["installation", "quick-start", "configuration"]
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": "installation",
        "slug": "installation", 
        "title": "Installation",
        "content": """# Installation Guide

This comprehensive guide covers all installation methods and system requirements.

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Windows 10, macOS 10.15, or Linux |
| **Node.js** | Version 18.0 or higher |
| **Python** | Version 3.8 or higher |
| **RAM** | 4GB minimum |
| **Storage** | 5GB free space |
| **Network** | Broadband internet connection |

### Recommended Requirements

For optimal performance, we recommend:

| Component | Recommendation |
|-----------|----------------|
| **OS** | Latest stable version |
| **Node.js** | Latest LTS version |
| **Python** | Version 3.11+ |
| **RAM** | 16GB or more |
| **Storage** | SSD with 20GB+ free space |
| **CPU** | Multi-core processor |

## Installation Methods

### Method 1: Automatic Installation (Recommended)

Use our automated installer script:

```bash
# Download and run installer
curl -fsSL https://install.example.com | bash
```

This script will:
- Check system requirements
- Install all dependencies
- Configure the environment
- Start the services

### Method 2: Manual Installation

#### Frontend Setup

```bash
# Clone repository
git clone https://github.com/your-org/nd-se-platform.git
cd nd-se-platform/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

#### Backend Setup

```bash
# Navigate to backend
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Database Setup

```bash
# Install MongoDB (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Method 3: Docker Installation

For containerized deployment:

```bash
# Clone repository
git clone https://github.com/your-org/nd-se-platform.git
cd nd-se-platform

# Start with Docker Compose
docker-compose up -d
```

## Configuration

### Environment Variables

#### Frontend Configuration

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="ND-SE Platform"
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_VERSION=1.0.0
```

#### Backend Configuration

```env
# .env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se_db
JWT_SECRET=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS settings
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_CREDENTIALS=true

# Upload settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## Verification

After installation, verify everything is working:

### 1. Check Node.js Version

```bash
node --version
# Should output v18.0.0 or higher
```

### 2. Check Python Version

```bash
python --version
# Should output Python 3.8.0 or higher
```

### 3. Verify MongoDB Connection

```bash
mongosh --eval "db.runCommand('ping')"
# Should output: { ok: 1 }
```

### 4. Test Frontend

```bash
cd frontend
npm run dev
# Visit http://localhost:3000
```

### 5. Test Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
# Visit http://localhost:8000/docs
```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 8000
npx kill-port 8000
```

#### MongoDB Connection Error

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

#### Permission Errors

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Fix Python permissions
sudo chown -R $(whoami) ./venv
```

## Advanced Configuration

### Performance Tuning

For production environments:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Optimize MongoDB
# Edit /etc/mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
```

### Security Hardening

```bash
# Generate secure JWT secret
openssl rand -base64 64

# Set secure file permissions
chmod 600 .env
chmod 600 .env.local
```

## Next Steps

Installation complete? Great! Now you can:

1. [Follow the Quick Start guide](quick-start)
2. [Configure your environment](configuration)
3. [Learn about the architecture](architecture)
""",
        "metadata": {
            "title": "Installation Guide",
            "description": "Complete installation instructions for all platforms",
            "category": "Setup",
            "tags": ["installation", "setup", "configuration"],
            "author": "DevOps Team",
            "lastUpdated": datetime.utcnow().isoformat(),
            "readingTime": 12
        },
        "navigation": {
            "parent": "getting-started",
            "order": 1,
            "children": []
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": "quick-start",
        "slug": "quick-start",
        "title": "Quick Start",
        "content": """# Quick Start Guide

Get up and running with our platform in just a few minutes!

## Prerequisites

Before starting, make sure you have completed the [installation process](installation).

## Step 1: Start the Development Environment

Our platform includes a convenient startup script:

```bash
# Make script executable
chmod +x start-dev.sh

# Start all services
./start-dev.sh
```

This will start:
- MongoDB database
- FastAPI backend server (port 8000)
- Next.js frontend server (port 3000)

## Step 2: Access the Application

Once all services are running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Step 3: Create Your First User

### Using the Web Interface

1. Navigate to http://localhost:3000
2. Click "Sign Up" in the top navigation
3. Fill out the registration form:
   - **Email**: your-email@example.com
   - **Password**: Choose a secure password
   - **Name**: Your full name
4. Click "Create Account"

### Using the API

You can also create a user via the API:

```bash
curl -X POST "http://localhost:8000/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "securepassword123",
    "name": "Test User"
  }'
```

## Step 4: Explore the Dashboard

After logging in, you'll see the main dashboard with:

### Navigation Sidebar
- **Dashboard**: Overview and analytics
- **Documents**: Technical documentation
- **Blog**: Articles and updates  
- **Projects**: Your projects and repositories
- **Settings**: Account and preferences

### Key Features

#### Document Management
- Create, edit, and organize documentation
- Markdown support with live preview
- Version control integration
- Collaborative editing

#### Analytics Dashboard
- User activity tracking
- Document view statistics
- Performance metrics
- Custom reports

#### Project Management
- Repository integration
- Issue tracking
- Progress monitoring
- Team collaboration

## Step 5: Create Your First Document

### Via Web Interface

1. Navigate to **Documents** in the sidebar
2. Click **"New Document"**
3. Enter document details:
   - **Title**: "My First Document"
   - **Slug**: "my-first-document"
   - **Category**: "Tutorial"
4. Write content in Markdown:

```markdown
# My First Document

This is my first document on the platform!

## Features I'm Exploring

- **Markdown Support**: Easy formatting
- **Syntax Highlighting**: Code blocks look great
- **Live Preview**: See changes instantly

## Code Example

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("World"));
```

5. Click **"Save"** to publish

### Via API

```bash
curl -X POST "http://localhost:8000/docs" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "title": "My First API Document",
    "slug": "my-first-api-document", 
    "content": "# API Document\\n\\nCreated via API!",
    "metadata": {
      "category": "API",
      "tags": ["api", "tutorial"]
    }
  }'
```

## Step 6: Customize Your Experience

### Theme Settings

1. Go to **Settings** → **Appearance**
2. Choose your preferred theme:
   - **Light Theme**: Clean and bright
   - **Dark Theme**: Easy on the eyes
   - **Auto**: Follows system preference

### Notification Preferences

1. Go to **Settings** → **Notifications**
2. Configure:
   - Email notifications
   - In-app notifications
   - Document updates
   - System alerts

## Development Workflow

### Making Changes

#### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Start development server
npm run dev

# Make changes to files in:
# - app/ (Next.js pages)
# - components/ (React components)
# - lib/ (Utilities)
```

#### Backend Development

```bash
# Navigate to backend
cd backend

# Activate virtual environment
source venv/bin/activate

# Start with auto-reload
uvicorn app.main:app --reload

# Make changes to files in:
# - app/routers/ (API endpoints)
# - app/models/ (Data models)
# - app/services/ (Business logic)
```

### Database Operations

```bash
# Connect to MongoDB
mongosh nd_se_db

# View collections
show collections

# Query documents
db.documents.find().pretty()

# Create index
db.documents.createIndex({ "slug": 1 })
```

## Common Tasks

### Adding New API Endpoints

1. Create router file: `backend/app/routers/new_feature.py`
2. Define endpoints with FastAPI decorators
3. Add router to main app in `main.py`
4. Update API documentation

### Creating New Frontend Pages

1. Create page file: `frontend/app/new-page/page.tsx`
2. Implement React component
3. Add navigation links
4. Style with Tailwind CSS

### Managing Environment Variables

```bash
# Frontend environment
echo "NEXT_PUBLIC_FEATURE_FLAG=enabled" >> .env.local

# Backend environment  
echo "NEW_CONFIG_SETTING=value" >> .env
```

## Testing Your Setup

### Frontend Tests

```bash
cd frontend
npm test
```

### Backend Tests

```bash
cd backend
pytest
```

### Integration Tests

```bash
# Test API endpoints
curl http://localhost:8000/health

# Test frontend rendering
curl http://localhost:3000
```

## Next Steps

Now that you're up and running:

1. **[Learn the Architecture](architecture)** - Understand system design
2. **[API Reference](api-reference)** - Explore all endpoints  
3. **[Advanced Configuration](configuration)** - Customize settings
4. **[Deployment Guide](deployment)** - Go to production
5. **[Contributing](contributing)** - Join our community

## Getting Help

Need assistance? Here are your options:

- **Documentation**: Browse our comprehensive guides
- **Community Forum**: Connect with other users
- **GitHub Issues**: Report bugs or request features
- **Support Email**: contact@example.com

Happy coding! 🚀
""",
        "metadata": {
            "title": "Quick Start Guide",
            "description": "Get up and running quickly with step-by-step instructions",
            "category": "Tutorial", 
            "tags": ["quickstart", "tutorial", "getting-started"],
            "author": "Documentation Team",
            "lastUpdated": datetime.utcnow().isoformat(),
            "readingTime": 15
        },
        "navigation": {
            "parent": "getting-started",
            "order": 2,
            "children": []
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "_id": "api-reference",
        "slug": "api-reference",
        "title": "API Reference",
        "content": """# API Reference

Complete reference for all API endpoints and functionality.

## Authentication

All API requests require authentication via JWT tokens.

### Get Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Using Authentication

Include the token in the Authorization header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Documents API

### List Documents

```http
GET /docs
Authorization: Bearer {token}
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search in title and content

**Response:**
```json
{
  "documents": [
    {
      "id": "getting-started",
      "slug": "getting-started", 
      "title": "Getting Started",
      "metadata": {
        "category": "Introduction",
        "tags": ["setup", "beginner"],
        "lastUpdated": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "pages": 3
}
```

### Get Document

```http
GET /docs/{slug}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "getting-started",
  "slug": "getting-started",
  "title": "Getting Started", 
  "content": "# Getting Started\\n\\nWelcome...",
  "metadata": {
    "category": "Introduction",
    "tags": ["setup", "beginner"],
    "author": "Documentation Team",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "readingTime": 8
  },
  "navigation": {
    "parent": null,
    "order": 1,
    "children": ["installation", "quick-start"]
  }
}
```

### Create Document

```http
POST /docs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Document",
  "slug": "new-document",
  "content": "# New Document\\n\\nContent here...",
  "metadata": {
    "category": "Tutorial",
    "tags": ["new", "guide"]
  }
}
```

### Update Document

```http
PUT /docs/{slug}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Document",
  "content": "# Updated Content\\n\\nNew content...",
  "metadata": {
    "category": "Tutorial",
    "tags": ["updated", "guide"]
  }
}
```

### Delete Document

```http
DELETE /docs/{slug}
Authorization: Bearer {token}
```

## Users API

### Get Current User

```http
GET /users/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "created_at": "2024-01-01T00:00:00Z",
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}
```

### Update User Profile

```http
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "settings": {
    "theme": "light",
    "notifications": false
  }
}
```

### Change Password

```http
POST /users/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

## Analytics API

### Get Overview Stats

```http
GET /analytics/overview
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_documents": 45,
  "total_users": 12,
  "total_views": 1250,
  "recent_activity": [
    {
      "type": "document_created",
      "user": "John Doe",
      "document": "New Tutorial",
      "timestamp": "2024-01-15T14:30:00Z"
    }
  ]
}
```

### Get Document Analytics

```http
GET /analytics/documents/{slug}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "slug": "getting-started",
  "views": {
    "total": 150,
    "last_30_days": 45,
    "daily": [
      {"date": "2024-01-15", "views": 12},
      {"date": "2024-01-14", "views": 8}
    ]
  },
  "engagement": {
    "avg_time_on_page": 180,
    "bounce_rate": 0.25
  }
}
```

## Blog API

### List Blog Posts

```http
GET /blog
Authorization: Bearer {token}
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `published` (optional): Filter by published status
- `author` (optional): Filter by author

**Response:**
```json
{
  "posts": [
    {
      "id": "post123",
      "slug": "introduction-to-platform",
      "title": "Introduction to Our Platform",
      "excerpt": "Learn about the key features...",
      "author": "Jane Smith",
      "published_at": "2024-01-15T12:00:00Z",
      "tags": ["introduction", "platform"]
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 2
}
```

### Get Blog Post

```http
GET /blog/{slug}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "post123",
  "slug": "introduction-to-platform",
  "title": "Introduction to Our Platform",
  "content": "# Introduction\\n\\nWelcome to our platform...",
  "author": "Jane Smith",
  "published_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T15:30:00Z",
  "tags": ["introduction", "platform"],
  "featured_image": "/images/intro-platform.jpg"
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request data validation failed |
| `UNAUTHORIZED` | Invalid or missing authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Requested resource not found |
| `DUPLICATE_ERROR` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## Rate Limiting

API endpoints are rate limited:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## Webhooks

Subscribe to events via webhooks:

### Available Events

- `document.created`
- `document.updated`
- `document.deleted`
- `user.registered`
- `user.updated`

### Configure Webhook

```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["document.created", "document.updated"],
  "secret": "webhook_secret_key"
}
```

### Webhook Payload

```json
{
  "event": "document.created",
  "data": {
    "document": {
      "id": "new-doc",
      "title": "New Document",
      "author": "user@example.com"
    }
  },
  "timestamp": "2024-01-15T14:30:00Z"
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install nd-se-sdk
```

```javascript
import { NDSEClient } from 'nd-se-sdk';

const client = new NDSEClient({
  apiUrl: 'http://localhost:8000',
  token: 'your-jwt-token'
});

// Get documents
const docs = await client.documents.list();

// Create document
const newDoc = await client.documents.create({
  title: 'New Document',
  content: 'Content here...'
});
```

### Python

```bash
pip install nd-se-python
```

```python
from nd_se import Client

client = Client(
    api_url='http://localhost:8000',
    token='your-jwt-token'
)

# Get documents
docs = client.documents.list()

# Create document
new_doc = client.documents.create(
    title='New Document',
    content='Content here...'
)
```

## OpenAPI Specification

The complete API specification is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json
""",
        "metadata": {
            "title": "API Reference Documentation",
            "description": "Complete API reference with examples and specifications",
            "category": "Reference",
            "tags": ["api", "reference", "endpoints", "rest"],
            "author": "API Team", 
            "lastUpdated": datetime.utcnow().isoformat(),
            "readingTime": 25
        },
        "navigation": {
            "parent": None,
            "order": 3,
            "children": ["authentication", "documents-api", "users-api"]
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

# 네비게이션 구조 데이터
navigation_structure = [
    {
        "_id": "nav_getting_started",
        "slug": "getting-started",
        "title": "Getting Started",
        "type": "category",
        "order": 1,
        "children": [
            {
                "slug": "installation",
                "title": "Installation",
                "order": 1
            },
            {
                "slug": "quick-start", 
                "title": "Quick Start",
                "order": 2
            },
            {
                "slug": "configuration",
                "title": "Configuration", 
                "order": 3
            }
        ]
    },
    {
        "_id": "nav_guides",
        "slug": "guides",
        "title": "Guides",
        "type": "category", 
        "order": 2,
        "children": [
            {
                "slug": "authentication",
                "title": "Authentication",
                "order": 1
            },
            {
                "slug": "deployment",
                "title": "Deployment",
                "order": 2
            },
            {
                "slug": "troubleshooting",
                "title": "Troubleshooting",
                "order": 3
            }
        ]
    },
    {
        "_id": "nav_api_reference",
        "slug": "api-reference", 
        "title": "API Reference",
        "type": "category",
        "order": 3,
        "children": [
            {
                "slug": "authentication-api",
                "title": "Authentication API",
                "order": 1
            },
            {
                "slug": "documents-api", 
                "title": "Documents API",
                "order": 2
            },
            {
                "slug": "users-api",
                "title": "Users API", 
                "order": 3
            }
        ]
    }
]

async def insert_test_data():
    """테스트 데이터를 MongoDB에 삽입"""
    try:
        # MongoDB 클라이언트 생성
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        print("🔄 MongoDB에 연결 중...")
        
        # 연결 테스트
        await client.admin.command('ping')
        print("✅ MongoDB 연결 성공!")
        
        # 문서 컬렉션에 데이터 삽입
        documents_collection = db.documents
        
        print("🔄 기존 문서 데이터 삭제 중...")
        await documents_collection.delete_many({})
        
        print("📝 테스트 문서 데이터 삽입 중...")
        result = await documents_collection.insert_many(test_documents)
        print(f"✅ {len(result.inserted_ids)}개의 문서가 삽입되었습니다.")
        
        # 네비게이션 컬렉션에 데이터 삽입  
        navigation_collection = db.navigation
        
        print("🔄 기존 네비게이션 데이터 삭제 중...")
        await navigation_collection.delete_many({})
        
        print("🧭 네비게이션 구조 데이터 삽입 중...")
        nav_result = await navigation_collection.insert_many(navigation_structure)
        print(f"✅ {len(nav_result.inserted_ids)}개의 네비게이션 항목이 삽입되었습니다.")
        
        # 인덱스 생성
        print("🔄 인덱스 생성 중...")
        await documents_collection.create_index("slug", unique=True)
        await documents_collection.create_index("metadata.category")
        await documents_collection.create_index("metadata.tags")
        await documents_collection.create_index([("title", "text"), ("content", "text")])
        
        await navigation_collection.create_index("slug", unique=True)
        await navigation_collection.create_index("order")
        
        print("✅ 인덱스 생성 완료!")
        
        # 데이터 확인
        doc_count = await documents_collection.count_documents({})
        nav_count = await navigation_collection.count_documents({})
        
        print(f"\n📊 데이터 삽입 완료:")
        print(f"   📄 문서: {doc_count}개")
        print(f"   🧭 네비게이션: {nav_count}개")
        
        # 삽입된 문서 목록 출력
        print(f"\n📋 삽입된 문서 목록:")
        async for doc in documents_collection.find({}, {"title": 1, "slug": 1, "metadata.category": 1}):
            print(f"   • {doc['title']} (/{doc['slug']}) - {doc['metadata'].get('category', 'N/A')}")
            
        print(f"\n🌐 문서 URL:")
        for doc in test_documents:
            print(f"   • http://localhost:3000/docs/{doc['slug']}")
        
        client.close()
        print(f"\n🎉 테스트 데이터 삽입이 완료되었습니다!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(insert_test_data())
