# JLPT Study App - NestJS Backend

## Overview
This directory contains the NestJS backend for the JLPT Study App.

## Planned Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── kanji/          # Kanji management module
│   │   ├── books/          # Books management module
│   │   ├── grammar/        # Grammar lessons module
│   │   └── users/          # User management module
│   ├── app.module.ts       # Root module
│   └── main.ts             # Entry point
├── test/                   # Test files
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── nest-cli.json           # NestJS CLI configuration
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run start:dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## API Endpoints (To be implemented)

- `GET /api/kanji` - Get kanji list
- `GET /api/books` - Get books list
- `GET /api/grammar` - Get grammar lessons
- `POST /api/users` - Create user account
