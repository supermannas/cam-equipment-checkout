# Equipment Checkout System - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All API endpoints require authentication via NextAuth.js session tokens. Include the session cookie in your requests.

## Endpoints

### Authentication

#### Register User
`POST /api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "studentId": "123456",
  "department": "Communication Arts",
  "phone": "704-555-0123"
}
```

**Response:**
```json
{
  "id": "clx123...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "STUDENT",
  "studentId": "123456",
  "department": "Communication Arts"
}
```

**Status Codes:**
- 201: Created
- 400: Validation error or user exists
- 500: Server error

---

### Equipment

#### List Equipment
`GET /api/equipment`

Get all equipment with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status (AVAILABLE, RESERVED, CHECKED_OUT, MAINTENANCE, RETIRED)
- `categoryId` (optional): Filter by category ID
- `search` (optional): Search by name, SKU, assetId, or serial number

**Response:**
```json
[
  {
    "id": "clx123...",
    "name": "Canon EOS R5",
    "description": "Full-frame mirrorless camera",
    "sku": "CAM-001",
    "assetId": "AST-12345",
    "status": "AVAILABLE",
    "category": { "id": "cat1", "name": "Cameras" },
    "tags": [{ "tag": { "id": "tag1", "name": "4K" } }],
    "_count": { "reservations": 12 }
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

#### Get Equipment
`GET /api/equipment/[id]`

Get detailed information about a specific equipment item.

**Response:**
```json
{
  "id": "clx123...",
  "name": "Canon EOS R5",
  "description": "Full-frame mirrorless camera",
  "sku": "CAM-001",
  "status": "AVAILABLE",
  "location": "Ketner 3210",
  "serialNumber": "CN123456",
  "purchaseDate": "2024-01-15",
  "purchasePrice": 3899.00,
  "category": { "id": "cat1", "name": "Cameras" },
  "tags": [...],
  "reservations": [
    {
      "id": "res1",
      "startDate": "2024-10-15",
      "endDate": "2024-10-17",
      "status": "APPROVED",
      "user": { "name": "Jane Doe", "email": "jane@example.com" }
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 404: Not found
- 500: Server error

#### Create Equipment
`POST /api/equipment`

Create a new equipment item. Requires Admin or Staff role.

**Request Body:**
```json
{
  "name": "Sony A7IV",
  "description": "Full-frame hybrid camera",
  "sku": "CAM-002",
  "assetId": "AST-12346",
  "categoryId": "cat1",
  "location": "Ketner 3210",
  "serialNumber": "SN789012",
  "purchaseDate": "2024-02-01",
  "purchasePrice": 2499.00,
  "tagIds": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "id": "clx456...",
  "name": "Sony A7IV",
  "status": "AVAILABLE",
  ...
}
```

**Status Codes:**
- 201: Created
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 500: Server error

#### Update Equipment
`PUT /api/equipment/[id]`

Update an existing equipment item. Requires Admin or Staff role.

**Request Body:** (all fields optional)
```json
{
  "name": "Sony A7IV (Updated)",
  "status": "MAINTENANCE",
  "notes": "Sensor cleaning required"
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

#### Delete Equipment
`DELETE /api/equipment/[id]`

Delete an equipment item. Requires Admin role. Cannot delete if active reservations exist.

**Response:**
```json
{ "success": true }
```

**Status Codes:**
- 200: Success
- 400: Has active reservations
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

### Reservations

#### List Reservations
`GET /api/reservations`

Get reservations with optional filters.

**Query Parameters:**
- `status` (optional): Filter by status
- `equipmentId` (optional): Filter by equipment
- `userId` (optional): Filter by user (Admin/Staff only)
- `startDate` (optional): Filter reservations overlapping this date
- `endDate` (optional): Filter reservations overlapping this date

**Response:**
```json
[
  {
    "id": "res123...",
    "userId": "usr123",
    "equipmentId": "eq123",
    "startDate": "2024-10-15T09:00:00Z",
    "endDate": "2024-10-17T17:00:00Z",
    "purpose": "Student film project",
    "status": "APPROVED",
    "approvedBy": "usr456",
    "approvedAt": "2024-10-14T10:00:00Z",
    "user": { "name": "John Doe", "email": "john@example.com", "role": "STUDENT" },
    "equipment": { "name": "Canon EOS R5", "sku": "CAM-001" },
    "waiver": { "id": "wvr123", "signedAt": "2024-10-14T11:00:00Z" }
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

#### Create Reservation
`POST /api/reservations`

Create a new reservation.

**Request Body:**
```json
{
  "equipmentId": "eq123",
  "startDate": "2024-10-15T09:00:00Z",
  "endDate": "2024-10-17T17:00:00Z",
  "purpose": "Student film project for COMM 3650"
}
```

**Validation Rules:**
- End date must be after start date
- Maximum 2 nights for regular reservations
- Weekend reservations must be Friday-Monday only (max 3 nights)
- Equipment must be available for the entire period

**Response:**
```json
{
  "id": "res456...",
  "status": "PENDING",
  "userId": "usr123",
  "equipmentId": "eq123",
  "startDate": "2024-10-15T09:00:00Z",
  "endDate": "2024-10-17T17:00:00Z",
  "purpose": "Student film project for COMM 3650",
  "createdAt": "2024-10-14T14:00:00Z"
}
```

**Status Codes:**
- 201: Created
- 400: Validation error (including date rule violations)
- 401: Unauthorized
- 404: Equipment not found
- 409: Equipment already reserved for this period
- 500: Server error

#### Get Reservation
`GET /api/reservations/[id]`

Get details of a specific reservation.

**Response:**
```json
{
  "id": "res456...",
  "user": { "name": "John Doe", "email": "john@example.com", "role": "STUDENT", "phone": "704-555-0123" },
  "equipment": {
    "name": "Canon EOS R5",
    "description": "Full-frame mirrorless camera",
    "sku": "CAM-001",
    "serialNumber": "CN123456",
    "location": "Ketner 3210",
    "status": "RESERVED",
    "category": { "name": "Cameras" },
    "tags": [...]
  },
  "waiver": { "id": "wvr123", "signedAt": "2024-10-14T11:00:00Z", "pdfPath": "/waivers/res456.pdf" }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden (students can only see their own reservations)
- 404: Not found
- 500: Server error

#### Update Reservation
`PATCH /api/reservations/[id]`

Update a reservation. Requires Staff or Admin role.

**Request Body:**
```json
{
  "status": "APPROVED",
  "notes": "Approved for student film project"
}
```

**Available Status Changes:**
- `PENDING` → `APPROVED` or `REJECTED`
- `APPROVED` → `CHECKED_OUT` or `CANCELLED`
- `CHECKED_OUT` → `CHECKED_IN` or `OVERDUE`

**Response:**
```json
{
  "id": "res456...",
  "status": "APPROVED",
  "approvedBy": "usr456",
  "approvedAt": "2024-10-14T15:00:00Z",
  ...
}
```

**Status Codes:**
- 200: Success
- 400: Invalid status transition
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

#### Cancel Reservation
`DELETE /api/reservations/[id]`

Cancel a reservation. Students can only cancel their own pending reservations. Staff/Admin can cancel any reservation.

**Response:**
```json
{ "success": true }
```

**Status Codes:**
- 200: Success
- 400: Cannot cancel non-pending reservations (for students)
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

### Waivers

#### Generate Waiver PDF
`POST /api/waivers/generate`

Generate a digital waiver with signature and PDF.

**Request Body:**
```json
{
  "reservationId": "res456...",
  "signatureDataUrl": "data:image/png;base64,iVBORw0KG..."
}
```

**Response:**
```json
{
  "success": true,
  "waiverId": "wvr456...",
  "pdfBytes": "JVBERi0xLjQKJeLjz9MK..."
}
```

**Status Codes:**
- 200: Success
- 400: Missing required fields
- 401: Unauthorized
- 404: Reservation not found
- 500: PDF generation failed

---

### Analytics

#### Get Analytics
`GET /api/analytics`

Get system analytics and statistics.

**Query Parameters:**
- `days` (optional): Number of days to look back (default: 30)

**Response:**
```json
{
  "overview": {
    "totalEquipment": 127,
    "availableEquipment": 98,
    "checkedOutEquipment": 23,
    "maintenanceEquipment": 4,
    "totalReservations": 1542,
    "recentReservations": 87
  },
  "reservationsByStatus": [
    { "status": "APPROVED", "count": 45 },
    { "status": "PENDING", "count": 12 },
    { "status": "CHECKED_OUT", "count": 23 }
  ],
  "topEquipment": [
    { "name": "Canon EOS R5", "count": 156 },
    { "name": "Sony A7IV", "count": 134 }
  ],
  "reservationsOverTime": [
    { "date": "2024-09-15", "count": 3 },
    { "date": "2024-09-16", "count": 5 }
  ],
  "reservationsByCategory": [
    { "name": "Cameras", "count": 234 },
    { "name": "Audio", "count": 156 }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

---

### Categories

#### List Categories
`GET /api/categories`

Get all equipment categories.

**Response:**
```json
[
  {
    "id": "cat1",
    "name": "Cameras",
    "description": "Digital and film cameras",
    "_count": { "equipment": 45 }
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Create Category
`POST /api/categories`

Create a new category. Requires Admin or Staff role.

**Request Body:**
```json
{
  "name": "Lighting",
  "description": "LED panels, fresnels, and accessories"
}
```

**Response:**
```json
{
  "id": "cat2",
  "name": "Lighting",
  "description": "LED panels, fresnels, and accessories"
}
```

**Status Codes:**
- 201: Created
- 400: Name required
- 401: Unauthorized
- 403: Forbidden
- 500: Server error

---

### Tags

#### List Tags
`GET /api/tags`

Get all tags.

**Response:**
```json
[
  { "id": "tag1", "name": "4K", "color": "#3B82F6" },
  { "id": "tag2", "name": "Wireless", "color": "#10B981" }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Create Tag
`POST /api/tags`

Create a new tag. Requires Admin or Staff role.

**Request Body:**
```json
{
  "name": "HDR",
  "color": "#8B5CF6"
}
```

**Response:**
```json
{
  "id": "tag3",
  "name": "HDR",
  "color": "#8B5CF6"
}
```

**Status Codes:**
- 201: Created
- 400: Name required
- 401: Unauthorized
- 403: Forbidden
- 500: Server error

---

## Error Handling

All API errors return a JSON response with an `error` field:

```json
{
  "error": "Descriptive error message"
}
```

For validation errors, the response may include an array of errors:

```json
{
  "error": [
    { "field": "email", "message": "Email is required" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., double booking) |
| 500 | Internal Server Error |

## Rate Limiting

Rate limiting is not currently implemented. For production deployments, consider implementing rate limiting to prevent abuse.

## CORS

CORS is configured to allow requests from the same origin. For external API access, configure CORS middleware in Next.js.

## Webhooks (Future)

Webhook support is planned for future releases to enable:
- Real-time notifications
- Integration with calendar systems
- Automated email/SMS reminders
- External inventory sync
