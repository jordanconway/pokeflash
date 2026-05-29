// Type Color Palette Map for dynamic layout transitions
const TYPE_THEMES = {
  normal: { color: '#A8A77A', rgb: '168, 167, 122', g1: '#A8A77A', g2: '#C6C5A9' },
  fire: { color: '#EE8130', rgb: '238, 129, 48', g1: '#EE8130', g2: '#F5AC78' },
  water: { color: '#6390F0', rgb: '99, 144, 240', g1: '#6390F0', g2: '#9DB7F5' },
  electric: { color: '#F7D02C', rgb: '247, 208, 44', g1: '#F7D02C', g2: '#F9E076' },
  grass: { color: '#7AC74C', rgb: '122, 199, 76', g1: '#7AC74C', g2: '#A7DB8D' },
  ice: { color: '#96D9D6', rgb: '150, 217, 214', g1: '#96D9D6', g2: '#BCE6E6' },
  fighting: { color: '#C22E28', rgb: '194, 46, 40', g1: '#C22E28', g2: '#D67C78' },
  poison: { color: '#A33EA1', rgb: '163, 62, 161', g1: '#A33EA1', g2: '#C183C1' },
  ground: { color: '#E2BF65', rgb: '226, 191, 101', g1: '#E2BF65', g2: '#EAD18F' },
  flying: { color: '#A98FF3', rgb: '169, 143, 243', g1: '#A98FF3', g2: '#C6B7F5' },
  psychic: { color: '#F95587', rgb: '249, 85, 135', g1: '#F95587', g2: '#FA92B2' },
  bug: { color: '#A6B91A', rgb: '166, 185, 26', g1: '#A6B91A', g2: '#C1D15A' },
  rock: { color: '#B6A136', rgb: '182, 161, 54', g1: '#B6A136', g2: '#D1C17D' },
  ghost: { color: '#735797', rgb: '115, 87, 151', g1: '#735797', g2: '#907aad' },
  dragon: { color: '#6F35FC', rgb: '111, 53, 252', g1: '#6F35FC', g2: '#A27DFA' },
  steel: { color: '#B7B7CE', rgb: '183, 183, 206', g1: '#B7B7CE', g2: '#D1D1E0' },
  fairy: { color: '#D685AD', rgb: '214, 133, 173', g1: '#D685AD', g2: '#E4B5CE' },
  dark: { color: '#705746', rgb: '112, 87, 70', g1: '#4F3F35', g2: '#705746' }
};

// Global App State
let state = {
  deck: [],
  currentIndex: 0,
  isFlipped: false,
  isMuted: false,
  studyMode: 'guessing', // 'guessing' or 'learning'
  currentPokemon: null,
  currentCryUrl: null,
  isLoadingDetails: false
};

// DOM Elements
const card = document.getElementById('card');
const frontArtwork = document.getElementById('front-artwork');
const backArtwork = document.getElementById('back-artwork');
const cardFrontId = document.getElementById('card-front-id');
const cardBackId = document.getElementById('card-back-id');
const pokemonName = document.getElementById('pokemon-name');
const typesContainer = document.getElementById('types-container');
const pokemonDesc = document.getElementById('pokemon-desc');
const progressCount = document.getElementById('progress-count');
const progressBar = document.getElementById('progress-bar');

const btnReveal = document.getElementById('btn-reveal');
const btnNext = document.getElementById('btn-next');
const btnSoundToggle = document.getElementById('btn-sound-toggle');
const btnThemeToggle = document.getElementById('btn-theme-toggle');
const btnModeToggle = document.getElementById('btn-mode-toggle');
const btnPlayCry = document.getElementById('btn-play-cry');

const searchToggle = document.getElementById('btn-search-toggle');
const searchDialog = document.getElementById('search-dialog');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');
const btnSearchClose = document.getElementById('btn-search-close');
const btnSearchGo = document.getElementById('btn-search-go');

// Audio elements
const soundFlip = document.getElementById('sound-flip');
const soundNext = document.getElementById('sound-next');
const soundReveal = document.getElementById('sound-reveal');
let cryAudio = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initSoundSettings();
  initThemeSettings();
  initStudyModeSettings();
  initDeck();
  setupEventListeners();
  loadCurrentPokemon();
});

// Sound Settings Initialization
function initSoundSettings() {
  const storedMute = localStorage.getItem('pokeflash_muted');
  state.isMuted = storedMute === 'true';
  updateSoundButtonUI();
}

function updateSoundButtonUI() {
  const unmutedIcon = document.getElementById('sound-icon-unmuted');
  const mutedIcon = document.getElementById('sound-icon-muted');
  if (state.isMuted) {
    unmutedIcon.style.display = 'none';
    mutedIcon.style.display = 'block';
  } else {
    unmutedIcon.style.display = 'block';
    mutedIcon.style.display = 'none';
  }
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  localStorage.setItem('pokeflash_muted', state.isMuted);
  updateSoundButtonUI();
}

function playSFX(audioElement) {
  if (!state.isMuted && audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(err => console.log('SFX play prevented: ', err));
  }
}

// Theme Settings Initialization
function initThemeSettings() {
  const storedTheme = localStorage.getItem('pokeflash_theme') || 'dark';
  document.body.setAttribute('data-theme', storedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('pokeflash_theme', newTheme);
}

// Study Mode Settings Initialization
function initStudyModeSettings() {
  const storedMode = localStorage.getItem('pokeflash_study_mode') || 'guessing';
  state.studyMode = storedMode;
  updateStudyModeUI();
}

function updateStudyModeUI() {
  const guessingIcon = document.getElementById('mode-icon-guessing');
  const learningIcon = document.getElementById('mode-icon-learning');
  if (state.studyMode === 'learning') {
    guessingIcon.style.display = 'none';
    learningIcon.style.display = 'block';
    btnModeToggle.title = "Switch to Guessing Mode (L)";
  } else {
    guessingIcon.style.display = 'block';
    learningIcon.style.display = 'none';
    btnModeToggle.title = "Switch to Learning Mode (L)";
  }
}

function toggleStudyMode() {
  state.studyMode = state.studyMode === 'guessing' ? 'learning' : 'guessing';
  localStorage.setItem('pokeflash_study_mode', state.studyMode);
  updateStudyModeUI();
  
  // Re-evaluate current card state on toggle
  if (state.studyMode === 'learning') {
    if (!state.isFlipped) {
      flipCard();
    }
  } else {
    if (state.isFlipped) {
      flipCard();
    }
  }
}

// Deck Management (Fisher-Yates Shuffle)
function initDeck() {
  const storedDeck = localStorage.getItem('pokeflash_deck');
  const storedIndex = localStorage.getItem('pokeflash_index');

  if (storedDeck) {
    state.deck = JSON.parse(storedDeck);
    state.currentIndex = parseInt(storedIndex, 10) || 0;
  } else {
    createNewDeck();
  }
  updateProgressUI();
}

function createNewDeck() {
  const totalPokemon = POKEMON_DATA.length; // 1025
  const newDeck = Array.from({ length: totalPokemon }, (_, i) => i + 1);
  
  // Shuffle algorithm
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  
  state.deck = newDeck;
  state.currentIndex = 0;
  saveDeckToStorage();
}

function saveDeckToStorage() {
  localStorage.setItem('pokeflash_deck', JSON.stringify(state.deck));
  localStorage.setItem('pokeflash_index', state.currentIndex);
}

function updateProgressUI() {
  progressCount.textContent = state.currentIndex + 1;
  const progressPercent = ((state.currentIndex + 1) / state.deck.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
}

// Pokemon Loader
function loadCurrentPokemon() {
  const pokemonId = state.deck[state.currentIndex];
  const basicInfo = POKEMON_DATA.find(p => p.id === pokemonId);
  
  state.currentPokemon = basicInfo;
  
  // Reset back card skeleton state
  resetCardBackDetails();
  
  // Setup artwork instantly (github image URLs render silhouettes perfectly)
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  frontArtwork.src = artworkUrl;
  backArtwork.src = artworkUrl;
  
  // Format IDs
  const formattedId = `#${String(pokemonId).padStart(4, '0')}`;
  cardFrontId.textContent = formattedId;
  cardBackId.textContent = formattedId;

  if (state.studyMode === 'learning') {
    state.isFlipped = true;
    card.classList.add('flipped');
    frontArtwork.classList.remove('silhouette');
  } else {
    state.isFlipped = false;
    card.classList.remove('flipped');
    frontArtwork.classList.add('silhouette');
  }
  
  // Fetch detailed data in parallel background
  fetchPokemonDetails(pokemonId);
}

function resetCardBackDetails() {
  pokemonName.textContent = 'Loading...';
  typesContainer.innerHTML = '<span class="type-pill skeleton" style="width: 70px; height: 22px;"></span>';
  pokemonDesc.textContent = 'Gathering info from Pokédex...';
  
  // Reset stats bars
  ['hp', 'atk', 'def', 'spd'].forEach(stat => {
    document.getElementById(`stat-${stat}`).textContent = '--';
    document.getElementById(`bar-${stat}`).style.width = '0%';
  });
  
  state.currentCryUrl = null;
  if (cryAudio) {
    cryAudio.pause();
    cryAudio = null;
  }
}

async function fetchPokemonDetails(id) {
  state.isLoadingDetails = true;
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    
    // We update name to capitalize
    const displayName = data.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    pokemonName.textContent = displayName;
    
    // Setup Type Badges
    typesContainer.innerHTML = '';
    data.types.forEach(t => {
      const typeSpan = document.createElement('span');
      typeSpan.className = `type-pill type-${t.type.name}`;
      typeSpan.textContent = t.type.name;
      typesContainer.appendChild(typeSpan);
    });
    
    // Dynamically apply primary type colors
    const primaryType = data.types[0].type.name;
    applyTypeTheme(primaryType);
    
    // Setup stats mapping
    const statsMap = {
      hp: data.stats.find(s => s.stat.name === 'hp').base_stat,
      atk: data.stats.find(s => s.stat.name === 'attack').base_stat,
      def: data.stats.find(s => s.stat.name === 'defense').base_stat,
      spd: data.stats.find(s => s.stat.name === 'speed').base_stat,
    };
    
    // Set stats text values
    Object.keys(statsMap).forEach(stat => {
      document.getElementById(`stat-${stat}`).textContent = statsMap[stat];
      // Max out progress bar at 180 for proportional scaling
      const fillPercentage = Math.min((statsMap[stat] / 180) * 100, 100);
      
      // Update bar width if card is already flipped, or wait until flip
      if (state.isFlipped) {
        document.getElementById(`bar-${stat}`).style.width = `${fillPercentage}%`;
      } else {
        // Queue it
        document.getElementById(`bar-${stat}`).dataset.targetWidth = `${fillPercentage}%`;
      }
    });

    // Cry Audio Setup
    state.currentCryUrl = data.cries?.latest || data.cries?.legacy;
    
    // Play cry if card is already flipped (Learning Mode)
    if (state.isFlipped && state.currentCryUrl) {
      playPokemonCry();
    }
    
    // Fetch Species description
    const speciesRes = await fetch(data.species.url);
    if (speciesRes.ok) {
      const speciesData = await speciesRes.json();
      const englishFlavor = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
      if (englishFlavor) {
        // Clean up special characters from games representation
        pokemonDesc.textContent = englishFlavor.flavor_text.replace(/[\f\n\r]/g, ' ');
      } else {
        pokemonDesc.textContent = 'No description found in databases.';
      }
    } else {
      pokemonDesc.textContent = 'Details available online.';
    }
  } catch (error) {
    console.error('Failed fetching Pokemon details:', error);
    // Offline / fallback display
    pokemonName.textContent = state.currentPokemon.name;
    typesContainer.innerHTML = '<span class="type-pill type-normal">Unknown</span>';
    applyTypeTheme('normal');
    pokemonDesc.textContent = 'Failed to load Pokédex entry. Check your connection.';
  } finally {
    state.isLoadingDetails = false;
  }
}

function applyTypeTheme(type) {
  const theme = TYPE_THEMES[type] || TYPE_THEMES.normal;
  document.documentElement.style.setProperty('--type-color', theme.color);
  document.documentElement.style.setProperty('--type-color-rgb', theme.rgb);
  document.documentElement.style.setProperty('--type-gradient-1', theme.g1);
  document.documentElement.style.setProperty('--type-gradient-2', theme.g2);
}

// Interactive 3D Card Tilt
function handleCardTilt(e) {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const xc = rect.width / 2;
  const yc = rect.height / 2;
  
  // Max rotation degree
  const maxRotation = 12;
  const rotateX = ((yc - y) / yc) * maxRotation;
  const rotateY = ((x - xc) / xc) * maxRotation;
  
  card.style.transform = `rotateX(${rotateX}deg) rotateY(${state.isFlipped ? rotateY + 180 : rotateY}deg) scale(1.03)`;
  
  // Set glow coordinates
  const currentFace = state.isFlipped ? card.querySelector('.card-back') : card.querySelector('.card-front');
  const percentX = (x / rect.width) * 100;
  const percentY = (y / rect.height) * 100;
  currentFace.style.setProperty('--mouse-x', `${percentX}%`);
  currentFace.style.setProperty('--mouse-y', `${percentY}%`);
}

function resetCardTilt() {
  card.style.transform = `rotateX(0deg) rotateY(${state.isFlipped ? 180 : 0}deg) scale(1)`;
}

// Action Handlers
function flipCard() {
  state.isFlipped = !state.isFlipped;
  
  if (state.isFlipped) {
    card.classList.add('flipped');
    frontArtwork.classList.remove('silhouette');
    playSFX(soundReveal);
    
    // Play Pokemon Cry if loaded
    setTimeout(() => {
      playPokemonCry();
    }, 300);
    
    // Trigger progress stats bars animation
    ['hp', 'atk', 'def', 'spd'].forEach(stat => {
      const bar = document.getElementById(`bar-${stat}`);
      if (bar.dataset.targetWidth) {
        bar.style.width = bar.dataset.targetWidth;
      }
    });
  } else {
    card.classList.remove('flipped');
    playSFX(soundFlip);
  }
}

function playPokemonCry() {
  if (state.currentCryUrl && !state.isMuted) {
    if (cryAudio) {
      cryAudio.pause();
    }
    cryAudio = new Audio(state.currentCryUrl);
    cryAudio.volume = 0.5; // Moderated volume
    cryAudio.play().catch(err => console.log('Cry playback prevented:', err));
  }
}

function nextPokemon() {
  playSFX(soundNext);
  
  state.currentIndex++;
  if (state.currentIndex >= state.deck.length) {
    // Deck completed, reshuffle
    createNewDeck();
  } else {
    saveDeckToStorage();
  }
  
  updateProgressUI();
  loadCurrentPokemon();
}

// Search Modal Handlers
function showSearchModal() {
  searchDialog.showModal();
  searchInput.value = '';
  searchSuggestions.innerHTML = '';
  searchInput.focus();
}

function closeSearchModal() {
  searchDialog.close();
}

function handleSearchInput() {
  const query = searchInput.value.toLowerCase().trim();
  searchSuggestions.innerHTML = '';
  
  if (!query) return;
  
  // Find top 5 matches
  const matches = POKEMON_DATA.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.id.toString() === query
  ).slice(0, 5);
  
  matches.forEach(p => {
    const div = document.createElement('div');
    div.style.padding = '0.5rem';
    div.style.cursor = 'pointer';
    div.style.background = 'rgba(255,255,255,0.03)';
    div.style.borderRadius = '8px';
    div.style.fontSize = '0.9rem';
    div.style.transition = 'background 0.2s';
    div.textContent = `#${String(p.id).padStart(4, '0')} - ${p.name}`;
    
    div.addEventListener('mouseenter', () => {
      div.style.background = 'rgba(255,255,255,0.08)';
    });
    div.addEventListener('mouseleave', () => {
      div.style.background = 'rgba(255,255,255,0.03)';
    });
    div.addEventListener('click', () => {
      jumpToPokemon(p.id);
      closeSearchModal();
    });
    
    searchSuggestions.appendChild(div);
  });
}

function executeSearchGo() {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return;
  
  const found = POKEMON_DATA.find(p => 
    p.name.toLowerCase() === query || 
    p.id.toString() === query
  );
  
  if (found) {
    jumpToPokemon(found.id);
    closeSearchModal();
  } else {
    searchInput.style.outline = '2px solid var(--type-color)';
    setTimeout(() => { searchInput.style.outline = 'none'; }, 1000);
  }
}

function jumpToPokemon(pokemonId) {
  // Find target id in deck
  const deckIdx = state.deck.indexOf(pokemonId);
  if (deckIdx !== -1) {
    // Swap target deck index with current index to seamlessly transition
    const temp = state.deck[state.currentIndex];
    state.deck[state.currentIndex] = state.deck[deckIdx];
    state.deck[deckIdx] = temp;
  } else {
    // Fallback if not found (should always be found)
    state.deck[state.currentIndex] = pokemonId;
  }
  
  saveDeckToStorage();
  loadCurrentPokemon();
}

// Event Listeners Setup
function setupEventListeners() {
  // Flip Card trigger
  card.addEventListener('click', flipCard);
  btnReveal.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid double flipping from click on card
    flipCard();
  });
  
  // Next Card trigger
  btnNext.addEventListener('click', nextPokemon);
  
  // Sound controls
  btnSoundToggle.addEventListener('click', toggleMute);
  btnPlayCry.addEventListener('click', (e) => {
    e.stopPropagation();
    playPokemonCry();
  });
  
  // Theme control
  btnThemeToggle.addEventListener('click', toggleTheme);
  
  // Study Mode control
  btnModeToggle.addEventListener('click', toggleStudyMode);
  
  // Card 3D tilt effects
  card.addEventListener('mousemove', handleCardTilt);
  card.addEventListener('mouseleave', resetCardTilt);
  card.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      handleCardTilt(e.touches[0]);
    }
  });
  card.addEventListener('touchend', resetCardTilt);
  
  // Search features
  searchToggle.addEventListener('click', showSearchModal);
  btnSearchClose.addEventListener('click', closeSearchModal);
  btnSearchGo.addEventListener('click', executeSearchGo);
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearchGo();
  });
  
  // Keyboard navigation shortcuts
  window.addEventListener('keydown', (e) => {
    // Block triggers when input elements are focused
    if (document.activeElement.tagName === 'INPUT') return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        flipCard();
        break;
      case 'ArrowRight':
      case 'Enter':
        e.preventDefault();
        nextPokemon();
        break;
      case 'KeyS':
        e.preventDefault();
        showSearchModal();
        break;
      case 'KeyM':
        e.preventDefault();
        toggleMute();
        break;
      case 'KeyT':
        e.preventDefault();
        toggleTheme();
        break;
      case 'KeyL':
        e.preventDefault();
        toggleStudyMode();
        break;
      case 'KeyC':
        e.preventDefault();
        if (state.isFlipped) playPokemonCry();
        break;
    }
  });
}
