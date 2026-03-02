# Cache Cleanup After Auth Implementation

## Issue
After implementing user authentication, users who had previously used the app are seeing old vocabulary data that belonged to the hardcoded `demo-user`.

## Root Cause
The frontend vocabulary and SRS services cached data in localStorage using global keys (`vocabulary`, `flashcards`). This data is now obsolete because:
- Each user now has a unique `userId` (e.g., `user-1772461312044-700`)
- The old cached data has `userId: "demo-user"` which doesn't match any real user account
- The new system uses user-specific keys like `vocabulary_user-123` to isolate data per user

## Solution
You need to clear the old localStorage data. Choose one of the following methods:

### Method 1: Use the Helper HTML File
1. Open `frontend/clear-old-cache.html` in your browser
2. Click "Clear Old Cache Now"
3. Reload your JLPT app

### Method 2: Browser DevTools
1. Open your JLPT app in the browser
2. Press `F12` to open DevTools
3. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
4. In the left sidebar, expand **Local Storage**
5. Click on `http://localhost:4200`
6. Find and delete these keys:
   - `vocabulary`
   - `flashcards`
7. Reload the page

### Method 3: Browser Console
1. Open your JLPT app
2. Press `F12` to open DevTools
3. Go to the **Console** tab
4. Paste this command and press Enter:
   ```javascript
   localStorage.removeItem('vocabulary');
   localStorage.removeItem('flashcards');
   console.log('✓ Old cache cleared!');
   ```
5. Reload the page

### Method 4: Clear All Site Data (Nuclear Option)
1. Open DevTools (`F12`)
2. Go to **Application** tab
3. In the left sidebar, click **Storage**
4. Click "Clear site data" button
5. **Warning:** This will also log you out. You'll need to log in again.

## Verification
After clearing the cache:
1. Log in to your account
2. You should see **0 vocabulary items** (empty state)
3. Add a new vocabulary word
4. Check localStorage - you should see a new key like `vocabulary_user-1772461312044-700`

## Technical Details
- **Before:** `localStorage.getItem('vocabulary')` (shared by all users)
- **After:** `localStorage.getItem('vocabulary_${userId}')` (user-specific)

Each authenticated user now has isolated localStorage:
- `vocabulary_user-123` for user ID 123
- `flashcards_user-123` for user ID 123
- `vocabulary_user-456` for user ID 456
- etc.
