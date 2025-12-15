# NGO Reporting System 

## Tech Stack
- **Frontend**: React 18 + Material-UI (MUI)
- **Backend**: Django 5 + DRF + Celery 5.3
- **Database**: SQLite
- **Queue**: Redis + Celery (async bulk processing)
- **Deployment**: Docker Compose + Render ready


## Quick Setup (5 mins)
git clone <repo>
cd ngo-reporting-app

Option 1: Docker (Recommended)
docker-compose up --build

Option 2: Manual (Windows-friendly)
cd backend && python manage.py migrate

Terminal1: redis-server
Terminal2: python manage.py runserver
Terminal3: celery -A backend worker -l info -P solo
Terminal4: cd frontend && npm start


**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/admin
- API: http://localhost:8000/api/report/

## Features Implemented ✅
- Single report form (idempotent)
- Bulk CSV upload w/ **async Celery processing**
- **Real-time job progress** ("3/3 processed")
- Admin dashboard w/ **month selector**
- **Partial failure handling** (bad rows skipped)
- **MUI components** + responsive design
- **Docker deployment**
- Windows-compatible (`-P solo`)

## Sample CSV
ngo_id,month,people_helped,events_conducted,funds_utilized
NGO001,2025-11,150,5,25000.50
NGO002,2025-11,200,8,45000.00
NGO33433,2025-10,150,5,250560.50
NGO44232,2025-10,200,8,456530.00
NGO12321,2025-10,300,10,756760.00
NGO1232143,2025-10,300,10,75053450.00
NGO1232132,2025-10,300,10,75535.00


## Architecture Decisions
1. **Idempotency**: `unique_together=['ngo_id','month']`
2. **Scalability**: Celery workers scale horizontally
3. **Partial Failures**: Row-by-row processing + error tracking
4. **Windows**: `-P solo` flag for compatibility

## AI Usage
- **Perplexity AI**: Full architecture, debugging, React components, MUI styling

## Production Improvements
- PostgreSQL + Read Replicas
- JWT Admin Auth
- S3 file storage
- Rate limiting
- Database indexes
