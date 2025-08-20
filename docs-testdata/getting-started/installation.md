# Installation Guide

This guide will walk you through installing and setting up our system on your local machine.

:::caution Prerequisites
Make sure you have the following installed before proceeding:
- Node.js 18+
- Python 3.8+
- MongoDB 5.0+
:::

## System Requirements

### Minimum Requirements

- **OS**: Windows 10, macOS 10.15, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 5GB free space
- **Network**: Broadband internet connection

### Recommended Requirements

- **OS**: Latest version of your operating system
- **RAM**: 16GB or more
- **Storage**: SSD with 10GB free space
- **Network**: High-speed internet connection

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/ndash.git
cd ndash
```

### Step 2: Install Dependencies

#### Frontend Dependencies

```bash
cd frontend
npm install
```

#### Backend Dependencies

```bash
cd ../backend
python -m pip install -r requirements.txt
```

### Step 3: Database Setup

#### Using Docker (Recommended)

```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

#### Manual Installation

1. Download MongoDB from [official website](https://www.mongodb.com/try/download/community)
2. Follow the installation instructions for your OS
3. Start the MongoDB service

### Step 4: Environment Configuration

#### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=nd_se
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

:::danger Security Warning
Never commit `.env` files to version control! These files contain sensitive information.
:::

### Step 5: Initialize Database

Run the database initialization script:

```bash
python scripts/init_database.py
```

### Step 6: Start the Services

#### Option 1: Using the Start Script (Recommended)

```bash
./start-dev.sh
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Verification

Once everything is running, you should be able to access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

:::tip Success Indicators
✅ No error messages in terminals
✅ Web pages load correctly
✅ Database connection established
✅ Authentication works
:::

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
```

**Permission denied errors:**
```bash
# Fix permissions (Unix/Linux/macOS)
chmod +x start-dev.sh
```

**Database connection failed:**
- Ensure MongoDB is running
- Check the `MONGODB_URL` in your `.env` file
- Verify firewall settings

### Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](troubleshooting)
2. Search existing [GitHub Issues](https://github.com/your-org/ndash/issues)
3. Ask for help on [Discord](https://discord.gg/example)

## Next Steps

Now that you have everything installed:

1. 🚀 Try the [Quick Start Tutorial](quick-start)
2. 📖 Read the [Configuration Guide](configuration)
3. 🛠️ Explore the [Development Guides](guides/overview)
