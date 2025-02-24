# 🌐 API Documentation

## Overview

This document provides comprehensive documentation for the HaDerech API, including both backend and frontend integration details.

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Versioning](#versioning)
7. [Security](#security)
8. [Testing](#testing)
9. [Examples](#examples)

## Authentication

### Supabase Authentication

We use Supabase for authentication. The following methods are supported:

- Email/Password
- Magic Link
- OAuth (Google, GitHub)

```typescript
// Example authentication
const {
  data: { user },
  error,
} = await supabase.auth.signIn({
  email: "user@example.com",
  password: "password123",
});
```

### API Keys

For server-to-server communication, use API keys:

```typescript
const response = await fetch("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});
```

## Endpoints

### Course Management

#### Get Courses

```typescript
GET / api / courses;
```

Response:

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "instructor_id": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ],
  "error": null
}
```

#### Create Course

```typescript
POST / api / courses;
```

Request Body:

```json
{
  "title": "string",
  "description": "string",
  "content": "string"
}
```

### Forum Management

#### Get Posts

```typescript
GET / api / forum / posts;
```

Response:

```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "author_id": "string",
      "created_at": "string"
    }
  ],
  "error": null
}
```

### Simulator Management

#### Start Simulation

```typescript
POST / api / simulator / start;
```

Request Body:

```json
{
  "scenario_id": "string",
  "user_id": "string"
}
```

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "instructor";
  created_at: string;
  updated_at: string;
}
```

### Course

```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

## Error Handling

All API endpoints return consistent error responses:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

Common error codes:

- `AUTH_ERROR`: Authentication failed
- `VALIDATION_ERROR`: Invalid input
- `NOT_FOUND`: Resource not found
- `SERVER_ERROR`: Internal server error

## Rate Limiting

API endpoints are rate-limited:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Headers returned:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Versioning

API versioning is handled through the URL:

```
/api/v1/endpoint
```

Current versions:

- v1: Current stable version
- v2: Beta version (selected endpoints)

## Security

### CORS

CORS is configured for the following origins:

- Development: `http://localhost:3000`
- Production: `https://haderech.co.il`

### Input Validation

All input is validated using Zod schemas:

```typescript
const courseSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  content: z.string().min(1),
});
```

## Testing

### API Tests

Run API tests:

```bash
pnpm test:api
```

Example test:

```typescript
describe("Course API", () => {
  it("should create a course", async () => {
    const response = await request(app).post("/api/courses").send({
      title: "Test Course",
      description: "Test Description",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("id");
  });
});
```

## Examples

### Frontend Integration

Using the API with React Query:

```typescript
const { data, isLoading, error } = useQuery(["courses"], async () => {
  const response = await fetch("/api/courses");
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
});
```

### Backend Implementation

Example route handler:

```typescript
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase.from("courses").select("*");

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
```

### WebSocket Integration

Example WebSocket connection:

```typescript
const socket = new WebSocket("wss://api.haderech.co.il/ws");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

socket.send(
  JSON.stringify({
    type: "subscribe",
    channel: "course-updates",
  })
);
```

## Best Practices

1. Always validate input
2. Use appropriate HTTP methods
3. Return consistent error responses
4. Include proper documentation
5. Implement rate limiting
6. Use authentication where needed
7. Log important events
8. Monitor API usage
9. Keep dependencies updated
10. Write comprehensive tests
