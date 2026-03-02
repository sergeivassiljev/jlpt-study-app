# JLPT Study App

A comprehensive Japanese language studying platform built with Angular and NestJS.

## 📚 Project Overview

This project is designed to help users prepare for the Japanese Language Proficiency Test (JLPT) through an organized, interactive learning platform.

### Features

- **Kanji Study**: Learn and practice Japanese Kanji characters organized by JLPT levels
- **Study Books**: Recommended resources and materials for JLPT preparation
- **Grammar Lessons**: Comprehensive grammar patterns and sentence structures
- **Modern UI**: Built with Tailwind CSS and Angular Material

## 🏗️ Project Structure

```
jlpt-study-app/
├── frontend/              # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/    # Kanji, Books, Grammar pages
│   │   │   └── shared/   # Shared components
│   │   ├── main.ts       # Entry point
│   │   └── styles.css    # Global styles
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
│
├── backend/               # NestJS application
│   ├── src/
│   │   └── modules/      # Feature modules
│   └── package.json
│
└── .github/
    └── copilot-instructions.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Angular CLI 18+

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

4. Open browser to `http://localhost:4200`

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run start:dev
   ```

## 🛠️ Technology Stack

### Frontend

- **Angular 18** - Latest stable version
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Angular Material** - Material design components
- **RxJS** - Reactive programming library

### Backend

- **NestJS 10** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **TypeORM** - ORM for database management
- **Jest** - Testing framework

## 📖 Pages

### Kanji Page (`/kanji`)
Learn Japanese Kanji characters organized by JLPT levels (N1, N2, N3, etc.)

### Books Page (`/books`)
Discover recommended study materials and textbooks for JLPT preparation

### Grammar Page (`/grammar`)
Master essential Japanese grammar patterns including:
- Particles (助詞)
- Verb Conjugation
- Adjectives & Adverbs
- Sentence Structures

## 🎯 Development

### Available Scripts

**Frontend:**
- `npm start` - Start development server with auto-open browser
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter

**Backend:**
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## 📝 Configuration

### Tailwind CSS
The frontend uses Tailwind CSS for styling. Configuration is in `frontend/tailwind.config.js`

### Angular Material
Angular Material components are available for enhanced UI elements. Import from `@angular/material` as needed.

## � Authentication

The app now uses JWT-based authentication:

- `POST /auth/register` — create account (`email`, `password`)
- `POST /auth/login` — sign in and receive `accessToken`
- Protected endpoints (`/vocabulary`, `/flashcards`) require `Authorization: Bearer <token>`

`JWT_SECRET` can be configured as an environment variable for backend runtime. If not provided, a local development fallback secret is used.

## 🔄 API Endpoints

Current backend endpoints include:

```
POST   /auth/register
POST   /auth/login
GET    /books
GET    /books/:bookId/chapters
GET    /kanji
GET    /vocabulary            (auth required)
POST   /vocabulary            (auth required)
GET    /flashcards            (auth required)
GET    /flashcards/due        (auth required)
```

## 📦 Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
```
Output will be in `frontend/dist/jlpt-study-app/`

### Backend Build
```bash
cd backend
npm run build
```
Output will be in `backend/dist/`

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- Components are modular and reusable
- Tests are included for new features

## 📄 License

MIT License

## 📞 Support

For questions or issues, please open an issue in the repository.

---

**Happy studying! 頑張って! (Ganbare!)**
