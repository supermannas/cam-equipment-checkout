# Equipment Checkout System - Deployment Guide

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Git
- Access to a server or cloud hosting platform (Vercel, Railway, Render, etc.)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd equipment-checkout
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/equipment_checkout"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# Application
NODE_ENV=development
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 4. Set Up Database
```bash
# Create PostgreSQL database
createdb equipment_checkout

# Run Prisma migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## Production Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Connect to Vercel
```bash
npm i -g vercel
vercel login
```

#### Step 2: Configure Project
```bash
vercel link
```

#### Step 3: Set Environment Variables in Vercel Dashboard
- `DATABASE_URL`: Your production PostgreSQL connection string
- `NEXTAUTH_URL`: Your production domain (e.g., https://equipment.catawba.edu)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

#### Step 4: Deploy
```bash
vercel --prod
```

#### Step 5: Run Migrations
After deployment, run migrations using Vercel's serverless functions or a separate migration service:
```bash
npx prisma migrate deploy
```

### Option 2: Railway

#### Step 1: Connect to Railway
```bash
npm i -g railway
railway login
```

#### Step 2: Initialize Project
```bash
railway init
```

#### Step 3: Add PostgreSQL Plugin
```bash
railway add postgres
```

#### Step 4: Set Environment Variables
```bash
railway variables set DATABASE_URL=<your-postgres-url>
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set NEXTAUTH_SECRET=<generated-secret>
```

#### Step 5: Deploy
```bash
railway up
```

#### Step 6: Run Migrations
```bash
railway run npx prisma migrate deploy
```

### Option 3: Self-Hosted (VPS/Dedicated Server)

#### Step 1: Install Prerequisites
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib nginx

# Verify installations
node --version  # Should be 18+
npm --version
```

#### Step 2: Set Up PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE equipment_checkout;
CREATE USER equipment_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE equipment_checkout TO equipment_user;
\q
```

#### Step 3: Clone and Install
```bash
cd /var/www
git clone <repository-url> equipment-checkout
cd equipment-checkout
npm ci --production
```

#### Step 4: Configure Environment
```bash
cp .env.example .env
nano .env
```

Fill in:
- `DATABASE_URL="postgresql://equipment_user:secure_password@localhost:5432/equipment_checkout"`
- `NEXTAUTH_URL=https://equipment.catawba.edu`
- `NEXTAUTH_SECRET=<generated-secret>`

#### Step 5: Run Migrations
```bash
npx prisma migrate deploy
npx prisma db seed
```

#### Step 6: Build Application
```bash
npm run build
```

#### Step 7: Set Up PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 start npm --name "equipment-checkout" -- start
pm2 save
pm2 startup
```

#### Step 8: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/equipment-checkout
```

Add configuration:
```nginx
server {
    listen 80;
    server_name equipment.catawba.edu;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/equipment-checkout /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 9: Set Up SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d equipment.catawba.edu
```

---

## Database Configuration

### Production PostgreSQL Settings

Optimize `postgresql.conf`:
```conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Connection Pooling

For production, use a connection pooler like PgBouncer:
```bash
sudo apt install pgbouncer
```

Configure in `/etc/pgbouncer/pgbouncer.ini`:
```ini
[databases]
equipment_checkout = host=localhost port=5432 dbname=equipment_checkout

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = scram-sha-256
auth_file = /etc/postgresql/14/main/pg_hba.conf
pool_mode = transaction
max_client_conn = 200
default_pool_size = 20
```

Update `DATABASE_URL` to use PgBouncer:
```env
DATABASE_URL="postgresql://equipment_user:password@localhost:6432/equipment_checkout?connection_limit=20"
```

---

## Monitoring and Logging

### Application Monitoring

Install and configure:
- **PM2** for process management and monitoring
- **Log rotation** for application logs
- **Error tracking** with Sentry or similar

### Database Monitoring
```bash
# Install pg_stat_statements
sudo -u postgres psql -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
```

### Health Checks

Create a health check endpoint at `/api/health`:
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'healthy' })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy' }, { status: 500 })
  }
}
```

---

## Security Hardening

### Environment Variables
- Never commit `.env` files to version control
- Use secret management services (Vercel Secrets, Railway Environment Variables)
- Rotate secrets regularly

### Database Security
- Use strong passwords
- Limit database user privileges
- Enable PostgreSQL SSL
- Configure firewall rules

### Application Security
- Enable HTTPS everywhere
- Implement rate limiting
- Use Content Security Policy headers
- Keep dependencies updated

### Backup Strategy
```bash
# Daily database backup script
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U equipment_user equipment_checkout > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

---

## Troubleshooting

### Common Issues

**Migration Failures**
```bash
# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

**Connection Errors**
```bash
# Test database connection
npx prisma db pull

# Check PostgreSQL status
sudo systemctl status postgresql
```

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm ci
npm run build
```

### Debug Mode

Enable debug logging:
```env
DEBUG=prisma:client
```

---

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Store images on CDN or object storage (S3, Cloudflare R2)
- Implement lazy loading

### Database Optimization
- Add indexes on frequently queried columns
- Use connection pooling
- Implement query caching

### Caching Strategy
```typescript
// Implement simple in-memory cache
const cache = new Map()

export async function getEquipmentWithCache(id: string) {
  const cacheKey = `equipment:${id}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const data = await prisma.equipment.findUnique({ where: { id } })
  cache.set(cacheKey, data)
  return data
}
```

---

## Maintenance Tasks

### Regular Tasks
- **Daily**: Check error logs, monitor disk space
- **Weekly**: Review analytics, check for updates
- **Monthly**: Database vacuum, backup verification
- **Quarterly**: Security audit, performance review

### Update Procedure
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Run migrations
npx prisma migrate deploy

# Rebuild
npm run build

# Restart application
pm2 restart equipment-checkout
```

---

## Support Contacts

- **System Administrator**: [Your IT Contact]
- **Database Administrator**: [DBA Contact]
- **Emergency Support**: [Emergency Contact]

For issues, check:
1. Application logs (`pm2 logs equipment-checkout`)
2. Database logs (`/var/log/postgresql/`)
3. Nginx logs (`/var/log/nginx/`)
