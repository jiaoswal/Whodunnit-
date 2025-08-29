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

// Rosewood Manor Murder Mystery - Specific Story Data
const suspectData = {
    suspects: [
        {
            id: 0,
            name: 'Mr. Alfred Gray',
            title: 'The Butler',
            profession: 'Longtime family servant',
            relationship: 'Worked for the Beaumont family for 25+ years',
            motive: 'Clara once threatened to fire him for theft',
            appearance: 'Tall, thin, with a neatly pressed suit and white gloves',
            hiddenClue: 'His glove has a small wine stain (important later)',
            isMurderer: false,
            clues: [
                'A white glove with a wine stain',
                'Wine glass near the victim, untouched',
                'Butler seen carrying only wine, not tea',
                'Clara never drank wine that night',
                'Poison was not in the wine'
            ],
            eliminationReason: 'His glove had wine on it, but the poison was in the tea cup, not the wine.'
        },
        {
            id: 1,
            name: 'Dr. Evelyn Cross',
            title: 'The Doctor',
            profession: 'Clara\'s physician',
            relationship: 'Trusted family doctor',
            motive: 'Clara had discovered malpractice that could ruin her career',
            appearance: 'Mid-40s, carries a small leather medical bag, spectacles',
            hiddenClue: 'A missing vial compartment inside her bag',
            isMurderer: true,
            clues: [
                'Missing vial of sedatives',
                'Clara\'s teacup had traces of that sedative',
                'Doctor served Clara tea that night',
                'Medical bag has an empty slot',
                'Sedatives were only accessible to the Doctor'
            ],
            eliminationReason: 'A missing vial of sedatives from her medical bag matches the substance in Clara\'s tea.'
        },
        {
            id: 2,
            name: 'James Holloway',
            title: 'The Writer',
            profession: 'Crime novelist',
            relationship: 'Clara let him stay at the manor for inspiration',
            motive: 'Clara planned to expose that his last bestseller copied her family scandal',
            appearance: 'Messy hair, tweed jacket, notebook and pen always in hand',
            hiddenClue: 'A sketch in his notebook of the study (with a different glass count)',
            isMurderer: false,
            clues: [
                'Sketchbook drawing of study with 2 wine glasses',
                'His fingerprints only on wine glasses',
                'No fingerprints of his on the teapot',
                'The notebook shows wine stains, not tea',
                'Witness saw him writing outside the study'
            ],
            eliminationReason: 'His sketchbook shows 2 wine glasses in the study, but the poison was in tea, not wine. He didn\'t handle tea at all.'
        },
        {
            id: 3,
            name: 'Sophie Marlowe',
            title: 'The Childhood Friend',
            profession: 'Runs a small antique shop',
            relationship: 'Grew up with Clara; friends turned rivals',
            motive: 'Clara refused to loan Sophie money for her failing shop',
            appearance: 'Elegant dress, pearl necklace, nervous smile',
            hiddenClue: 'Her necklace is broken, a bead lies on the study floor',
            isMurderer: false,
            clues: [
                'Broken pearl bead in the study',
                'Necklace broke earlier during a small quarrel',
                'No fingerprints on tea set',
                'Motive was financial, not violent',
                'Pearl bead had dust, showing it fell long before death'
            ],
            eliminationReason: 'Her broken necklace bead was in the study before the poisoning, but no fingerprints of hers were on the tea set.'
        },
        {
            id: 4,
            name: 'Victor Kane',
            title: 'The Business Partner',
            profession: 'Co-owned a luxury hotel chain with Clara',
            relationship: 'Business associate',
            motive: 'Clara was considering dissolving their partnership',
            appearance: 'Stocky man in a sharp suit, gold watch, cigar in hand',
            hiddenClue: 'His cigar stub was found in the garden (not near the study)',
            isMurderer: false,
            clues: [
                'Cigar stub in garden',
                'Cigar ashes outside confirm location',
                'Butler saw him pacing in garden',
                'Time of death confirmed while he was outside',
                'No trace of poison found on his belongings'
            ],
            eliminationReason: 'His cigar stub was found outside in the garden at the exact estimated time of death.'
        }
    ]
};

// Case Description for Rosewood Manor
const caseDescription = "At Rosewood Manor, the wealthy heiress Clara Beaumont was found dead in her study late at night. She appeared to have been poisoned during a small gathering of close acquaintances. Only five people were present at the manor that night — making them the prime suspects. Your goal: Eliminate suspects through clear clues until only the killer remains.";

// DOM Elements
let elements = {};

// Initialize the game
function initGame() {
    console.log('Initializing Whodunnit - Rosewood Manor Mystery...');
    
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
    elements.registerForm.addEventListener('submit', handleRegister);
    
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
    document.getElementById('closeProfileBtn')?.addEventListener('click', closeCharacterProfile);
    
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
    gameState.suspects = [...suspectData.suspects];
    
    // Shuffle the suspects to randomize their positions
    for (let i = gameState.suspects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.suspects[i], gameState.suspects[j]] = [gameState.suspects[j], gameState.suspects[i]];
    }
    
    // Reset clue revelation status
    gameState.suspects.forEach(suspect => {
        suspect.revealedClues = [];
        suspect.isEliminated = false;
    });
    
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
        
        // Create a visual hint icon based on the suspect's role
        let roleIcon = '🕵️';
        if (suspect.title.includes('Butler')) roleIcon = '🧤';
        if (suspect.title.includes('Doctor')) roleIcon = '🩺';
        if (suspect.title.includes('Writer')) roleIcon = '📝';
        if (suspect.title.includes('Friend')) roleIcon = '💎';
        if (suspect.title.includes('Partner')) roleIcon = '🚬';
        
        suspectCard.innerHTML = `
            <div class="suspect-portrait">
                <div class="role-icon">${roleIcon}</div>
                <div class="suspect-initial">${suspect.name.charAt(0)}</div>
            </div>
            <div class="suspect-name">${suspect.name}</div>
            <div class="suspect-title">${suspect.title}</div>
            <div class="suspect-role-hint">${suspect.profession}</div>
            <div class="suspect-info">
                ${suspect.revealedClues.length > 0 ? `${suspect.revealedClues.length} clues revealed` : 'No clues revealed'}
            </div>
            <div class="suspect-visual-hint">
                <small>🔍 Look closely at their appearance!</small>
            </div>
        `;
        
        suspectCard.addEventListener('click', () => selectSuspect(suspect.id));
        suspectCard.addEventListener('dblclick', () => showCharacterProfile(suspect.id));
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
    
    // Show character profile
    showCharacterProfile(suspectId);
}

// Show character profile modal
function showCharacterProfile(suspectId) {
    const suspect = gameState.suspects[suspectId];
    
    // Populate profile information
    document.getElementById('profileName').textContent = suspect.name;
    document.getElementById('profileTitle').textContent = suspect.title;
    document.getElementById('profileProfession').textContent = `Profession: ${suspect.profession}`;
    document.getElementById('profileRelationship').textContent = `Relationship: ${suspect.relationship}`;
    document.getElementById('profileMotive').textContent = `Motive: ${suspect.motive}`;
    document.getElementById('profileAppearance').textContent = suspect.appearance;
    
    // Populate clues with hidden clue highlighted
    const cluesContainer = document.getElementById('profileClues');
    cluesContainer.innerHTML = '';
    
    // Add hidden clue first and prominently
    const hiddenClueItem = document.createElement('div');
    hiddenClueItem.className = 'profile-clue-item hidden-clue';
    hiddenClueItem.innerHTML = `
        <div class="profile-clue-text"><strong>🔍 HIDDEN CLUE:</strong> ${suspect.hiddenClue}</div>
        <div class="profile-clue-status">🔒 Key Visual Evidence</div>
    `;
    cluesContainer.appendChild(hiddenClueItem);
    
    // Add regular clues
    suspect.clues.forEach((clue, index) => {
        const isRevealed = suspect.revealedClues.includes(index);
        const clueItem = document.createElement('div');
        clueItem.className = `profile-clue-item ${isRevealed ? 'revealed' : 'hidden'}`;
        
        clueItem.innerHTML = `
            <div class="profile-clue-text">${clue}</div>
            <div class="profile-clue-status">
                ${isRevealed ? '✓ Revealed' : '🔒 Hidden'}
            </div>
        `;
        
        cluesContainer.appendChild(clueItem);
    });
    
    // Show modal
    document.getElementById('characterProfileModal').classList.remove('hidden');
}

// Close character profile modal
function closeCharacterProfile() {
    document.getElementById('characterProfileModal').classList.add('hidden');
}

// Investigate a suspect
function investigateSuspect() {
    if (gameState.selectedSuspect === null) {
        alert('Please select a suspect first');
        return;
    }
    
    const suspect = gameState.suspects[gameState.selectedSuspect];
    
    // Check if all clues are already revealed
    if (suspect.revealedClues.length >= suspect.clues.length) {
        elements.clueDisplay.innerHTML = '<p class="placeholder-text">All clues for this suspect have been revealed!</p>';
        return;
    }
    
    // Find unrevealed clues
    const unrevealedClues = suspect.clues.filter((clue, index) => 
        !suspect.revealedClues.includes(index)
    );
    
    // Randomly select an unrevealed clue
    const randomClueIndex = Math.floor(Math.random() * unrevealedClues.length);
    const selectedClue = unrevealedClues[randomClueIndex];
    const clueIndex = suspect.clues.indexOf(selectedClue);
    
    // Add to revealed clues
    suspect.revealedClues.push(clueIndex);
    
    // Display the clue
    const clueItem = document.createElement('div');
    clueItem.className = 'clue-item';
    clueItem.innerHTML = `
        <div class="clue-type">${suspect.name} - Clue #${suspect.revealedClues.length}</div>
        <div class="clue-content">${selectedClue}</div>
    `;
    
    elements.clueDisplay.appendChild(clueItem);
    elements.clueDisplay.scrollTop = elements.clueDisplay.scrollHeight;
    
    // Update suspect display
    renderSuspects();
}

// Draw a random clue card
function drawClueCard() {
    // Find suspects with unrevealed clues
    const suspectsWithClues = gameState.suspects.filter(suspect => 
        !suspect.isEliminated && suspect.revealedClues.length < suspect.clues.length
    );
    
    if (suspectsWithClues.length === 0) {
        elements.clueDisplay.innerHTML = '<p class="placeholder-text">All clues have been revealed for all suspects!</p>';
        return;
    }
    
    // Randomly select a suspect
    const randomSuspect = suspectsWithClues[Math.floor(Math.random() * suspectsWithClues.length)];
    
    // Find unrevealed clues for this suspect
    const unrevealedClues = randomSuspect.clues.filter((clue, index) => 
        !randomSuspect.revealedClues.includes(index)
    );
    
    // Randomly select a clue
    const randomClue = unrevealedClues[Math.floor(Math.random() * unrevealedClues.length)];
    const clueIndex = randomSuspect.clues.indexOf(randomClue);
    
    // Add to revealed clues
    randomSuspect.revealedClues.push(clueIndex);
    
    // Display the clue
    const clueItem = document.createElement('div');
    clueItem.className = 'clue-item';
    clueItem.innerHTML = `
        <div class="clue-type">Random Clue - ${randomSuspect.name}</div>
        <div class="clue-content">${randomClue}</div>
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
        showGameOver('You Lose!', `You eliminated the actual murderer! ${suspect.eliminationReason}`);
        return;
    }
    
    // Eliminate the suspect
    suspect.isEliminated = true;
    
    // Check win condition
    const remainingSuspects = gameState.suspects.filter(s => !s.isEliminated);
    if (remainingSuspects.length === 1 && remainingSuspects[0].isMurderer) {
        gameState.gameOver = true;
        showGameOver('You Win!', `Congratulations! You correctly identified Dr. Evelyn Cross as the murderer. ${remainingSuspects[0].eliminationReason}`);
        return;
    }
    
    // Update display
    renderSuspects();
    elements.clueDisplay.innerHTML = `<p class="placeholder-text">${suspect.name} eliminated: ${suspect.eliminationReason}</p>`;
    
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
    elements.caseDescription.textContent = caseDescription;
    
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
        } else if (!document.getElementById('characterProfileModal').classList.contains('hidden')) {
            closeCharacterProfile();
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
    elements.caseDescription.textContent = caseDescription;
    
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
