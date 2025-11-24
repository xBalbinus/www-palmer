# Admin Panel Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Admin Panel Password
ADMIN_PASSWORD=your-secure-password-here

# PostgreSQL Database Connection
DATABASE_URL=postgresql://db_palmer_user:e4mlAFOiiRLqllfrURLB2VgA3AljDqp9@dpg-d4hs01fdiees73bp385g-a.oregon-postgres.render.com:5432/db_palmer
```

Replace `your-secure-password-here` with a strong password for accessing the admin panel.

**Important:** The `DATABASE_URL` should be stored securely and never committed to version control. Use environment variables on your server.

## Database Setup

### 1. Generate Migrations

First, generate the migration files from your schema:

```bash
bun run db:generate
```

This will create migration files in the `./drizzle` directory.

### 2. Run Migrations

Apply the migrations to your PostgreSQL database:

```bash
bun run db:migrate
```

Alternatively, you can push the schema directly (useful for development):

```bash
bun run db:push
```

### 3. Initialize Admin User

After running migrations, initialize the database and create Palmer's admin user:

1. Start the development server: `bun dev`
2. Visit `http://localhost:3000/api/init` in your browser
3. The API key for Palmer will be displayed in the response and logged to the console

**Important:** Save Palmer's API key securely! This key is used to authenticate API requests.

## Admin Panel Access

1. Navigate to `/admin` in your browser
2. Enter the password you set in `ADMIN_PASSWORD`
3. You'll be able to:
   - Create new customers
   - View all customers
   - Manage session counts (increment, decrement, or set a specific count)

## API Endpoints

All API endpoints require authentication using Palmer's API key via the `X-API-Key` header or `Authorization: Bearer <api-key>` header.

### Create Customer

```
POST /api/customers
Headers: X-API-Key: <palmer-api-key>
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890" // optional
}
```

### List All Customers

```
GET /api/customers
Headers: X-API-Key: <palmer-api-key>
```

### Get Customer Details

```
GET /api/customers/:id
Headers: X-API-Key: <palmer-api-key>
```

### Update Session Count

```
PATCH /api/customers/:id/sessions
Headers: X-API-Key: <palmer-api-key>
Body: {
  "action": "increment" | "decrement" | "set",
  "count": 1 // optional, defaults to 1 for increment/decrement, required for "set"
}
```

## Database Schema

### Users Table

- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL, UNIQUE)
- `phone` (TEXT, nullable)
- `created_at` (TIMESTAMP, DEFAULT NOW)
- `updated_at` (TIMESTAMP, DEFAULT NOW)

### Palmer Applications Table

- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `user_id` (INTEGER, FOREIGN KEY -> users.id, CASCADE DELETE)
- `session_count` (INTEGER, DEFAULT 0)
- `created_at` (TIMESTAMP, DEFAULT NOW)
- `updated_at` (TIMESTAMP, DEFAULT NOW)

### Admin Users Table

- `id` (INTEGER, PRIMARY KEY, AUTO INCREMENT)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL, UNIQUE)
- `api_key` (TEXT, NOT NULL, UNIQUE)
- `created_at` (TIMESTAMP, DEFAULT NOW)

## Development Commands

- `bun dev` - Start development server
- `bun run db:generate` - Generate migration files
- `bun run db:migrate` - Run migrations
- `bun run db:push` - Push schema directly (dev only)
- `bun run db:studio` - Open Drizzle Studio (database GUI)
