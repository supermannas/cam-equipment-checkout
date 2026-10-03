# Equipment Checkout System

A complete production-ready equipment reservation and checkout application for Catawba College Communication Arts and Media.

## Features

- **User Authentication**: Secure login with role-based access (Admin, Staff, Student)
- **Reservation System**: Smart validation with 2-night limit or Friday-Monday weekend rule
- **Equipment Management**: Full CRUD with CSV import from AssetPanda
- **Digital Waivers**: Signature capture and automatic PDF generation
- **Real-time Calendar**: Availability tracking and conflict detection
- **Complete Audit Trail**: Track all system actions
- **Analytics Dashboard**: Recharts-powered insights and statistics
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form with Zod validation
- **PDF Generation**: pdf-lib
- **Charts**: Recharts
- **Date Handling**: date-fns

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd /home/supermannas/.openclaw/workspace/equipment-checkout
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database connection:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/equipment_checkout"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

   Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**
   ```bash
   # Create the database (adjust for your PostgreSQL setup)
   createdb equipment_checkout
   
   # Run migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@catawba.edu | Password123! |
| Staff | staff@catawba.edu | Password123! |
| Student | student1@catawba.edu | Password123! |

## Project Structure

```
equipment-checkout/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── equipment/     # Equipment CRUD
│   │   │   ├── reservations/  # Reservation management
│   │   │   ├── waivers/       # PDF generation
│   │   │   ├── categories/    # Equipment categories
│   │   │   ├── tags/          # Equipment tags
│   │   │   └── analytics/     # System analytics
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page (redirects to dashboard)
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard with navigation
│   │   └── Login.tsx          # Login form
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Utility functions
│   └── middleware.ts          # Authentication middleware
├── docs/
│   ├── USER_GUIDE.md          # End-user documentation
│   ├── ADMIN_GUIDE.md         # Administrator guide
│   ├── API_GUIDE.md           # API documentation
│   └── DEPLOYMENT_GUIDE.md    # Deployment instructions
├── .env.example               # Environment variables template
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio GUI
npm run db:push          # Push schema changes without migration

# Production
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
```

## Core Features

### Reservation Rules

The system enforces business rules automatically:

- **Regular Reservations**: Maximum 2 nights
- **Weekend Reservations**: Friday to Monday only (3 nights maximum)
- **Conflict Detection**: Prevents double-booking
- **Approval Workflow**: Students require staff approval; staff/admin auto-approved

### Equipment Status Flow

```
AVAILABLE → RESERVED → CHECKED_OUT → CHECKED_IN → AVAILABLE
                      ↓
                   MAINTENANCE
                      ↓
                    RETIRED
```

### Digital Waiver Process

1. Reservation approved
2. User prompted to sign waiver
3. Signature captured via canvas
4. PDF generated with all details
5. PDF stored and linked to reservation
6. Available for download anytime

## API Endpoints

See [API_GUIDE.md](docs/API_GUIDE.md) for complete API documentation.

Key endpoints:

- `POST /api/auth/register` - Create new user
- `GET /api/equipment` - List equipment with filters
- `POST /api/reservations` - Create reservation
- `POST /api/waivers/generate` - Generate waiver PDF
- `GET /api/analytics` - System statistics

## Security Features

- Password hashing with bcrypt
- JWT-based session authentication
- Role-based access control
- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- XSS protection (React defaults)
- CSRF protection (NextAuth)

## Deployment

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

Supported platforms:
- Vercel (recommended)
- Railway
- Self-hosted (VPS/Dedicated)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is proprietary software for Catawba College Communication Arts and Media.

## Support

For issues or questions:
- **Email**: aannas@catawba.edu
- **Phone**: (704) 604-9093
- **Location**: Ketner Hall 3210, Catawba College

---

Built with ❤️ for Catawba College Communication Arts and Media
