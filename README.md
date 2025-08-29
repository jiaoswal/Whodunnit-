# Whodunnit - Rosewood Manor Mystery

A browser-based murder mystery puzzle game built with pure HTML5, CSS, and vanilla JavaScript. Solve the murder of Clara Beaumont at Rosewood Manor!

## Current Status: Step 1 Complete ✅

The project has been successfully scaffolded with all the foundational elements specified in the PRD.

## What's Been Built

### 🎮 Core Game Structure
- **HTML Layout**: Complete game interface with suspect gallery, clue panel, action buttons, and login form
- **CSS Styling**: Dark noir theme with mobile-responsive design
- **JavaScript Foundation**: Basic game initialization and state management

### 🔐 Authentication System
- Login/Register forms with tab switching
- Supabase client setup (configurable)
- Guest play option for offline mode
- Form validation and error handling

### 🕵️ Game Mechanics Foundation
- **Suspect System**: 5 specific suspects from Rosewood Manor
  - Mr. Alfred Gray (The Butler)
  - Dr. Evelyn Cross (The Doctor) - **The Murderer**
  - James Holloway (The Writer)
  - Sophie Marlowe (The Childhood Friend)
  - Victor Kane (The Business Partner)
- **Clue System**: 25 precise clues (5 per suspect) leading to the killer
- **Game Actions**: Investigate suspects, draw clue cards, eliminate suspects

### 🎨 Visual Design
- Dark detective/noir color scheme
- Responsive grid layout for suspect cards
- Professional UI with hover effects and animations
- Mobile-first responsive design

### ⚙️ Technical Features
- Pure HTML5/CSS/JavaScript (no external engines)
- Supabase integration ready (with offline fallback)
- Game state management
- Timer system
- Win/lose condition checking

## How to Run

1. Simply open `index.html` in any modern web browser
2. The game will load and show the login screen
3. Click "Play as Guest" to start playing immediately
4. Or configure Supabase credentials in `script.js` for full authentication

## Next Steps

**Step 2**: Implement Supabase authentication system with login/register functionality
**Step 3**: Create suspect generation system with randomized characteristics  
**Step 4**: Implement clue revelation and information display systems
**Step 5**: Add suspect elimination mechanics and game state management

## File Structure

```
├── index.html          # Main game interface and login forms
├── style.css           # Dark noir theme and responsive styling
├── script.js           # Game logic, state management, and Supabase setup
├── prd.md             # Product Requirements Document
└── README.md          # This file
```

## Supabase Configuration

To enable full authentication and score saving:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update these values in `script.js`:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile-responsive design for iOS and Android
- No external dependencies required for basic functionality

---

**Ready for Step 2!** 🚀
