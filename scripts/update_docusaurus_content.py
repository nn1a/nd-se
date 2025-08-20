import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def update_docusaurus_content():
    """Update documents with Docusaurus-style content"""
    
    # MongoDB connection
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "nd_se")
    
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    docs_collection = db.docs
    
    try:
        # Update getting-started document with Docusaurus features
        await docs_collection.update_one(
            {"slug": "getting-started"},
            {"$set": {
                "content": """# Getting Started

Welcome to our comprehensive documentation system! This guide will help you get up and running quickly.

:::note
This documentation system is built with Next.js and FastAPI, providing a modern and responsive experience.
:::

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or later)
- **Python** (version 3.8 or later)
- **MongoDB** (version 5.0 or later)

:::tip Pro Tip
We recommend using [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions.
:::

## Quick Start

Follow these steps to get started:

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/ndash.git
cd ndash
```

### 2. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file in both frontend and backend directories:

```env
# Backend .env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se
JWT_SECRET=your-super-secret-key
```

```env
# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

:::caution Important
Never commit your `.env` files to version control. They contain sensitive information.
:::

## Architecture Overview

Our system consists of several key components:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 15 | User interface and documentation |
| Backend | FastAPI | REST API and business logic |
| Database | MongoDB | Data persistence |
| Authentication | JWT | User authentication |

## Features

### Documentation System
- **Markdown Support**: Full CommonMark and GFM support
- **Syntax Highlighting**: Code blocks with language detection
- **Search**: Full-text search across all documentation
- **Navigation**: Hierarchical navigation with breadcrumbs

### Developer Experience
- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety across the stack
- **API Documentation**: Auto-generated OpenAPI specs
- **Testing**: Comprehensive test suites

:::info Success Story
"This documentation system helped our team reduce onboarding time by 60% and improved our development velocity significantly." - Development Team Lead
:::

## What's Next?

- 📖 Read the [Installation Guide](installation) for detailed setup instructions
- 🚀 Check out the [Quick Start Tutorial](quick-start) to build your first feature
- 📚 Explore the [API Reference](api-reference) for detailed API documentation

:::danger Critical Note
Make sure to follow security best practices when deploying to production. Never use default passwords or expose sensitive information.
:::

Need help? Join our community:
- 💬 [Discord Server](https://discord.gg/example)
- 🐛 [GitHub Issues](https://github.com/your-org/ndash/issues)
- 📧 [Email Support](mailto:support@example.com)
""",
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Add a new document with advanced features
        await docs_collection.insert_one({
            "slug": "advanced-features",
            "title": "Advanced Features",
            "content": """# Advanced Features

This section covers advanced features and customization options available in our documentation system.

:::tip
These features require some technical knowledge. If you're new to the system, start with the [Getting Started](getting-started) guide.
:::

## Admonitions

Our system supports various types of admonitions to highlight important information:

:::note
This is a note admonition. Use it for general information.
:::

:::tip
This is a tip admonition. Use it for helpful suggestions.
:::

:::info
This is an info admonition. Use it for neutral information.
:::

:::caution
This is a caution admonition. Use it for warnings.
:::

:::danger
This is a danger admonition. Use it for critical warnings.
:::

## Code Examples

### JavaScript/TypeScript

```typescript
interface User {
  id: string
  name: string
  email: string
  roles: Role[]
}

class UserService {
  async getUser(id: string): Promise<User | null> {
    try {
      const user = await this.repository.findById(id)
      return user
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }
}
```

### Python

```python
from typing import Optional
from pydantic import BaseModel
from fastapi import HTTPException

class User(BaseModel):
    id: str
    name: str
    email: str
    roles: list[str]

class UserService:
    async def get_user(self, user_id: str) -> Optional[User]:
        try:
            user = await self.repository.find_by_id(user_id)
            return user
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
```

### Shell Commands

```bash
# Development setup
npm install
pip install -r requirements.txt

# Database setup
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Start services
./start-dev.sh
```

## Tables

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ Complete | JWT-based user authentication |
| Authorization | ✅ Complete | Role-based access control |
| Documentation | ✅ Complete | Markdown-based documentation system |
| Search | 🚧 In Progress | Full-text search functionality |
| Notifications | 📋 Planned | Real-time notifications |
| Analytics | 📋 Planned | Usage analytics dashboard |

## Advanced Configuration

### Custom Themes

You can customize the appearance by modifying the CSS variables:

```css
:root {
  --docs-color-primary: #2e8555;
  --docs-color-primary-dark: #26704c;
  --docs-color-text: #1c1e21;
  --docs-color-background: #ffffff;
}
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `JWT_SECRET` | - | JWT signing secret |
| `NODE_ENV` | `development` | Application environment |

## Performance Optimization

### Caching Strategy

```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

### Database Indexing

```javascript
// MongoDB indexes for optimal performance
db.docs.createIndex({ "slug": 1 }, { unique: true })
db.docs.createIndex({ "title": "text", "content": "text" })
db.docs.createIndex({ "order": 1, "created_at": -1 })
```

:::info Performance Tips
- Use proper database indexing for search queries
- Implement client-side caching with React Query
- Optimize images and static assets
- Use CDN for static content delivery
:::

## Troubleshooting

### Common Issues

**Q: Why is my markdown not rendering correctly?**

A: Make sure you're using proper markdown syntax and that special characters are escaped correctly.

**Q: How do I add custom styles?**

A: You can add custom CSS to the `styles/docusaurus.css` file or use Tailwind CSS classes.

**Q: Why are my environment variables not loading?**

A: Check that your `.env` files are in the correct locations and have the proper variable names.

:::danger Security Warning
Never expose sensitive environment variables in client-side code. Use the `NEXT_PUBLIC_` prefix only for non-sensitive configuration.
:::
""",
            "order": 5,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        
        print("✅ Successfully updated documents with Docusaurus-style content")
        
    except Exception as e:
        print(f"❌ Error updating documents: {e}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(update_docusaurus_content())
