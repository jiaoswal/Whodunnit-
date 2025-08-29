# SYSTEM / INSTRUCTIONS FOR CURSOR
We are building an *HTML5-only browser game* with:
- Pure HTML, CSS, vanilla JavaScript (no external engines).
- Optional Supabase backend for login & score saving.
- Must run by simply opening index.html.
You must:
- Use the *PRD below* as the source of truth.
- Build step by step, incrementally improving.
- After each step, output the *full codebase* (HTML, CSS, JS).
- Wait for my confirmation before moving to the next step.
- Keep explanations short but clear.

---

# TECH PRD

## 1. Game Overview
- *Game Title:* Whodunnit
- *Game Genre:* Murder Mystery Puzzle
- *Core Gameplay Loop:* A murder has been committed. Player investigates 5 suspects by revealing clues (motive, profession, appearance, relationship with victim). Player must eliminate suspects strategically - if they eliminate the actual murderer, they lose. If the murderer is the last suspect remaining, they win.
- *Target Device:* Mobile (iOS and Android) with responsive web design

## 2. Game Mechanics
- *Player Actions:* 
  - Choose to reveal information about a suspect OR draw a clue card
  - Eliminate suspects based on gathered information
  - Make final accusation when ready
- *Suspect System:*
  - 5 suspects with unique characteristics:
    - Different appearances (hair color/style, skin color, clothing/background)
    - Different relationships with victim (friend, colleague, rival, family, stranger)
    - Different motives (money, revenge, jealousy, career, accident)
    - Different professions (doctor, teacher, business owner, artist, lawyer)
- *Clue System:*
  - 4 types of clue cards: Motive, Profession, Appearance, Relationship
  - Players can choose to get specific information about a suspect OR draw random clue cards
- *Scoring System:* Progress to next level/case upon successful solving
- *Win/Lose Conditions:* 
  - WIN: Correctly identify the murderer as the last remaining suspect
  - LOSE: Eliminate the actual murderer from consideration
  - LOSE: Run out of time (optional time limit)

## 3. Visuals & UI
- *Graphics Style:* Dark, moody detective theme with noir-inspired color palette
- *Game Screen Layout:* 
  - Suspect gallery showing 5 character portraits
  - Information panel for revealed clues
  - Action buttons (Investigate Suspect / Draw Clue Card / Eliminate Suspect)
  - Timer display (if time limit enabled)
  - Case briefing area
- *Additional UI:* 
  - Main menu with case selection
  - Game over screens (win/lose)
  - Restart/New Case button
  - Pause functionality
  - Settings menu
  - Character detail modals

## 4. Backend (Optional – Supabase)
- *Auth Required:* Yes
  - Login/Register with email & password (Supabase Auth)
  - Guest play option available
- *Database Usage:* Yes
  - Save solved cases, completion times, win/loss records
  - User profiles with detective rank/level
  - Global leaderboard of fastest solvers
- *Data to Store:* 
  - User ID, username, email
  - Cases solved, success rate
  - Best completion times per case
  - Current detective rank/level
  - Total games played

## 5. Game Content Structure
- *Case Generation:*
  - Randomized suspect assignments for each new game
  - Pre-written case backgrounds and victim stories
  - Dynamic clue distribution system
- *Suspect Profiles:*
  - Character portraits with diverse appearances
  - Backstory elements that connect to motives
  - Red herring information to add complexity

## 6. Stretch Goals (Optional)
- [ ] Multiple difficulty levels (3, 5, or 7 suspects)
- [ ] Different case themes (corporate, family, academic, etc.)
- [ ] Background animations and atmospheric effects
- [ ] LocalStorage fallback for offline play if Supabase not used
- [ ] Sound effects and noir-style background music
- [ ] Mobile responsive design with touch-optimized controls
- [ ] Hint system for struggling players
- [ ] Achievement system (solve X cases, perfect streak, etc.)
- [ ] Daily challenge cases
- [ ] Multiplayer mode where players race to solve the same case

---

# STEP PLAN

1. Create basic HTML5 structure with game layout and Supabase login form.
2. Add Supabase authentication system with login/register functionality.
3. Create suspect generation system with randomized characteristics.
4. Implement clue revelation and information display systems.
5. Add suspect elimination mechanics and game state management.
6. Implement win/lose conditions and game flow logic.
7. Add scoring system and case progression.
8. Connect score/progress saving to Supabase database.
9. Create leaderboard and user profile displays.
10. Add visual polish, animations, and responsive design.

---

# INITIAL TASK

Step 1: Scaffold the project with:
- index.html containing the game layout structure (suspect gallery, clue panel, action buttons) and login form
- script.js with basic game initialization and Supabase client setup
- style.css with dark noir theme styling and mobile-responsive layout
- Supabase client setup with authentication placeholders
- Basic suspect data structure and game state initialization
- Placeholder content showing "Whodunnit - Murder Mystery Loading..."

**Key Features for Step 1:**
- Responsive grid layout for 5 suspect cards
- Dark theme with detective/noir color scheme
- Basic game UI structure (investigate buttons, clue display area)
- Supabase configuration placeholders
- Mobile-first responsive design foundation