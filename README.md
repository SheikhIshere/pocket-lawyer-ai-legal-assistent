<div align="center">
  <img src="asset/logo.png" alt="PocketLawyer Logo" width="200"/>
  
  # PocketLawyer
  
  **AI-powered legal assistance platform providing accessible legal guidance 24/7**
  
  *[Your legal companion in your pocket]*
</div>

## Overview

PocketLawyer is a full-stack web application that leverages Google's Gemini AI to provide intelligent legal consultations, document analysis, and personalized legal guidance. The platform features a modern React frontend with Django REST API backend, supporting real-time chat sessions, user authentication, and comprehensive case management.

## User Interface

<div align="center">

| Light Mode | Dark Mode |
|---|---|
| <img src="asset/screenshot/screencapture-localhost-3000-2026-02-24-14_39_05.png" alt="Light Mode" width="450"/> | <img src="asset/screenshot/screencapture-localhost-3000-2026-02-24-14_40_13.png" alt="Dark Mode" width="450"/> |

</div>

### Mobile Responsive Design

<div align="center">
  <img src="asset/screenshot/Screenshot from 2026-02-24 14-53-52.png" alt="Mobile View" width="300"/>
</div>

**Frontend Features:**
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Theme Switching**: Seamless light/dark mode toggle
- **Modern UI/UX**: Built with React, TypeScript, and TailwindCSS
- **Smooth Animations**: Framer Motion for fluid transitions
- **Real-time Updates**: WebSocket integration for live chat

## AI Consultation Example

<div align="center">
  <img src="asset/screenshot/screencapture-localhost-3000-2026-02-24-14_44_31.png" alt="AI Legal Consultation" width="600"/>
</div>

**Gemini AI Integration:**
- **Bangladeshi Law Context**: Specialized knowledge base for local legal system
- **Contextual Responses**: Full conversation history awareness
- **Multi-Style Support**: Supportive, Casual, and Deep analysis modes
- **Real-time Processing**: Async responses with status tracking

## Architecture

### Technology Stack

**Frontend:**
- React 19.2.3 with TypeScript
- Vite 6.2.0 for build tooling
- React Router 7.12.0 for navigation
- Framer Motion 12.28.1 for animations
- TailwindCSS for styling
- Lucide React for icons

**Backend:**
- Django 6.0.1 with Django REST Framework
- PostgreSQL 17.1 database
- Celery with RabbitMQ for background tasks
- Google Gemini AI for legal assistance
- JWT authentication with Simple JWT
- Docker containerization

**Infrastructure:**
- Docker Compose for orchestration
- PostgreSQL for data persistence

## Features

### Core Backend Functionality
- **AI Legal Consultation**: Real-time chat with Gemini AI models using sophisticated prompt engineering
- **Advanced Session Management**: Persistent chat history with AI-generated contextual titles
- **Multi-Model AI Support**: Intelligent fallback hierarchy across multiple Gemini models
- **Background Task Processing**: Celery workers with RabbitMQ for scalable async operations
- **Secure API Key Management**: Per-account API key configuration with field-level encryption

### Advanced Backend Features
- **Database Optimization**: PostgreSQL with optimized queries and indexing
- **JWT Authentication**: Secure token-based authentication with refresh mechanisms
- **RESTful API Design**: Comprehensive API with OpenAPI/Swagger documentation
- **Error Handling & Logging**: Comprehensive exception handling with detailed logging
- **Performance Monitoring**: Real-time request tracking and performance metrics

### Frontend Integration
- **Responsive Design**: Mobile-first design with progressive enhancement
- **Real-time Updates**: WebSocket integration for live chat updates
- **Theme Switching**: Seamless light/dark mode toggle
- **Modern UI/UX**: Built with React, TypeScript, and TailwindCSS

### System Features
- **Document Export**: Export chat sessions and legal documents
- **Newsletter System**: Email subscription management with Django email backend
- **Contact Management**: Professional contact form handling
- **Admin Panel**: Comprehensive Django admin for content management

## Project Structure

```
pocket-lawyer/
├── backend/                    # Django backend
│   ├── core/                  # Core Django settings
│   ├── users/                 # User management
│   ├── accounts/              # Account profiles
│   ├── chat_bot/              # AI chat functionality
│   ├── api_key/               # API key management
│   ├── newsletter/            # Newsletter subscriptions
│   ├── contact_us/            # Contact form handling
│   └── BASE/                  # Base models and utilities
├── frontend/                   # React frontend
│   ├── components/            # Reusable React components
│   ├── context/               # React context providers
│   ├── services/              # API service layer
│   └── pages/                 # Page components
├── docs/                      # Documentation
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Backend container
├── Dockerfile.frontend        # Frontend container
└── requirements.txt           # Python dependencies
```

## API Endpoints

### Authentication
- `POST /v1/api/users/register/` - User registration
- `POST /v1/api/users/login/` - User login
- `POST /v1/api/users/refresh/` - Token refresh

### Chat System
- `POST /v1/api/assistant/` - Create AI consultation
- `GET /v1/api/assistant/sessions/` - List chat sessions
- `GET /v1/api/assistant/sessions/{id}/` - Get session details

### Account Management
- `GET /v1/api/accounts/profile/` - User profile
- `PUT /v1/api/accounts/profile/` - Update profile
- `POST /v1/api/accounts/api-key/` - Manage API keys

### Additional Services
- `POST /v1/api/newsletter/subscribe/` - Newsletter subscription
- `POST /v1/api/contact-us/` - Contact form submission

## AI Chat System Design

<div align="center">

| Chat Request Flow | Session Management |
|---|---|
| <img src="asset/github-readme/chat-request-flowchart.png" alt="Chat Request Flow" width="400"/> | <img src="asset/github-readme/chatsession-flowchart.png" alt="Session Management" width="400"/> |

</div>

### Backend Implementation (`backend/chat_bot`)

The chat system is engineered with sophisticated backend architecture:

**Chat Request Processing:**
1. **Request Reception**: `AiRequest` model captures user queries with metadata
2. **API Key Management**: Secure per-account API key retrieval and validation
3. **Model Selection**: Intelligent fallback hierarchy (Gemini 3 Flash → Gemini 2.5 Flash → Gemma 3 27B)
4. **Background Processing**: Celery workers handle AI requests asynchronously
5. **Response Storage**: Structured storage with engine and style metadata

**Session Management:**
1. **Auto-Session Creation**: Automatic session generation for new conversations
2. **Title Generation**: AI-powered title creation using conversation context
3. **Message History**: JSON-based message storage with full conversation context
4. **Status Tracking**: Real-time status updates (PENDING → RUNNING → COMPLETED/FAILED)

**Key Backend Features:**
- **Multi-Model Support**: Seamless fallback between Gemini models
- **Error Handling**: Comprehensive exception handling with graceful degradation
- **Performance Optimization**: Async processing with Celery workers
- **Data Encryption**: Secure API key storage using Django field encryption
- **Conversation Context**: Full history awareness for contextual responses

## Database Schema

<div align="center">
  <img src="asset/github-readme/poket-lawyer-database.png" alt="Database Design" width="600"/>
</div>

### Core Models
- **User**: Custom user model with extended fields
- **Account**: User profile and subscription information
- **ChatSession**: Chat conversation history with auto-generated titles
- **AiRequest**: Individual AI consultation requests with multi-model support
- **ApiKey**: Per-account API key management with encryption

### Relationships
- User → Account (1:1)
- Account → ChatSession (1:N)
- Account → AiRequest (1:N)
- ChatSession → AiRequest (1:N)
- Account → ApiKey (1:N)

## Environment Configuration

Create a `.env` file in the project root:

```env
# Database
DB_HOST=localhost
DB_NAME=pocket_lawyer
DB_USER=postgres
DB_PASS=password
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key
DEBUG=True

# AI Services
GEMINI_API_KEY=your-gemini-api-key
DJANGO_CRYPTO_KEY=your-encryption-key

# Message Queue
CELERY_BROKER_URL=amqp://user:pass@localhost:5672//
RABBITMQ_DEFAULT_USER=rabbitmq
RABBITMQ_DEFAULT_PASS=password

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@pocketlawyer.ai
```

## Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.12+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd pocket-lawyer
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
clear && docker compose down && docker compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/schema/swagger-ui/
- Admin Panel: http://localhost:8000/admin/

### Development Commands

**Create new Django app:**
```bash
docker compose run --rm backend sh -c "python manage.py startapp <app_name>"
```

**Start development server:**
```bash
clear && docker compose down && docker compose up --build
```

### Local Development Setup

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

**Background Worker:**
```bash
cd backend
celery -A core worker -l INFO
```

## AI Model Configuration

### Supported Models
- **Gemini 3 Flash**: Fast responses, cost-effective
- **Gemini 2.5 Flash**: Balanced performance
- **Gemini 2.5 Flash Lite**: Lightweight option
- **Gemma 3 27B**: Advanced reasoning

### Fallback Strategy
The system automatically falls back between models based on availability and performance, ensuring reliable service delivery.

## Security Features

- JWT-based authentication with refresh tokens
- Encrypted API key storage
- CORS configuration
- CSRF protection
- SQL injection prevention
- Rate limiting capabilities

## Performance Optimization

- Celery background task processing
- Database query optimization
- Frontend code splitting
- Image optimization
- Caching strategies
- CDN-ready architecture

## Monitoring & Logging

- Comprehensive error logging
- AI request tracking
- Performance metrics
- User activity monitoring
- System health checks

## Deployment

### Production Deployment
1. Configure production environment variables
2. Set up PostgreSQL database
3. Configure Redis cache
4. Deploy with Docker Compose or Kubernetes
5. Set up reverse proxy (Nginx)
6. Configure SSL certificates

### Environment-Specific Settings
- Development: Debug mode, local database
- Staging: Production-like setup with test data
- Production: Optimized settings, monitoring enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and inquiries:
- Email: thesheikh255@gmail.com
- Documentation: Check the `/docs` directory
- Issues: Create an issue on the repository

## Disclaimer

PocketLawyer provides AI-assisted legal guidance and is not a substitute for professional legal advice. Always consult with qualified legal professionals for specific legal matters.
