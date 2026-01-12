// ========== PLAYLIST DATA ==========
const playlist = [
    {
        id: 1,
        title: "Midnight Dreams",
        artist: "The Synthesizers",
        duration: 180,
        color: "#9333ea"
    },
    {
        id: 2,
        title: "Neon Lights",
        artist: "Electric Avenue",
        duration: 195,
        color: "#2563eb"
    },
    {
        id: 3,
        title: "Sunset Boulevard",
        artist: "Retro Wave",
        duration: 210,
        color: "#ea580c"
    },
    {
        id: 4,
        title: "Digital Rain",
        artist: "Cyber Dreams",
        duration: 165,
        color: "#059669"
    },
    {
        id: 5,
        title: "Cosmic Journey",
        artist: "Space Explorers",
        duration: 240,
        color: "#7c3aed"
    }
];

// ========== STATE MANAGEMENT ==========
let state = {
    currentTrackIndex: 0,
    isPlaying: false,
    progress: 0,
    theme: localStorage.getItem('music-player-theme') || 'dark'
};

let progressInterval = null;

// ========== DOM ELEMENTS ==========
const themeToggle = document.getElementById('themeToggle');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const albumCover = document.getElementById('albumCover');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const currentTrackEl = document.getElementById('currentTrack');
const totalTracksEl = document.getElementById('totalTracks');
const playlistItems = document.getElementById('playlistItems');
const songInfo = document.getElementById('songInfo');

// ========== INITIALIZATION ==========
function init() {
    applyTheme();
    updateUI();
    renderPlaylist();
    attachEventListeners();
    totalTracksEl.textContent = playlist.length;
}

// ========== THEME MANAGEMENT ==========
function applyTheme() {
    document.body.className = state.theme;
    localStorage.setItem('music-player-theme', state.theme);
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
}

// ========== PLAYBACK CONTROLS ==========
function togglePlay() {
    state.isPlaying = !state.isPlaying;
    
    if (state.isPlaying) {
        startProgress();
        albumCover.classList.add('spinning');
        playBtn.classList.add('playing');
        playBtn.setAttribute('aria-label', 'Pause');
    } else {
        stopProgress();
        albumCover.classList.remove('spinning');
        playBtn.classList.remove('playing');
        playBtn.setAttribute('aria-label', 'Play');
    }
}

function handleNext() {
    state.currentTrackIndex = (state.currentTrackIndex + 1) % playlist.length;
    state.progress = 0;
    state.isPlaying = true;
    updateUI();
    startProgress();
}

function handlePrev() {
    if (state.progress > 3) {
        // Restart current track if more than 3% played
        state.progress = 0;
        updateProgress();
    } else {
        // Go to previous track
        state.currentTrackIndex = (state.currentTrackIndex - 1 + playlist.length) % playlist.length;
        state.progress = 0;
        state.isPlaying = true;
        updateUI();
        startProgress();
    }
}

// ========== PROGRESS MANAGEMENT ==========
function startProgress() {
    stopProgress(); // Clear any existing interval
    
    const currentTrack = playlist[state.currentTrackIndex];
    const increment = 100 / currentTrack.duration;
    
    progressInterval = setInterval(() => {
        state.progress += increment;
        
        if (state.progress >= 100) {
            handleNext();
            return;
        }
        
        updateProgress();
    }, 1000);
}

function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgress() {
    progressFill.style.width = `${state.progress}%`;
    
    const currentTrack = playlist[state.currentTrackIndex];
    const currentSeconds = Math.floor((state.progress / 100) * currentTrack.duration);
    currentTimeEl.textContent = formatTime(currentSeconds);
}

function handleProgressClick(e) {
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    state.progress = Math.min(100, Math.max(0, percentage));
    updateProgress();
}

// ========== UI UPDATES ==========
function updateUI() {
    const currentTrack = playlist[state.currentTrackIndex];
    
    // Update song info with animation
    songInfo.style.animation = 'none';
    setTimeout(() => {
        songTitle.textContent = currentTrack.title;
        songArtist.textContent = currentTrack.artist;
        songInfo.style.animation = 'slideIn 0.3s ease-out';
    }, 10);
    
    // Update album color
    const albumInner = albumCover.querySelector('.album-inner');
    albumInner.style.background = `linear-gradient(135deg, ${currentTrack.color} 0%, #ec4899 100%)`;
    
    // Update play button gradient
    playBtn.style.background = `linear-gradient(135deg, ${currentTrack.color} 0%, #ec4899 100%)`;
    
    // Update progress bar gradient
    progressFill.style.background = `linear-gradient(90deg, ${currentTrack.color} 0%, #ec4899 100%)`;
    
    // Update duration
    durationEl.textContent = formatTime(currentTrack.duration);
    
    // Update track counter
    currentTrackEl.textContent = state.currentTrackIndex + 1;
    
    // Update play state
    if (state.isPlaying) {
        albumCover.classList.add('spinning');
        playBtn.classList.add('playing');
    } else {
        albumCover.classList.remove('spinning');
        playBtn.classList.remove('playing');
    }
    
    updateProgress();
    renderPlaylist();
}

function renderPlaylist() {
    playlistItems.innerHTML = '';
    
    // Show next 3 tracks
    const nextTracks = [];
    for (let i = 1; i <= 3; i++) {
        const index = (state.currentTrackIndex + i) % playlist.length;
        nextTracks.push(playlist[index]);
    }
    
    nextTracks.forEach(track => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.innerHTML = `
            <div class="playlist-item-info">
                <div>
                    <div class="playlist-item-title">${track.title}</div>
                    <div class="playlist-item-artist">${track.artist}</div>
                </div>
                <div class="playlist-item-duration">${formatTime(track.duration)}</div>
            </div>
        `;
        playlistItems.appendChild(item);
    });
}

// ========== UTILITIES ==========
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========== EVENT LISTENERS ==========
function attachEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', handlePrev);
    nextBtn.addEventListener('click', handleNext);
    progressBar.addEventListener('click', handleProgressClick);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                handleNext();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                handlePrev();
                break;
        }
    });
}

// ========== START APP ==========
init();