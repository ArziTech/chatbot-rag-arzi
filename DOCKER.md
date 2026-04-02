# Docker Deployment Guide

Complete guide for deploying Arzi StarterKit using Docker in development, staging, and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Staging](#staging)
- [Production](#production)
- [Database Management](#database-management)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.20+
- 4GB RAM minimum (8GB recommended)
- 10GB disk space

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ArziTech/nextjs-arzi-starterkit.git
cd nextjs-arzi-starterkit

# Copy environment file
cp .env.docker.example .env

# Edit .env with your values
nano .env

# Start development environment
make dev
```

## Environment Setup

### 1. Environment Variables

Copy `.env.docker.example` to `.env` and configure:

```bash
# Required variables
DATABASE_URL=postgresql://arzi:your_password@postgres:5432/arzi?schema=public
AUTH_SECRET=your_auth_secret_minimum_32_characters
NEXT_PUBLIC_API_URL=http://localhost:3000

# Generate secure secrets
openssl rand -base64 32
```

### 2. Directory Structure

Create necessary directories:

```bash
mkdir -p backups/{staging,production}
mkdir -p nginx/logs
```

## Development

### Start Development Environment

```bash
# Using Makefile
make dev

# Or using docker-compose directly
docker-compose up --build
```

### Development with Tools

```bash
# Start with pgAdmin and Redis Commander
make dev-tools

# Access tools:
# - Application: http://localhost:3000
# - pgAdmin: http://localhost:5050
# - Redis Commander: http://localhost:8081
```

### Common Development Commands

```bash
# View logs
make logs

# Access application shell
make shell-app

# Run Prisma migrations
make prisma-migrate

# Seed database
make prisma-seed

# Reset database
docker-compose down -v
docker-compose up -d
make prisma-push
make prisma-seed
```

## Staging

### Deploy to Staging

```bash
# Set staging environment variables
export STAGING_DATABASE_URL="postgresql://arzi:password@postgres:5432/arzi_staging?schema=public"
export STAGING_AUTH_SECRET="staging_secret_minimum_32_characters"

# Deploy
make staging

# Or manually
docker-compose -f docker-compose.staging.yml up -d --build
```

### Staging URL

- **Application**: https://staging.arzi.com (or your configured URL)
- **Status**: Check with `make health`

## Production

### Deploy to Production

```bash
# Set production environment variables
export PROD_DATABASE_URL="postgresql://arzi:strong_password@postgres:5432/arzi?schema=public"
export PROD_AUTH_SECRET="strong_production_secret_minimum_32_characters"

# Deploy
make prod

# Or manually
docker-compose -f docker-compose.prod.yml up -d --build
```

### Production Checklist

- [ ] Set strong passwords in `.env`
- [ ] Configure SSL certificates in `nginx/ssl-production/`
- [ ] Update `nginx/nginx-production.conf` with your domain
- [ ] Set up automated backups
- [ ] Configure monitoring
- [ ] Review security settings

## Database Management

### Backup Database

```bash
# Development backup
make backup

# Staging backup
make backup-staging

# Production backup
make backup-prod
```

### Restore Database

```bash
# Restore from backup
make restore

# Or manually
docker-compose exec -T postgres psql -U arzi arzi_dev < backups/backup_file.sql
```

### Database Shell Access

```bash
# Access PostgreSQL shell
make shell-postgres

# Common queries
\l                    # List databases
\dt                   # List tables
\du                   # List users
\q                    # Quit
```

### Prisma Operations

```bash
# Generate Prisma Client
make prisma-generate

# Push schema changes
make prisma-push

# Run migrations
make prisma-migrate

# Seed database
make prisma-seed

# Open Prisma Studio
make prisma-studio
```

## Monitoring & Logs

### View Logs

```bash
# Application logs
make logs

# All service logs
make logs-all

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Health Check

```bash
# Check container status
make health

# Or manually
docker-compose ps

# Check application health
curl http://localhost:3000/api/health
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
docker volume inspect <volume_name>
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
make down
make build
make up
```

### Clean Up

```bash
# Remove all containers and volumes
make clean

# Remove unused images
make clean-images

# Or manual cleanup
docker-compose down -v
docker system prune -a
```

### Database Maintenance

```bash
# Reindex database
docker-compose exec postgres psql -U arzi -d arzi_dev -c "REINDEX DATABASE arzi_dev;"

# Vacuum database
docker-compose exec postgres psql -U arzi -d arzi_dev -c "VACUUM ANALYZE;"

# Check database size
docker-compose exec postgres psql -U arzi -d arzi_dev -c "SELECT pg_size_pretty(pg_database_size('arzi_dev'));"
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

#### 2. Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Verify connection
docker-compose exec postgres pg_isready -U arzi
```

#### 3. Permission Issues

```bash
# Fix volume permissions
sudo chown -R $USER:$USER .

# Or run with correct user
docker-compose up --user=$(id -u):$(id -g)
```

#### 4. Out of Memory

```bash
# Check Docker memory limit
docker system info

# Increase Docker memory limit in Docker Desktop settings
# Or add resource limits to docker-compose.yml
```

#### 5. Build Failures

```bash
# Clean rebuild
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Debug Mode

```bash
# Enable debug logging
docker-compose up --build 2>&1 | tee debug.log

# Check container inspect
docker inspect <container_name>

# Access container shell
docker-compose exec app sh
```

## Security Best Practices

1. **Never commit `.env` files**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use strong passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

3. **Rotate secrets regularly**
   - Change passwords every 90 days
   - Rotate AUTH_SECRET after deployments

4. **Enable SSL/TLS**
   - Use HTTPS in production
   - Configure SSL certificates in nginx/

5. **Limit container resources**
   - Set memory and CPU limits
   - Use `--restart=always` in production

6. **Regular backups**
   - Automated daily backups
   - Test restore procedures
   - Store backups off-site

## Performance Optimization

### Docker Optimization

1. **Use Multi-stage Builds** (already implemented)
2. **Layer Caching**
   ```dockerfile
   # Copy package files first
   COPY package.json bun.lockb ./
   RUN bun install
   # Copy source code
   COPY . .
   ```

3. **Resource Limits**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2.0'
         memory: 2G
   ```

### Application Optimization

1. **Enable Next.js Standalone Output** (already configured)
   ```js
   // next.config.js
   module.exports = {
     output: 'standalone'
   }
   ```

2. **Use Redis for Caching**
   - Session storage
   - API response caching
   - Database query caching

3. **Database Optimization**
   - Use connection pooling
   - Enable query caching
   - Regular vacuum and analyze

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to staging
        run: |
          docker-compose -f docker-compose.staging.yml up -d --build
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/ArziTech/nextjs-arzi-starterkit/issues
- Documentation: https://github.com/ArziTech/nextjs-arzi-starterkit/wiki
