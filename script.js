// Game State
const gameState = {
    suspects: [],
    selectedSuspect: null,
    gameTimer: 15 * 60, // 15 minutes in seconds
    gameActive: false,
    eliminatedCount: 0
};

// DOM Elements
const elements = {
    timer: document.getElementById('timer'),
    investigateBtn: document.getElementById('investigateBtn'),
    eliminateBtn: document.getElementById('eliminateBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    suspectsGrid: document.getElementById('suspectsGrid'),
    clueDisplay: document.getElementById('clueDisplay'),
    characterModal: document.getElementById('characterModal'),
    characterProfile: document.getElementById('characterProfile'),
    gameOverModal: document.getElementById('gameOverModal'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverMessage: document.getElementById('gameOverMessage'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    pauseMenu: document.getElementById('pauseMenu'),
    resumeBtn: document.getElementById('resumeBtn'),
    newGameFromPauseBtn: document.getElementById('newGameFromPauseBtn')
};

// Suspect Data
const suspectData = {
    suspects: [
        {
            id: 0,
            name: 'Mr. Alfred Gray',
            title: 'The Butler',
            profession: 'Butler & Estate Manager',
            relationship: 'Long-time servant of the family',
            motive: 'Potential inheritance or resentment over years of service',
            appearance: 'Elegant in his uniform, always carrying a silver tray',
            hiddenClue: 'His glove has a small wine stain (important later)',
            isMurderer: false,
            clues: [
                'Wine glasses found in the study have his fingerprints',
                'He was the last person to see Lord Blackwood alive',
                'His alibi for the time of death is weak',
                'He has access to all areas of the manor',
                'His uniform shows signs of recent cleaning'
            ],
            eliminationReason: 'Proven innocent through alibi verification and lack of motive'
        },
        {
            id: 1,
            name: 'Dr. Evelyn Cross',
            title: 'The Doctor',
            profession: 'Family Physician',
            relationship: 'Personal doctor to Lord Blackwood',
            motive: 'Professional reputation at stake, potential medical malpractice',
            appearance: 'Wears a white coat, carries medical bag, looks stressed',
            hiddenClue: 'Her medical bag is missing a vial of sedatives',
            isMurderer: true,
            clues: [
                'She prescribed medication to Lord Blackwood recently',
                'Her medical bag was found open in the study',
                'She has no alibi for the time of death',
                'She was seen arguing with Lord Blackwood earlier',
                'Her fingerprints are on the murder weapon'
            ],
            eliminationReason: 'This would be a mistake - she is the killer!'
        },
        {
            id: 2,
            name: 'James Holloway',
            title: 'The Writer',
            profession: 'Author & Family Friend',
            relationship: 'Close friend and business partner',
            motive: 'Financial disputes over book publishing deals',
            appearance: 'Disheveled, ink-stained fingers, carries a notebook',
            hiddenClue: 'His sketchbook contains drawings of the manor layout',
            isMurderer: false,
            clues: [
                'He was working on a book about the manor',
                'His notebook contains detailed observations',
                'He has financial troubles',
                'He was seen sketching the study earlier',
                'His alibi is confirmed by multiple witnesses'
            ],
            eliminationReason: 'Proven innocent through solid alibi and lack of opportunity'
        },
        {
            id: 3,
            name: 'Sophie Marlowe',
            title: 'The Heiress',
            profession: 'Lord Blackwood\'s Daughter',
            relationship: 'Daughter and primary heir',
            motive: 'Inheritance and family disputes',
            appearance: 'Elegant dress, expensive jewelry, looks concerned',
            hiddenClue: 'Her pearl necklace is broken (noticed during questioning)',
            isMurderer: false,
            clues: [
                'She stands to inherit the entire estate',
                'She was in her room during the murder',
                'Her alibi is confirmed by the housekeeper',
                'She has no history of violence',
                'She was seen crying after discovering the body'
            ],
            eliminationReason: 'Proven innocent through solid alibi and emotional reaction'
        },
        {
            id: 4,
            name: 'Victor Kane',
            title: 'The Business Partner',
            profession: 'Business Associate',
            relationship: 'Long-time business partner and friend',
            motive: 'Business disagreements and financial pressure',
            appearance: 'Well-dressed businessman, carries a briefcase, looks nervous',
            hiddenClue: 'His cigar stub was found in the garden (not near the study)',
            isMurderer: false,
            clues: [
                'He had a business meeting with Lord Blackwood that evening',
                'His briefcase contains important documents',
                'He has financial difficulties',
                'He was seen smoking in the garden',
                'His alibi is confirmed by the butler'
            ],
            eliminationReason: 'Proven innocent through solid alibi and lack of opportunity'
        }
    ]
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Initialize the game
function initGame() {
    setupEventListeners();
    startNewGame();
}

// Setup event listeners
function setupEventListeners() {
    elements.investigateBtn.addEventListener('click', investigateSuspect);
    elements.eliminateBtn.addEventListener('click', eliminateSuspect);
    elements.newGameBtn.addEventListener('click', startNewGame);
    elements.playAgainBtn.addEventListener('click', startNewGame);
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.newGameFromPauseBtn.addEventListener('click', startNewGame);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Close modal with X button
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });
    
    // Pause menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && gameState.gameActive) {
            togglePauseMenu();
        }
    });
}

// Start a new game
function startNewGame() {
    gameState.gameTimer = 15 * 60;
    gameState.gameActive = true;
    gameState.selectedSuspect = null;
    gameState.eliminatedCount = 0;
    
    generateSuspects();
    updateTimer();
    startTimer();
    
    // Hide modals
    elements.gameOverModal.style.display = 'none';
    elements.pauseMenu.style.display = 'none';
    
    // Reset clue display
    elements.clueDisplay.innerHTML = '<p class="placeholder-text">Select a suspect to begin your investigation...</p>';
    
    // Disable action buttons
    elements.investigateBtn.disabled = true;
    elements.eliminateBtn.disabled = true;
}

// Generate suspects for the game
function generateSuspects() {
    gameState.suspects = suspectData.suspects.map(suspect => ({
        ...suspect,
        revealedClues: [],
        isEliminated: false
    }));
    
    // Shuffle suspects for variety
    for (let i = gameState.suspects.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.suspects[i], gameState.suspects[j]] = [gameState.suspects[j], gameState.suspects[i]];
    }
    
    renderSuspects();
}

// Render suspects in the grid
function renderSuspects() {
    elements.suspectsGrid.innerHTML = '';
    
    gameState.suspects.forEach(suspect => {
        const suspectCard = document.createElement('div');
        suspectCard.className = 'suspect-card';
        suspectCard.setAttribute('data-suspect-id', suspect.id);
        
        // Add selection and elimination classes
        if (suspect.id === gameState.selectedSuspect) {
            suspectCard.classList.add('selected');
        }
        if (suspect.isEliminated) {
            suspectCard.classList.add('eliminated');
        }
        
        // Role icon mapping
        const roleIcons = {
            'The Butler': '👔',
            'The Doctor': '👩‍⚕️',
            'The Writer': '✍️',
            'The Heiress': '👑',
            'The Business Partner': '💼'
        };
        
        const roleIcon = roleIcons[suspect.title] || '❓';
        
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
        
        // Add event listeners
        suspectCard.addEventListener('click', () => selectSuspect(suspect.id));
        suspectCard.addEventListener('dblclick', () => showCharacterProfile(suspect.id));
        
        elements.suspectsGrid.appendChild(suspectCard);
    });
}

// Select a suspect
function selectSuspect(suspectId) {
    const suspect = gameState.suspects[suspectId];
    
    if (suspect.isEliminated) {
        alert(`${suspect.name} has already been eliminated and cannot be selected.`);
        return;
    }
    
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
    
    // Update clue display to show selection and their specific clues
    updateClueDisplayForSuspect(suspect);
}

// Function to update clue display for a specific suspect
function updateClueDisplayForSuspect(suspect) {
    let clueDisplayHTML = `<p class="placeholder-text"><strong>🔍 Investigating: ${suspect.name} - ${suspect.title}</strong></p>`;
    
    // Show their specific clues (both revealed and hidden)
    if (suspect.revealedClues.length > 0) {
        clueDisplayHTML += `<h4>📋 Clues for ${suspect.name}:</h4>`;
        suspect.revealedClues.forEach((clueIndex, index) => {
            if (suspect.clues[clueIndex]) {
                clueDisplayHTML += `<div class="clue-item"><strong>Clue ${index + 1}:</strong> ${suspect.clues[clueIndex]}</div>`;
            }
        });
    }
    
    // Show hidden clue hint
    clueDisplayHTML += `<div class="clue-item hidden-clue"><strong>🔒 Hidden Clue:</strong> ${suspect.hiddenClue}</div>`;
    
    // Show remaining unrevealed clues count
    const unrevealedCount = suspect.clues.length - suspect.revealedClues.length;
    if (unrevealedCount > 0) {
        clueDisplayHTML += `<p class="placeholder-text"><em>${unrevealedCount} more clues to discover for this suspect...</em></p>`;
    }
    
    elements.clueDisplay.innerHTML = clueDisplayHTML;
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
    
    // Display the clue with clear suspect identification
    const clueItem = document.createElement('div');
    clueItem.className = 'clue-item';
    clueItem.innerHTML = `
        <div class="clue-type"><strong>🔍 ${suspect.name} - Clue #${suspect.revealedClues.length}</strong></div>
        <div class="clue-content">${selectedClue}</div>
    `;
    
    elements.clueDisplay.appendChild(clueItem);
    elements.clueDisplay.scrollTop = elements.clueDisplay.scrollHeight;
    
    // Update suspect display
    renderSuspects();
    
    // Update the clue display to show all clues for this suspect
    updateClueDisplayForSuspect(suspect);
}

// Eliminate a suspect
function eliminateSuspect() {
    if (gameState.selectedSuspect === null) {
        alert('Please select a suspect first');
        return;
    }
    
    const suspect = gameState.suspects[gameState.selectedSuspect];
    
    if (suspect.isMurderer) {
        // Player eliminated the killer - they lose!
        endGame(false, 'You eliminated the actual killer! The murderer goes free while an innocent person takes the blame.');
        return;
    }
    
    // Eliminate the suspect
    suspect.isEliminated = true;
    gameState.eliminatedCount++;
    
    // Clear selection
    gameState.selectedSuspect = null;
    elements.investigateBtn.disabled = true;
    elements.eliminateBtn.disabled = true;
    
    // Update display
    renderSuspects();
    
    // Check win condition
    if (gameState.eliminatedCount === gameState.suspects.length - 1) {
        // Only the killer remains - player wins!
        endGame(true, 'Congratulations! You\'ve successfully identified the killer. Dr. Evelyn Cross is guilty!');
        return;
    }
    
    // Show elimination message
    elements.clueDisplay.innerHTML = `
        <p class="placeholder-text"><strong>❌ ${suspect.name} has been eliminated!</strong></p>
        <p class="placeholder-text">${suspect.eliminationReason}</p>
        <p class="placeholder-text">Select another suspect to continue your investigation...</p>
    `;
}

// Show character profile
function showCharacterProfile(suspectId) {
    const suspect = gameState.suspects[suspectId];
    
    elements.characterProfile.innerHTML = `
        <div class="profile-header">
            <h2>${suspect.name}</h2>
            <p>${suspect.title}</p>
        </div>
        <div class="profile-content">
            <div class="profile-section">
                <h3>Background</h3>
                <p><strong>Profession:</strong> ${suspect.profession}</p>
                <p><strong>Relationship:</strong> ${suspect.relationship}</p>
                <p><strong>Potential Motive:</strong> ${suspect.motive}</p>
            </div>
            <div class="profile-section">
                <h3>Appearance</h3>
                <p>${suspect.appearance}</p>
            </div>
            <div class="profile-section">
                <h3>Clues</h3>
                ${suspect.clues.map((clue, index) => {
                    const isRevealed = suspect.revealedClues.includes(index);
                    return `
                        <div class="profile-clue-item ${isRevealed ? '' : 'hidden-clue'}">
                            <strong>Clue ${index + 1}:</strong> ${clue}
                            <div class="clue-status">${isRevealed ? '✅ Revealed' : '🔒 Hidden'}</div>
                        </div>
                    `;
                }).join('')}
                <div class="profile-clue-item hidden-clue">
                    <strong>🔒 Hidden Clue:</strong> ${suspect.hiddenClue}
                </div>
            </div>
        </div>
    `;
    
    elements.characterModal.style.display = 'block';
}

// Timer functions
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.gameTimer--;
        updateTimer();
        
        if (gameState.gameTimer <= 0) {
            endGame(false, 'Time\'s up! The killer has escaped justice.');
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(gameState.gameTimer / 60);
    const seconds = gameState.gameTimer % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color when time is running low
    if (gameState.gameTimer <= 300) { // 5 minutes or less
        elements.timer.style.color = '#ff4444';
        elements.timer.style.borderColor = '#ff4444';
    }
}

// Pause menu functions
function togglePauseMenu() {
    if (elements.pauseMenu.style.display === 'block') {
        elements.pauseMenu.style.display = 'none';
    } else {
        elements.pauseMenu.style.display = 'block';
    }
}

function resumeGame() {
    elements.pauseMenu.style.display = 'none';
}

// End game
function endGame(won, message) {
    gameState.gameActive = false;
    clearInterval(gameState.timerInterval);
    
    elements.gameOverTitle.textContent = won ? '🎉 Case Solved!' : '💀 Case Failed';
    elements.gameOverTitle.style.color = won ? '#4CAF50' : '#f44336';
    elements.gameOverMessage.textContent = message;
    
    elements.gameOverModal.style.display = 'block';
}

// Debug function to show suspect states
function debugSuspectStates() {
    console.log('=== SUSPECT STATES ===');
    gameState.suspects.forEach(suspect => {
        console.log(`${suspect.name}: Eliminated=${suspect.isEliminated}, Clues=${suspect.revealedClues.length}/${suspect.clues.length}`);
    });
    console.log('===========================');
}
