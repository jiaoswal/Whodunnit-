// Supabase Configuration
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize Supabase client
let supabase;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.warn('Supabase not configured, running in offline mode');
    supabase = null;
}

// Game State
let gameState = {
    isAuthenticated: false,
    currentUser: null,
    currentCase: 1,
    gameStarted: false,
    gameOver: false,
    selectedSuspect: null,
    suspects: [],
    clues: [],
    gameTimer: 0,
    timerInterval: null
};

// Suspect Data Structure
const suspectData = {
    names: [
        'Dr. Sarah Chen', 'Marcus Rodriguez', 'Eleanor Blackwood', 
        'James Thompson', 'Isabella Martinez'
    ],
    appearances: [
        { hair: 'Black', style: 'Short', skin: 'Medium', clothing: 'Professional' },
        { hair: 'Brown', style: 'Wavy', skin: 'Tan', clothing: 'Casual' },
        { hair: 'Red', style: 'Long', skin: 'Fair', clothing: 'Elegant' },
        { hair: 'Blonde', style: 'Slicked', skin: 'Fair', clothing: 'Business' },
        { hair: 'Brown', style: 'Curly', skin: 'Medium', clothing: 'Artistic' }
    ],
    relationships: [
        'Friend', 'Colleague', 'Rival', 'Family', 'Stranger'
    ],
    motives: [
        'Money', 'Revenge', 'Jealousy', 'Career', 'Accident'
    ],
    professions: [
        'Doctor', 'Teacher', 'Business Owner', 'Artist', 'Lawyer'
    ]
};

// Clue Types
const clueTypes = ['Motive', 'Profession', 'Appearance', 'Relationship'];

// Case Descriptions
const caseDescriptions = [
    "A wealthy businessman has been found dead in his office. The police suspect foul play, but the evidence is scarce. You must investigate the five people who had access to the victim on the day of the murder.",
    "A famous actress has been discovered in her dressing room, the victim of what appears to be a carefully planned murder. The suspects include her closest associates and bitter rivals.",
    "A respected professor has been found dead in the university library. The academic world is in shock, and you must navigate through a web of professional rivalries and personal grudges."
];

// DOM Elements
let elements = {};

// Initialize the game
function initGame() {
    console.log('Initializing Whodunnit...');
    
    // Hide loading screen after a brief delay
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        showLoginSection();
    }, 1500);
    
    // Initialize DOM elements
    initializeElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Generate initial suspects
    generateSuspects();
}

// Initialize DOM element references
function initializeElements() {
    elements = {
        loginSection: document.getElementById('loginSection'),
        gameSection: document.getElementById('gameSection'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        guestPlay: document.getElementById('guestPlay'),
        investigateBtn: document.getElementById('investigateBtn'),
        drawClueBtn: document.getElementById('drawClueBtn'),
        eliminateBtn: document.getElementById('eliminateBtn'),
        suspectsGrid: document.getElementById('suspectsGrid'),
        clueDisplay: document.getElementById('clueDisplay'),
        gameTimer: document.getElementById('gameTimer'),
        caseNumber: document.getElementById('caseNumber'),
        caseDescription: document.getElementById('caseDescription'),
        gameOverModal: document.getElementById('gameOverModal'),
        pauseMenu: document.getElementById('pauseMenu')
    };
}

// Set up event listeners
function setupEventListeners() {
    // Auth form submissions
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('register', handleRegister);
    
    // Guest play
    elements.guestPlay.addEventListener('click', startGuestGame);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
    
    // Game action buttons
    elements.investigateBtn.addEventListener('click', investigateSuspect);
    elements.drawClueBtn.addEventListener('click', drawClueCard);
    elements.eliminateBtn.addEventListener('click', eliminateSuspect);
    
    // Modal buttons
    document.getElementById('newCaseBtn')?.addEventListener('click', startNewCase);
    document.getElementById('mainMenuBtn')?.addEventListener('click', showMainMenu);
    document.getElementById('resumeBtn')?.addEventListener('click', resumeGame);
    document.getElementById('quitBtn')?.addEventListener('click', quitToMenu);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Tab switching for auth forms
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    if (tab === 'login') {
        elements.loginForm.classList.remove('hidden');
        elements.registerForm.classList.add('hidden');
    } else {
        elements.loginForm.classList.add('hidden');
        elements.registerForm.classList.remove('hidden');
    }
}

// Show login section
function showLoginSection() {
    elements.loginSection.classList.remove('hidden');
    elements.gameSection.classList.add('hidden');
}

// Show game section
function showGameSection() {
    elements.loginSection.classList.add('hidden');
    elements.gameSection.classList.remove('hidden');
    startGame();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    if (!supabase) {
        // Offline mode - simulate successful login
        gameState.isAuthenticated = true;
        gameState.currentUser = { email: 'guest@example.com', username: 'Guest' };
        showGameSection();
        return;
    }
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        gameState.isAuthenticated = true;
        gameState.currentUser = data.user;
        showGameSection();
        
    } catch (error) {
        console.error('Login error:', error.message);
        alert('Login failed: ' + error.message);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    if (!supabase) {
        alert('Registration not available in offline mode');
        return;
    }
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const username = document.getElementById('username').value;
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });
        
        if (error) throw error;
        
        alert('Registration successful! Please check your email to verify your account.');
        
    } catch (error) {
        console.error('Registration error:', error.message);
        alert('Registration failed: ' + error.message);
    }
}

// Start guest game
function startGuestGame() {
    gameState.isAuthenticated = false;
    gameState.currentUser = { email: 'guest@example.com', username: 'Guest' };
    showGameSection();
}

// Generate suspects for the current case
function generateSuspects() {
    gameState.suspects = [];
    
    // Randomly assign characteristics to suspects
    const shuffledNames = [...suspectData.names].sort(() => Math.random() - 0.5);
    const shuffledAppearances = [...suspectData.appearances].sort(() => Math.random() - 0.5);
    const shuffledRelationships = [...suspectData.relationships].sort(() => Math.random() - 0.5);
    const shuffledMotives = [...suspectData.motives].sort(() => Math.random() - 0.5);
    const shuffledProfessions = [...suspectData.professions].sort(() => Math.random() - 0.5);
    
    // Randomly select the murderer
    const murdererIndex = Math.floor(Math.random() * 5);
    
    for (let i = 0; i < 5; i++) {
        const suspect = {
            id: i,
            name: shuffledNames[i],
            appearance: shuffledAppearances[i],
            relationship: shuffledRelationships[i],
            motive: shuffledMotives[i],
            profession: shuffledProfessions[i],
            isMurderer: i === murdererIndex,
            isEliminated: false,
            clues: {
                appearance: false,
                relationship: false,
                motive: false,
                profession: false
            }
        };
        
        gameState.suspects.push(suspect);
    }
    
    renderSuspects();
}

// Render suspects in the grid
function renderSuspects() {
    elements.suspectsGrid.innerHTML = '';
    
    gameState.suspects.forEach(suspect => {
        const suspectCard = document.createElement('div');
        suspectCard.className = 'suspect-card';
        suspectCard.dataset.suspectId = suspect.id;
        
        if (suspect.isEliminated) {
            suspectCard.classList.add('eliminated');
        }
        
        suspectCard.innerHTML = `
            <div class="suspect-portrait">${suspect.name.charAt(0)}</div>
            <div class="suspect-name">${suspect.name}</div>
            <div class="suspect-info">
                ${suspect.clues.appearance ? `Hair: ${suspect.appearance.hair}, ${suspect.appearance.style}` : 'Appearance: ???'}
            </div>
        `;
        
        suspectCard.addEventListener('click', () => selectSuspect(suspect.id));
        elements.suspectsGrid.appendChild(suspectCard);
    });
}

// Select a suspect
function selectSuspect(suspectId) {
    if (gameState.suspects[suspectId].isEliminated) return;
    
    // Remove previous selection
    document.querySelectorAll('.suspect-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new suspect
    document.querySelector(`[data-suspect-id="${suspectId}"]`).classList.add('selected');
    gameState.selectedSuspect = suspectId;
    
    // Enable action buttons
    elements.investigateBtn.disabled = false;
    elements.eliminateBtn.disabled = false;
}

// Investigate a suspect
function investigateSuspect() {
    if (gameState.selectedSuspect === null) {
        alert('Please select a suspect first');
        return;
    }
    
    const suspect = gameState.suspects[gameState.selectedSuspect];
    
    // Randomly reveal a clue that hasn't been revealed yet
    const unrevealedClues = Object.entries(suspect.clues)
        .filter(([key, revealed]) => !revealed)
        .map(([key]) => key);
    
    if (unrevealedClues.length === 0) {
        elements.clueDisplay.innerHTML = '<p class="placeholder-text">All clues for this suspect have been revealed!</p>';
        return;
    }
    
    const randomClueType = unrevealedClues[Math.floor(Math.random() * unrevealedClues.length)];
    suspect.clues[randomClueType] = true;
    
    // Display the clue
    let clueContent = '';
    switch (randomClueType) {
        case 'appearance':
            clueContent = `Hair: ${suspect.appearance.hair}, ${suspect.appearance.style}. Skin: ${suspect.appearance.skin}. Clothing: ${suspect.appearance.clothing}.`;
            break;
        case 'relationship':
            clueContent = `Relationship with victim: ${suspect.relationship}`;
            break;
        case 'motive':
            clueContent = `Possible motive: ${suspect.motive}`;
            break;
        case 'profession':
            clueContent = `Profession: ${suspect.profession}`;
            break;
    }
    
    const clueItem = document.createElement('div');
    clueItem.className = 'clue-item';
    clueItem.innerHTML = `
        <div class="clue-type">${randomClueType.charAt(0).toUpperCase() + randomClueType.slice(1)} Clue</div>
        <div class="clue-content">${clueContent}</div>
    `;
    
    elements.clueDisplay.appendChild(clueItem);
    elements.clueDisplay.scrollTop = elements.clueDisplay.scrollHeight;
    
    // Update suspect display
    renderSuspects();
}

// Draw a random clue card
function drawClueCard() {
    const randomClueType = clueTypes[Math.floor(Math.random() * clueTypes.length)];
    const randomSuspect = gameState.suspects[Math.floor(Math.random() * gameState.suspects.length)];
    
    if (randomSuspect.isEliminated) {
        elements.clueDisplay.innerHTML = '<p class="placeholder-text">The drawn clue card refers to an eliminated suspect. Draw again!</p>';
        return;
    }
    
    // Reveal the clue for the random suspect
    randomSuspect.clues[randomClueType.toLowerCase()] = true;
    
    // Display the clue
    let clueContent = '';
    switch (randomClueType.toLowerCase()) {
        case 'appearance':
            clueContent = `${randomSuspect.name}: Hair: ${randomSuspect.appearance.hair}, ${randomSuspect.appearance.style}. Skin: ${randomSuspect.appearance.skin}. Clothing: ${randomSuspect.appearance.clothing}.`;
            break;
        case 'relationship':
            clueContent = `${randomSuspect.name}: Relationship with victim: ${randomSuspect.relationship}`;
            break;
        case 'motive':
            clueContent = `${randomSuspect.name}: Possible motive: ${randomSuspect.motive}`;
            break;
        case 'profession':
            clueContent = `${randomSuspect.name}: Profession: ${randomSuspect.profession}`;
            break;
    }
    
    const clueItem = document.createElement('div');
    clueItem.className = 'clue-item';
    clueItem.innerHTML = `
        <div class="clue-type">Random ${randomClueType} Clue</div>
        <div class="clue-content">${clueContent}</div>
    `;
    
    elements.clueDisplay.appendChild(clueItem);
    elements.clueDisplay.scrollTop = elements.clueDisplay.scrollHeight;
    
    // Update suspect display
    renderSuspects();
}

// Eliminate a suspect
function eliminateSuspect() {
    if (gameState.selectedSuspect === null) {
        alert('Please select a suspect first');
        return;
    }
    
    const suspect = gameState.suspects[gameState.selectedSuspect];
    
    if (suspect.isEliminated) {
        alert('This suspect has already been eliminated');
        return;
    }
    
    // Check if this is the murderer
    if (suspect.isMurderer) {
        gameState.gameOver = true;
        showGameOver('You Lose!', 'You eliminated the actual murderer. Better luck next time!');
        return;
    }
    
    // Eliminate the suspect
    suspect.isEliminated = true;
    
    // Check win condition
    const remainingSuspects = gameState.suspects.filter(s => !s.isEliminated);
    if (remainingSuspects.length === 1 && remainingSuspects[0].isMurderer) {
        gameState.gameOver = true;
        showGameOver('You Win!', 'Congratulations! You correctly identified the murderer as the last remaining suspect.');
        return;
    }
    
    // Update display
    renderSuspects();
    elements.clueDisplay.innerHTML = '<p class="placeholder-text">Suspect eliminated. Continue investigating...</p>';
    
    // Clear selection
    gameState.selectedSuspect = null;
    document.querySelectorAll('.suspect-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Disable action buttons
    elements.investigateBtn.disabled = true;
    elements.eliminateBtn.disabled = true;
}

// Show game over modal
function showGameOver(title, message) {
    document.getElementById('gameOverTitle').textContent = title;
    document.getElementById('gameOverMessage').textContent = message;
    elements.gameOverModal.classList.remove('hidden');
    
    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
}

// Start new case
function startNewCase() {
    gameState.currentCase++;
    gameState.gameOver = false;
    gameState.selectedSuspect = null;
    gameState.clues = [];
    
    // Update case number display
    elements.caseNumber.textContent = gameState.currentCase;
    
    // Update case description
    const caseIndex = (gameState.currentCase - 1) % caseDescriptions.length;
    elements.caseDescription.textContent = caseDescriptions[caseIndex];
    
    // Generate new suspects
    generateSuspects();
    
    // Reset clue display
    elements.clueDisplay.innerHTML = '<p class="placeholder-text">Select an action to begin investigating...</p>';
    
    // Hide modal
    elements.gameOverModal.classList.add('hidden');
    
    // Start new timer
    startTimer();
}

// Show main menu
function showMainMenu() {
    elements.gameOverModal.classList.add('hidden');
    showLoginSection();
    resetGame();
}

// Resume game
function resumeGame() {
    elements.pauseMenu.classList.add('hidden');
}

// Quit to menu
function quitToMenu() {
    elements.pauseMenu.classList.add('hidden');
    showMainMenu();
}

// Handle keyboard shortcuts
function handleKeyboard(e) {
    if (e.key === 'Escape') {
        if (!elements.gameOverModal.classList.contains('hidden')) {
            elements.gameOverModal.classList.add('hidden');
        } else if (!elements.pauseMenu.classList.contains('hidden')) {
            elements.pauseMenu.classList.add('hidden');
        } else if (gameState.gameStarted && !gameState.gameOver) {
            elements.pauseMenu.classList.remove('hidden');
        }
    }
}

// Start the game
function startGame() {
    gameState.gameStarted = true;
    gameState.gameOver = false;
    
    // Update case description
    elements.caseDescription.textContent = caseDescriptions[0];
    
    // Start timer
    startTimer();
    
    // Disable action buttons initially
    elements.investigateBtn.disabled = true;
    elements.eliminateBtn.disabled = true;
}

// Start game timer
function startTimer() {
    gameState.gameTimer = 0;
    updateTimerDisplay();
    
    gameState.timerInterval = setInterval(() => {
        gameState.gameTimer++;
        updateTimerDisplay();
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.gameTimer / 60);
    const seconds = gameState.gameTimer % 60;
    elements.gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Reset game state
function resetGame() {
    gameState = {
        isAuthenticated: false,
        currentUser: null,
        currentCase: 1,
        gameStarted: false,
        gameOver: false,
        selectedSuspect: null,
        suspects: [],
        clues: [],
        gameTimer: 0,
        timerInterval: null
    };
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
