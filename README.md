# Agenthive 🤖

A powerful AI agent management platform that enables seamless interaction with various AI agents for different tasks.


## 🌟 Features

- 🤖 Multiple AI Agent Support
- 💬 Real-time Chat Interface
- 📊 Interactive Dashboard
- 🔄 GitHub Integration
- 📧 Email Management
- 📅 Calendar Integration
- 🛍️ Shopify Integration
- ⚙️ Custom Agent Configuration

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (handled by Docker)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/agenthive.git
cd agenthive
```

2. Start the application:
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Docker Commands

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up --build

# Stop and remove volumes
docker-compose down -v
```

### Local Development

1. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

2. Set up environment variables:
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/agenthive
PORT=5000
NODE_ENV=development

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development servers:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## 🏗️ Project Structure

```
agenthive/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── public/           # Static files
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   └── services/   # Business logic
│   └── config/         # Configuration files
└── docker-compose.yml   # Docker configuration
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Backend server port
- `NODE_ENV`: Environment (development/production)

#### Frontend
- `REACT_APP_API_URL`: Backend API URL

### Docker Configuration

The application uses three main services:
- Frontend (React)
- Backend (Node.js)
- MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
