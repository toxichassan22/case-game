# API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication

### Register Player
```http
POST /api/auth/register
Content-Type: application/json

{
  "playerName": "string (3-20 chars)",
  "password": "string (min 6 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "player": {
    "id": "1",
    "name": "playerName",
    "role": "player"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "playerName": "string",
  "password": "string"
}
```

**Response:** Same as register

### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "playerId": "1",
    "playerName": "string",
    "role": "player"
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "token": "new-jwt-token"
}
```

## Health Check

### Server Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": 1234567890
}
```

## Server Info

### Get Server Information
```http
GET /api/server-info
```

**Response:**
```json
{
  "status": "ok",
  "address": "192.168.1.100",
  "port": 3001,
  "all_ips": ["192.168.1.100", "10.0.0.1"]
}
```

## Rooms

### List All Rooms
```http
GET /rooms
```

### Get Player Lobby
```http
GET /rooms/lobby/:playerId
```

### Get Active Rooms
```http
GET /rooms/active/:playerId
```

## WebSocket API

Connect to: `ws://localhost:3001`

### Message Format
```json
{
  "type": "string",
  "payload": {}
}
```

### Available Message Types
- `JOIN_ROOM` - Join a game room
- `LEAVE_ROOM` - Leave current room
- `CREATE_ROOM` - Create new room
- `START_GAME` - Start the game
- `SUBMIT_ACTION` - Submit player action
- `CHAT_MESSAGE` - Send chat message
- `GET_STATE` - Get current game state

### Example: Join Room
```json
{
  "type": "JOIN_ROOM",
  "payload": {
    "roomId": "room-123",
    "playerId": "player-456"
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Human readable error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `MISSING_TOKEN` - No authentication token provided
- `INVALID_TOKEN` - Token is invalid or expired
- `INSUFFICIENT_ROLE` - User doesn't have required permissions
- `MISSING_FIELDS` - Required fields are missing
- `INVALID_CREDENTIALS` - Wrong username or password
- `DUPLICATE_PLAYER` - Player name already exists
- `REGISTRATION_FAILED` - Registration error
- `LOGIN_FAILED` - Login error

## Rate Limiting

- **Limit:** 100 requests per minute
- **Response on limit:** HTTP 429
```json
{
  "error": "Too Many Requests"
}
```

## Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; ...`
