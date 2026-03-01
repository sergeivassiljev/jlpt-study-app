# Frontend Setup

This frontend project uses:
- **Angular 18** - Latest stable version
- **Tailwind CSS** - Utility-first CSS framework
- **Angular Material** - Material design components
- **TypeScript** - Type-safe JavaScript

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── kanji/        # Kanji study page
│   │   │   ├── books/        # Books resource page
│   │   │   └── grammar/      # Grammar lessons page
│   │   ├── app.routes.ts     # Main routing configuration
│   │   └── app.component.*   # Root component
│   ├── main.ts               # Entry point
│   └── index.html            # HTML template
├── angular.json              # Angular CLI configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Routing

The application includes three main pages with automatic routing:
- `/kanji` - Kanji study materials
- `/books` - Study books recommendations
- `/grammar` - Grammar lessons

Default route redirects to `/kanji`.
