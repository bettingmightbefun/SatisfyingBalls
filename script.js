// SatisfyingBalls - Complete Overhaul
// Camera-focused, procedural maze, satisfying physics

class SatisfyingBalls {
    constructor() {
        // Audio
        this.audioContext = null;
        this.audioBuffer = null;
        this.source = null;
        this.analyser = null;
        this.isPlaying = false;
        this.audioFileName = '';
        
        // Beat detection
        this.beatHistory = [];
        this.beatThreshold = 1.3;
        this.lastBeatTime = 0;
        this.beatCooldown = 100; // ms between beats
        
        // Canvas & rendering
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1.5,
            smoothing: 0.08 // Lower = smoother, slower follow
        };
        
        // World & maze
        this.world = {
            width: 50,
            height: 50,
            cellSize: 40
        };
        this.maze = [];
        
        // Ball
        this.ball = {
            x: 100,
            y: 100,
            vx: 0,
            vy: 0,
            radius: 15,
            color: '#4ecdc4',
            trail: [],
            trailLength: 15,
            glowIntensity: 0
        };
        
        // Settings
        this.settings = {
            beatSensitivity: 1.2,
            physicsSpeed: 0.6,
            cameraZoom: 1.5,
            ballSize: 15,
            trailLength: 15
        };
        
        // Colors
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
        this.particles = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.animate();
    }
    
    setupEventListeners() {
        // Landing page - file upload
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('audio-file');
        const browseBtn = document.getElementById('browse-btn');
        
        // Click to browse
        browseBtn.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) {
                this.loadAudioFile(file);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadAudioFile(file);
            }
        });
        
        // Game view controls
        document.getElementById('play-pause').addEventListener('click', () => {
            this.togglePlayback();
        });
        
        document.getElementById('back-btn').addEventListener('click', () => {
            this.backToLanding();
        });
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });
        
        document.getElementById('close-settings').addEventListener('click', () => {
            this.toggleSettings();
        });
        
        document.getElementById('reset-maze').addEventListener('click', () => {
            this.generateMaze();
            this.resetBall();
        });
        
        // Settings sliders
        this.setupSettingsListeners();
    }
    
    setupSettingsListeners() {
        const sliders = [
            { id: 'zoom-slider', value: 'zoom-value', suffix: 'x', prop: 'cameraZoom' },
            { id: 'size-slider', value: 'size-value', suffix: 'px', prop: 'ballSize' },
            { id: 'sensitivity-slider', value: 'sensitivity-value', suffix: 'x', prop: 'beatSensitivity' },
            { id: 'speed-slider', value: 'speed-value', suffix: 'x', prop: 'physicsSpeed' },
            { id: 'trail-slider', value: 'trail-value', suffix: '', prop: 'trailLength' }
        ];
        
        sliders.forEach(slider => {
            const input = document.getElementById(slider.id);
            const display = document.getElementById(slider.value);
            
            input.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                display.textContent = val + slider.suffix;
                this.settings[slider.prop] = val;
                this.applySettings();
            });
        });
    }
    
    applySettings() {
        this.camera.zoom = this.settings.cameraZoom;
        this.ball.radius = this.settings.ballSize;
        this.ball.trailLength = this.settings.trailLength;
        this.beatThreshold = 1.3 * this.settings.beatSensitivity;
    }
    
    setupCanvas() {
        // Make canvas fullscreen
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    async loadAudioFile(file) {
        this.audioFileName = file.name;
        
        // Show loading state
        const uploadZone = document.getElementById('upload-zone');
        uploadZone.innerHTML = '<div class="loading-spinner"></div><p>Loading audio...</p>';
        
        try {
            await this.initializeAudioContext();
            
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Generate maze for this audio
            this.generateMaze();
            this.resetBall();
            
            // Transition to game view
            this.showGameView();
            
        } catch (error) {
            console.error('Error loading audio:', error);
            uploadZone.innerHTML = `
                <div class="upload-icon">❌</div>
                <h2>Error loading audio</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()">Try Again</button>
            `;
        }
    }
    
    async initializeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.7;
            
            this.analyser.connect(this.audioContext.destination);
        }
    }
    
    showGameView() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('game-view').classList.remove('hidden');
        document.getElementById('audio-title').textContent = this.audioFileName;
        
        // Auto-play
        setTimeout(() => this.playAudio(), 500);
    }
    
    backToLanding() {
        this.stopAudio();
        document.getElementById('game-view').classList.add('hidden');
        document.getElementById('landing-page').classList.remove('hidden');
        
        // Reset upload zone
        const uploadZone = document.getElementById('upload-zone');
        uploadZone.innerHTML = `
            <div class="upload-icon">🎵</div>
            <h2>Drop your audio file here</h2>
            <p>or click to browse</p>
            <input type="file" id="audio-file" accept="audio/*" hidden />
            <p class="supported-formats">MP3, WAV, OGG, M4A</p>
        `;
        
        // Re-attach event listeners
        this.setupEventListeners();
    }
    
    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('hidden');
    }
    
    generateMaze() {
        const { width, height } = this.world;
        this.maze = [];
        
        // Initialize empty maze
        for (let y = 0; y < height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < width; x++) {
                this.maze[y][x] = 0;
            }
        }
        
        // Add border walls
        for (let x = 0; x < width; x++) {
            this.maze[0][x] = 1;
            this.maze[height - 1][x] = 1;
        }
        for (let y = 0; y < height; y++) {
            this.maze[y][0] = 1;
            this.maze[y][width - 1] = 1;
        }
        
        // Generate random walls with corridors
        for (let y = 2; y < height - 2; y += 3) {
            for (let x = 2; x < width - 2; x += 3) {
                // Create cross patterns and random walls
                if (Math.random() > 0.3) {
                    this.maze[y][x] = 1;
                    
                    // Extend in random directions
                    const directions = [
                        [0, -1], [0, 1], [-1, 0], [1, 0]
                    ];
                    
                    const numExtensions = Math.floor(Math.random() * 3) + 1;
                    for (let i = 0; i < numExtensions; i++) {
                        const dir = directions[Math.floor(Math.random() * directions.length)];
                        const nx = x + dir[0];
                        const ny = y + dir[1];
                        
                        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
                            this.maze[ny][nx] = 1;
                        }
                    }
                }
            }
        }
        
        // Ensure starting area is clear
        for (let y = 1; y < 5; y++) {
            for (let x = 1; x < 5; x++) {
                this.maze[y][x] = 0;
            }
        }
    }
    
    resetBall() {
        this.ball.x = this.world.cellSize * 2.5;
        this.ball.y = this.world.cellSize * 2.5;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.trail = [];
    }
    
    togglePlayback() {
        const btn = document.getElementById('play-pause');
        
        if (this.isPlaying) {
            this.stopAudio();
            btn.textContent = '▶';
        } else {
            this.playAudio();
            btn.textContent = '⏸';
        }
    }
    
    playAudio() {
        if (!this.audioBuffer || this.isPlaying) return;
        
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.analyser);
        this.source.start(0);
        this.isPlaying = true;
        
        // Auto-stop when finished
        this.source.onended = () => {
            this.isPlaying = false;
            document.getElementById('play-pause').textContent = '▶';
        };
    }
    
    stopAudio() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
        this.isPlaying = false;
    }
    
    detectBeat() {
        if (!this.analyser || !this.isPlaying) return false;
        
        const now = Date.now();
        if (now - this.lastBeatTime < this.beatCooldown) return false;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Focus on bass frequencies
        let sum = 0;
        const bassRange = Math.floor(bufferLength * 0.15);
        
        for (let i = 0; i < bassRange; i++) {
            sum += dataArray[i];
        }
        
        const average = sum / bassRange;
        
        this.beatHistory.push(average);
        if (this.beatHistory.length > 20) {
            this.beatHistory.shift();
        }
        
        const historyAvg = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
        const beatDetected = average > historyAvg * this.beatThreshold && average > 30;
        
        if (beatDetected) {
            this.lastBeatTime = now;
        }
        
        return beatDetected;
    }
    
    updateBall() {
        const beatDetected = this.detectBeat();
        const speedMult = this.settings.physicsSpeed;
        
        // Beat-based impulse
        if (beatDetected) {
            const force = 3 * this.settings.beatSensitivity;
            const angle = Math.random() * Math.PI * 2;
            this.ball.vx += Math.cos(angle) * force * speedMult;
            this.ball.vy += Math.sin(angle) * force * speedMult;
            
            // Visual effects
            this.ball.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.ball.glowIntensity = 1;
            this.createBeatParticles();
        }
        
        // Gentle gravity
        this.ball.vy += 0.15 * speedMult;
        
        // Friction (for that slow, satisfying feel)
        this.ball.vx *= 0.985;
        this.ball.vy *= 0.985;
        
        // Update position
        this.ball.x += this.ball.vx * speedMult;
        this.ball.y += this.ball.vy * speedMult;
        
        // Collision detection
        this.handleCollisions();
        
        // Update trail
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y, alpha: 1 });
        if (this.ball.trail.length > this.ball.trailLength) {
            this.ball.trail.shift();
        }
        
        // Fade trail
        this.ball.trail.forEach((point, i) => {
            point.alpha = i / this.ball.trail.length;
        });
        
        // Fade glow
        this.ball.glowIntensity *= 0.92;
    }
    
    handleCollisions() {
        const cellSize = this.world.cellSize;
        const gridX = Math.floor(this.ball.x / cellSize);
        const gridY = Math.floor(this.ball.y / cellSize);
        
        // Check surrounding cells
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = gridX + dx;
                const checkY = gridY + dy;
                
                if (checkX >= 0 && checkX < this.world.width &&
                    checkY >= 0 && checkY < this.world.height) {
                    
                    if (this.maze[checkY][checkX] === 1) {
                        const wallLeft = checkX * cellSize;
                        const wallRight = (checkX + 1) * cellSize;
                        const wallTop = checkY * cellSize;
                        const wallBottom = (checkY + 1) * cellSize;
                        
                        // Circle-rectangle collision
                        if (this.ball.x + this.ball.radius > wallLeft &&
                            this.ball.x - this.ball.radius < wallRight &&
                            this.ball.y + this.ball.radius > wallTop &&
                            this.ball.y - this.ball.radius < wallBottom) {
                            
                            // Calculate overlap
                            const overlapX = Math.min(
                                this.ball.x + this.ball.radius - wallLeft,
                                wallRight - (this.ball.x - this.ball.radius)
                            );
                            const overlapY = Math.min(
                                this.ball.y + this.ball.radius - wallTop,
                                wallBottom - (this.ball.y - this.ball.radius)
                            );
                            
                            // Resolve collision
                            if (overlapX < overlapY) {
                                // Horizontal collision
                                if (this.ball.x < wallLeft + cellSize / 2) {
                                    this.ball.x = wallLeft - this.ball.radius;
                                } else {
                                    this.ball.x = wallRight + this.ball.radius;
                                }
                                this.ball.vx *= -0.7;
                            } else {
                                // Vertical collision
                                if (this.ball.y < wallTop + cellSize / 2) {
                                    this.ball.y = wallTop - this.ball.radius;
                                } else {
                                    this.ball.y = wallBottom + this.ball.radius;
                                }
                                this.ball.vy *= -0.7;
                            }
                        }
                    }
                }
            }
        }
    }
    
    createBeatParticles() {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.particles.push({
                x: this.ball.x,
                y: this.ball.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: this.ball.color,
                size: 3 + Math.random() * 4
            });
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.vx *= 0.97;
            p.life -= 0.025;
            return p.life > 0;
        });
    }
    
    updateCamera() {
        // Smooth camera follow
        const targetX = this.ball.x;
        const targetY = this.ball.y;
        
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
    }
    
    draw() {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        
        // Clear with dark background
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, width, height);
        
        // Save context for camera transform
        ctx.save();
        
        // Apply camera transform
        ctx.translate(width / 2, height / 2);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Calculate visible area
        const visibleLeft = this.camera.x - (width / 2 / this.camera.zoom);
        const visibleRight = this.camera.x + (width / 2 / this.camera.zoom);
        const visibleTop = this.camera.y - (height / 2 / this.camera.zoom);
        const visibleBottom = this.camera.y + (height / 2 / this.camera.zoom);
        
        const cellSize = this.world.cellSize;
        const startX = Math.max(0, Math.floor(visibleLeft / cellSize));
        const endX = Math.min(this.world.width, Math.ceil(visibleRight / cellSize));
        const startY = Math.max(0, Math.floor(visibleTop / cellSize));
        const endY = Math.min(this.world.height, Math.ceil(visibleBottom / cellSize));
        
        // Draw maze (only visible cells)
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 1;
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (this.maze[y][x] === 1) {
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
        
        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Draw ball trail
        this.ball.trail.forEach((point, i) => {
            ctx.globalAlpha = point.alpha * 0.4;
            ctx.fillStyle = this.ball.color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.ball.radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Draw ball with glow
        const glowSize = 15 + this.ball.glowIntensity * 30;
        ctx.shadowColor = this.ball.color;
        ctx.shadowBlur = glowSize;
        
        // Outer glow
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = this.ball.color;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius + glowSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Main ball
        ctx.fillStyle = this.ball.color;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.ball.x - 4, this.ball.y - 4, this.ball.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Restore context
        ctx.restore();
    }
    
    animate() {
        this.updateBall();
        this.updateParticles();
        this.updateCamera();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new SatisfyingBalls();
});
