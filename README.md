# Japanese Learning App

A comprehensive Japanese language learning platform built with Angular and NestJS.

## 📚 Project Overview

This platform provides an organized, interactive environment for learning Japanese through vocabulary management, flashcard study, reading materials, and kanji practice.

### Features

- **Vocabulary Management**: 
  - Create, edit, and delete vocabulary words with translations, readings, and example sentences
  - Organize words into custom folders with color coding (20 predefined colors)
  - Drag and drop words between folders
  - Filter vocabulary by folder or view all words
  
- **Flashcard System**: 
  - Spaced Repetition System (SRS) with automatic scheduling
  - Study due flashcards with 4 difficulty ratings (Again, Hard, Good, Easy)
  - Track learning progress with review history
  
- **Books & Reading**: 
  - Import and read Japanese books with chapter navigation
  - Filter books by JLPT level (N1-N5)
  - Chapter-based reading structure

- **Kanji Study**: 
  - Learn Japanese Kanji characters
  - Organized by JLPT levels

- **Modern UI**: 
  - Dark/Light theme support
  - Built with Tailwind CSS and Angular Material
  - Responsive design

## 🏗️ Project Structure

```
jlpt-study-app/
├── frontend/              # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/  # Feature modules (Vocabulary, Books, Kanji)
│   │   │   ├── core/     # Services, guards, interceptors
│   │   │   └── shared/   # Shared components
│   │   ├── main.ts       # Entry point
│   │   └── styles.css    # Global styles
│   ├── package.json
│   ├── angular.json
│   └── tailwind.config.js
│
├── backend/               # NestJS application
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── vocabulary/   # Vocabulary CRUD & Folders
│   │   ├── study-data/   # Flashcards & SRS logic
│   │   ├── books/        # Books & Chapters
│   │   └── database/     # SQLite database
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
- **SQLite** - Lightweight database
- **JWT** - Token-based authentication
- **Jest** - Testing framework

## 📖 Pages

### Vocabulary Page (`/vocabulary`)
Manage your personal vocabulary collection:
- Add new words with readings, translations, and example sentences
- Create custom folders with color coding
- Drag and drop words between folders
- Edit and delete vocabulary entries
- Filter by folder or view all words

### Flashcards Page (`/flashcards`)
Study vocabulary using spaced repetition:
- Review flashcards that are due for study
- Rate difficulty: Again, Hard, Good, Easy
- Automatic scheduling based on performance
- Track learning progress

### Books Page (`/books`)
Read Japanese books with chapter navigation:
- Browse books filtered by JLPT level (N1-N5)
- Navigate through chapters
- Integrated reading experience

### Kanji Page (`/kanji`)
Learn Japanese Kanji characters organized by JLPT levels

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

## 🔐 Authentication

The app uses JWT-based authentication:

- `POST /auth/register` — Create account (`email`, `password`)
- `POST /auth/login` — Sign in and receive `accessToken`
- Protected endpoints require `Authorization: Bearer <token>` header

`JWT_SECRET` can be configured as an environment variable for backend runtime. If not provided, a local development fallback secret is used.

## 🔄 API Endpoints

### Authentication
```
POST   /auth/register          Create new user account
POST   /auth/login             Sign in and get access token
```

### Vocabulary Management
```
GET    /vocabulary             Get all vocabulary (auth required)
POST   /vocabulary             Create new vocabulary entry (auth required)
PUT    /vocabulary/:id         Update vocabulary entry (auth required)
DELETE /vocabulary/:id         Delete vocabulary entry (auth required)
PATCH  /vocabulary/:id/move-to-folder  Move word to folder (auth required)
```

### Folder Management
```
GET    /vocabulary/folders          Get all folders (auth required)
POST   /vocabulary/folders          Create new folder (auth required)
DELETE /vocabulary/folders/:id     Delete folder (auth required)
GET    /vocabulary/folders/:id     Get vocabulary by folder (auth required)
```

### Flashcards (SRS)
```
GET    /flashcards                  Get all flashcards (auth required)
GET    /flashcards/due              Get due flashcards (auth required)
POST   /flashcards/review/:id       Submit flashcard review (auth required)
```

### Books & Reading
```
GET    /books                       Get all books
GET    /books/:bookId/chapters      Get chapters for a book
```

### Kanji
```
GET    /kanji                       Get all kanji
```

## 📦 Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
```
Output will be in `frontend/dist/`

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
