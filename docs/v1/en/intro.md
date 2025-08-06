---
title: "Getting Started"
description: "Introduction to ND-SE Documentation System"
---

# Welcome to ND-SE Documentation System

This documentation system is a modern integrated platform built with Next.js and FastAPI.

## Key Features

### 📄 Document Management
- Multi-language support (Korean, English)
- Version control (v1, v2, latest)
- Automatic TOC generation
- MDX support

### 📝 Blog
- Markdown-based writing
- Tags and categories
- Search functionality
- RSS feeds

### 📊 Dashboard
- Real-time statistics
- User activity monitoring
- Content management

### 💬 Forum
- Q&A and discussions
- Comment system
- Tag-based classification

## Quick Start

### 1. Environment Setup

Frontend (Next.js):
```bash
cd frontend
npm install
npm run dev
```

Backend (FastAPI):
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Writing Documents

Documents should be written in the `docs/` folder with the following structure:

```
docs/
├── v1/
│   ├── ko/
│   │   ├── intro.md
│   │   └── guide.md
│   └── en/
│       ├── intro.md
│       └── guide.md
└── v2/
    └── ...
```

### 3. Writing Blog Posts

Blog posts can be managed through the API or added directly to the database.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Search**: FlexSearch
- **Auth**: JWT

## Next Steps

- [Installation Guide](./installation)
- [API Documentation](./api)
- [Contributing Guide](./contributing)
