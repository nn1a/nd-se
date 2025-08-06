# API Reference

Complete API documentation for our system.

:::info OpenAPI Specification
Our API follows OpenAPI 3.0 specification. Interactive documentation is available at `/docs`.
:::

## Authentication

All API endpoints (except public ones) require authentication using JWT tokens.

### Authentication Header

```http
Authorization: Bearer <your-jwt-token>
```

### Login Endpoint

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

## Documents API

### Get All Documents

```http
GET /api/docs?skip=0&limit=100&search=query
```

**Query Parameters:**
- `skip` (optional): Number of documents to skip (default: 0)
- `limit` (optional): Number of documents to return (default: 100, max: 1000)
- `search` (optional): Search query for full-text search

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Getting Started",
    "slug": "getting-started",
    "content": "# Getting Started\n\nWelcome...",
    "order": 1,
    "tags": ["guide", "tutorial"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "created_by": "user@example.com",
    "updated_by": "user@example.com"
  }
]
```

### Get Document by Slug

```http
GET /api/docs/{slug}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Getting Started",
  "slug": "getting-started",
  "content": "# Getting Started\n\nWelcome to our platform!",
  "order": 1,
  "tags": ["guide", "tutorial"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "created_by": "user@example.com",
  "updated_by": "user@example.com"
}
```

### Create Document

```http
POST /api/docs
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New Document",
  "slug": "new-document",
  "content": "# New Document\n\nContent here...",
  "order": 10,
  "tags": ["new", "example"]
}
```

**Response:** Same as Get Document response

### Update Document

```http
PUT /api/docs/{slug}
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "content": "# Updated Content\n\nNew content...",
  "tags": ["updated", "example"]
}
```

### Delete Document

```http
DELETE /api/docs/{slug}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

## Users API

### Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "editor",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update Profile

```http
PUT /api/users/me
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Smith",
  "bio": "Software developer"
}
```

## Navigation API

### Get Navigation Structure

```http
GET /api/navigation
```

**Response:**
```json
{
  "navigation": [
    {
      "slug": "getting-started",
      "title": "Getting Started",
      "children": [
        {
          "slug": "installation",
          "title": "Installation",
          "children": []
        }
      ]
    }
  ]
}
```

## Analytics API

### Get Document Statistics

```http
GET /api/analytics/documents
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_documents": 25,
  "total_views": 1500,
  "most_viewed": [
    {
      "slug": "getting-started",
      "title": "Getting Started",
      "views": 250
    }
  ],
  "recent_documents": [
    {
      "slug": "new-feature",
      "title": "New Feature",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "title",
        "message": "Field required"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "status_code": 401
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions",
    "status_code": 403
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "status_code": 404
  }
}
```

### 409 Conflict
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Resource already exists",
    "status_code": 409
  }
}
```

### 422 Validation Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "loc": ["body", "slug"],
        "msg": "string does not match regex",
        "type": "value_error.str.regex",
        "ctx": {"pattern": "^[a-z0-9-]+$"}
      }
    ]
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error",
    "status_code": 500
  }
}
```

## Rate Limiting

API endpoints are rate limited:

- **Anonymous users**: 100 requests per minute
- **Authenticated users**: 1000 requests per minute
- **Admin users**: 5000 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:

```http
GET /api/docs?skip=20&limit=10
```

**Response Headers:**
```http
X-Total-Count: 150
X-Page-Count: 15
Link: </api/docs?skip=10&limit=10>; rel="prev", </api/docs?skip=30&limit=10>; rel="next"
```

## Search

Full-text search is available on document content:

```http
GET /api/docs?search=installation guide
```

**Search Features:**
- Full-text search across title and content
- Fuzzy matching for typos
- Phrase matching with quotes: `"exact phrase"`
- Boolean operators: `AND`, `OR`, `NOT`

## Webhooks

Register webhooks to receive notifications:

```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer <token>

{
  "url": "https://your-app.com/webhook",
  "events": ["document.created", "document.updated", "document.deleted"],
  "secret": "your-webhook-secret"
}
```

**Webhook Payload:**
```json
{
  "event": "document.created",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "document": {
      "id": "507f1f77bcf86cd799439011",
      "title": "New Document",
      "slug": "new-document"
    },
    "user": {
      "id": "507f1f77bcf86cd799439012",
      "email": "user@example.com"
    }
  }
}
```
