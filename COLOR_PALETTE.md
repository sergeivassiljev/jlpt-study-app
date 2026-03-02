# JLPT Study App - Color Palette Reference

## Overview
Custom color system with light/dark mode support using CSS variables and Tailwind config.

---

## Light Mode (Default)
| Color | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| Background | `#f8f5f2` | Page backgrounds, cards | `--bg-color` |
| Headline | `#232323` | H1-H6 text, titles | `--headline-color` |
| Paragraph | `#222525` | Body text, descriptions | `--paragraph-color` |
| Button (Primary) | `#078080` | CTA buttons, links | `--button-color` |
| Accent 1 (Secondary) | `#f45d48` | Alerts, highlights | `--accent-secondary-color` |
| Accent 2 (Tertiary) | `#2cb67d` | Success states, badges | `--accent-tertiary-color` |
| Input | `#fffffe` | Form inputs, text areas | `--input-color` |
| Input Focus | `rgba(7, 128, 128, 0.2)` | Input focus box-shadow | `rgba(7, 128, 128, ...` |

---

## Dark Mode
| Color | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| Background | `#16161a` | Page backgrounds, cards | `--bg-color` |
| Headline | `#fffffe` | H1-H6 text, titles | `--headline-color` |
| Paragraph | `#94a1b2` | Body text, descriptions | `--paragraph-color` |
| Button (Primary) | `#7f5af0` | CTA buttons, links | `--button-color` |
| Accent 1 (Secondary) | `#f45d48` | Alerts, highlights | `--accent-secondary-color` |
| Accent 2 (Tertiary) | `#2cb67d` | Success states, badges | `--accent-tertiary-color` |
| Input | `#27272f` | Form inputs, text areas | `--input-color` |
| Input Focus | `rgba(127, 90, 240, 0.2)` | Input focus box-shadow | `rgba(127, 90, 240, ...` |

---

## Semantic Color Names (Tailwind Classes)
Use these Tailwind classes for consistent styling:

### Primary Colors
- `bg-primary` / `text-primary` - `#078080` (light), `#7f5af0` (dark)
- `bg-primary-dark` / `text-primary-dark` - `#7f5af0` (dark mode primary)

### Secondary Colors
- `bg-secondary` / `text-secondary` - `#f45d48` (coral - same in both modes)
- `bg-success` / `text-success` - `#2cb67d` (green - same in both modes)

### Mode-Specific Colors
- `bg-light-bg` - `#f8f5f2` (light backgrounds)
- `bg-dark-bg` - `#16161a` (dark backgrounds)
- `text-light-headline` / `text-dark-headline` - Headlines
- `text-light-paragraph` / `text-dark-paragraph` - Body text
- `bg-light-button` / `bg-dark-button` - Button backgrounds

---

## CSS Variable Usage Examples

### In HTML Templates
```html
<!-- Using CSS variables via inline styles -->
<div [style.backgroundColor]="'var(--bg-color)'" 
     [style.color]="'var(--paragraph-color)'">
  Content
</div>

<!-- Using Tailwind classes with new colors -->
<button class="bg-primary text-white rounded hover:bg-primary-dark">
  Click Me
</button>

<!-- Light/Dark specific -->
<div class="bg-light-bg dark:bg-dark-bg text-light-paragraph dark:text-dark-paragraph">
  Responsive text
</div>
```

### In Tailwind Config
```javascript
// Already configured in tailwind.config.js
colors: {
  primary: '#078080',
  'primary-dark': '#7f5af0',
  secondary: '#f45d48',
  success: '#2cb67d',
  'light-bg': '#f8f5f2',
  'light-headline': '#232323',
  'light-paragraph': '#222525',
  'light-button': '#078080',
  'dark-bg': '#16161a',
  'dark-headline': '#fffffe',
  'dark-paragraph': '#94a1b2',
  'dark-button': '#7f5af0',
}
```

---

## How Theme Switching Works

1. **User toggles theme** (via ThemeService)
2. **Theme service sets HTML attribute**: `<html data-theme="dark">`
3. **CSS variables update** based on `[data-theme="dark"]` selector
4. **All components using CSS variables** update instantly
5. **Transition effect** smooths the color change (0.3s ease)

---

## Migration Checklist

When updating existing components, replace:

| Old Approach | New Approach |
|--------------|--------------|
| `currentTheme === 'dark' ? 'bg-slate-800' : 'bg-white'` | `class="bg-dark-bg dark:bg-light-bg"` or CSS variable |
| `'text-blue-600'` | `class="text-primary"` |
| `'bg-green-700'` | `class="bg-success"` |
| Hardcoded hex colors | CSS variables with `var(--variable-name)` |
| Theme-dependent ternary logic | Tailwind `dark:` prefix |

---

## Testing Theme Switch

1. Open app in browser (dev server)
2. Click theme toggle button
3. Verify smooth color transition
4. Check:
   - ✅ Light mode: Teal (#078080) buttons, beige (#f8f5f2) background
   - ✅ Dark mode: Purple (#7f5af0) buttons, dark gray (#16161a) background
   - ✅ Coral (#f45d48) visible in alerts
   - ✅ Green (#2cb67d) visible in success states
   - ✅ Text readable (WCAG contrast ratio)

---

## Files Updated

- `src/styles.css` - CSS variables for light/dark modes
- `tailwind.config.js` - Color token definitions
- `src/theme.service.ts` - Theme switching with `data-theme` attribute
- Components (WIP) - Updating to use new color system

---

## Quick Reference - Most Used Colors

```
Primary Button:  🟦 Light: #078080 (teal)     Dark: #7f5af0 (purple)
Secondary Alert: 🟥 Both:  #f45d48 (coral)
Success Badge:   🟩 Both:  #2cb67d (green)
Page Background: Light: #f8f5f2 (beige)     Dark: #16161a (dark gray)
Text Color:      Light: #222525 (dark)      Dark: #94a1b2 (light gray)
```

