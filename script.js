// SatisfyingBalls - Audio-Driven Ball Physics Simulation
class SatisfyingBalls {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.source = null;
        this.analyser = null;
        this.isPlaying = false;
        this.beatHistory = [];
        this.beatThreshold = 1.3;
        this.sensitivity = 1.0;

        // Canvas and physics properties
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.maze = [];
        this.particles = []; // For visual effects
        this.beatParticles = []; // Particles that spawn on beats
        this.ball = {
            x: 50,
            y: 50,
            vx: 0,
            vy: 0,
            radius: 12,
            color: '#ff6b6b',
            trail: [], // Ball trail for satisfying effect
            glowIntensity: 0
        };
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateMaze();
        this.setupCanvas();
        this.animate();
    }

    createBeatParticles() {
        // Create particles that shoot out from the ball on beats
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;
            this.beatParticles.push({
                x: this.ball.x,
                y: this.ball.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: this.ball.color,
                size: 2 + Math.random() * 3
            });
        }
    }

    updateParticles() {
        // Update beat particles
        this.beatParticles = this.beatParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= 0.02;
            particle.vx *= 0.98; // air resistance

            return particle.life > 0;
        });
    }

    setupEventListeners() {
        // Demo button
        document.getElementById('play-demo').addEventListener('click', () => {
            this.loadDemoAudio();
        });

        // YouTube URL input
        document.getElementById('load-youtube').addEventListener('click', () => {
            const url = document.getElementById('youtube-url').value;
            if (url) {
                this.loadYouTubeAudio(url);
            }
        });

        // File upload
        document.getElementById('load-file').addEventListener('click', () => {
            const file = document.getElementById('audio-file').files[0];
            if (file) {
                this.loadAudioFile(file);
            }
        });

        // Audio controls
        document.getElementById('play-pause').addEventListener('click', () => {
            this.togglePlayback();
        });

        document.getElementById('restart').addEventListener('click', () => {
            this.restartAudio();
        });

        document.getElementById('volume').addEventListener('input', (e) => {
            if (this.source) {
                this.source.volume = e.target.value;
            }
        });

        // Simulation controls
        document.getElementById('generate-maze').addEventListener('click', () => {
            this.generateMaze();
        });

        document.getElementById('reset-ball').addEventListener('click', () => {
            this.resetBall();
        });

        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.sensitivity = parseFloat(e.target.value);
            this.beatThreshold = 1.3 * this.sensitivity;
        });
    }

    async loadDemoAudio() {
        const button = document.getElementById('play-demo');
        button.textContent = '🎵 Loading Demo...';
        button.classList.add('loading');

        try {
            await this.initializeAudioContext();
            this.createTestAudio();

            button.textContent = '✅ Demo Ready!';
            document.getElementById('audio-controls').style.display = 'flex';

            setTimeout(() => {
                button.textContent = '🎵 Play Demo Audio';
                button.classList.remove('loading');
            }, 2000);

        } catch (error) {
            console.error('Error loading demo audio:', error);
            button.textContent = '❌ Error - Try Again';
            button.classList.remove('loading');
        }
    }

    async loadYouTubeAudio(url) {
        const button = document.getElementById('load-youtube');
        button.textContent = 'Loading...';
        button.classList.add('loading');

        try {
            // For now, we'll simulate loading audio from YouTube
            // In a real implementation, you'd need a backend service to extract audio
            console.log('Loading audio from YouTube:', url);

            // Create a test audio context and buffer
            await this.initializeAudioContext();

            // For demo purposes, create a simple test audio
            this.createTestAudio();

            button.textContent = 'Audio Loaded!';
            document.getElementById('audio-controls').style.display = 'flex';

            setTimeout(() => {
                button.textContent = 'Load Audio';
                button.classList.remove('loading');
            }, 2000);

        } catch (error) {
            console.error('Error loading YouTube audio:', error);
            button.textContent = 'Error - Try Again';
            button.classList.remove('loading');
        }
    }

    async loadAudioFile(file) {
        const button = document.getElementById('load-file');
        button.textContent = 'Loading...';
        button.classList.add('loading');

        try {
            await this.initializeAudioContext();

            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            button.textContent = 'Audio Loaded!';
            document.getElementById('audio-controls').style.display = 'flex';

            setTimeout(() => {
                button.textContent = 'Load File';
                button.classList.remove('loading');
            }, 2000);

        } catch (error) {
            console.error('Error loading audio file:', error);
            button.textContent = 'Error - Try Again';
            button.classList.remove('loading');
        }
    }

    async initializeAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create analyser for frequency analysis
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            // Connect analyser to destination
            this.analyser.connect(this.audioContext.destination);
        }
    }

    createTestAudio() {
        // Create a more satisfying test audio with dynamic beats and rhythm
        const sampleRate = this.audioContext.sampleRate;
        const duration = 15; // 15 seconds
        const frameCount = sampleRate * duration;

        this.audioBuffer = this.audioContext.createBuffer(2, frameCount, sampleRate);

        // Create different sections with varying intensity
        const sections = [
            { start: 0, end: 5, bpm: 120, intensity: 0.7 },
            { start: 5, end: 10, bpm: 140, intensity: 1.0 },
            { start: 10, end: 15, bpm: 160, intensity: 0.9 }
        ];

        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const channelData = this.audioBuffer.getChannelData(channel);

            for (let i = 0; i < frameCount; i++) {
                const time = i / sampleRate;
                let sample = 0;

                // Find current section
                const currentSection = sections.find(s => time >= s.start && time < s.end) || sections[0];

                // Calculate beat timing
                const beatInterval = 60 / currentSection.bpm;
                const beatPosition = (time - currentSection.start) % beatInterval;
                const beatStrength = Math.max(0, 1 - (beatPosition / (beatInterval * 0.1)));

                // Main beat (kick drum simulation)
                if (beatStrength > 0.1) {
                    const kickFreq = 60 + (beatStrength * 40); // Frequency sweep
                    sample += Math.sin(time * kickFreq * Math.PI * 2) * beatStrength * 0.4 * currentSection.intensity;
                }

                // Snare on 2nd and 4th beats
                const measurePosition = ((time - currentSection.start) % (beatInterval * 4)) / (beatInterval * 4);
                if (measurePosition > 0.45 && measurePosition < 0.55) {
                    const noise = (Math.random() - 0.5) * 2;
                    sample += noise * 0.2 * currentSection.intensity;
                }

                // Bass line
                const bassNote = [55, 65, 73, 82][Math.floor(time * 2) % 4];
                sample += Math.sin(time * bassNote * Math.PI * 2) * 0.15 * currentSection.intensity;

                // Melody
                const melodyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
                const melodyIndex = Math.floor(time * 3) % melodyNotes.length;
                if (Math.random() > 0.7) { // Sparse melody
                    sample += Math.sin(time * melodyNotes[melodyIndex] * Math.PI * 2) * 0.1 * currentSection.intensity;
                }

                // Add some reverb-like effect
                if (i > sampleRate * 0.01) {
                    sample += channelData[i - Math.floor(sampleRate * 0.01)] * 0.1;
                }

                // Prevent clipping
                sample = Math.max(-0.8, Math.min(0.8, sample));

                channelData[i] = sample;
            }
        }
    }

    togglePlayback() {
        const button = document.getElementById('play-pause');

        if (this.isPlaying) {
            this.stopAudio();
            button.textContent = '▶️ Play';
        } else {
            this.playAudio();
            button.textContent = '⏸️ Pause';
        }
    }

    playAudio() {
        if (!this.audioBuffer) return;

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.analyser);
        this.source.start(0);
        this.isPlaying = true;
    }

    stopAudio() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
        this.isPlaying = false;
    }

    restartAudio() {
        this.stopAudio();
        this.playAudio();
        document.getElementById('play-pause').textContent = '⏸️ Pause';
    }

    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = Math.min(800, window.innerWidth - 40);
            this.canvas.height = Math.min(600, window.innerHeight - 200);
        });
    }

    generateMaze() {
        // Simple maze generation using recursive backtracking
        const width = 20;
        const height = 15;
        const cellSize = 30;

        this.maze = [];
        for (let y = 0; y < height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < width; x++) {
                this.maze[y][x] = Math.random() > 0.7 ? 1 : 0; // 1 = wall, 0 = empty
            }
        }

        // Ensure borders are walls
        for (let x = 0; x < width; x++) {
            this.maze[0][x] = 1;
            this.maze[height - 1][x] = 1;
        }
        for (let y = 0; y < height; y++) {
            this.maze[y][0] = 1;
            this.maze[y][width - 1] = 1;
        }

        // Ensure start and end are clear
        this.maze[1][1] = 0;
        this.maze[height - 2][width - 2] = 0;
    }

    resetBall() {
        this.ball.x = 50;
        this.ball.y = 50;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    detectBeat() {
        if (!this.analyser) return false;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Calculate average energy in low frequencies (bass)
        let sum = 0;
        const bassRange = Math.floor(bufferLength * 0.1); // First 10% of frequencies

        for (let i = 0; i < bassRange; i++) {
            sum += dataArray[i];
        }

        const average = sum / bassRange;

        // Keep history for beat detection
        this.beatHistory.push(average);
        if (this.beatHistory.length > 10) {
            this.beatHistory.shift();
        }

        // Detect beat if current energy is significantly higher than average
        const historyAvg = this.beatHistory.reduce((a, b) => a + b) / this.beatHistory.length;
        const beatDetected = average > historyAvg * this.beatThreshold;

        return beatDetected;
    }

    updateBall() {
        const beatDetected = this.detectBeat();

        // Update ball trail
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y, alpha: 1 });
        if (this.ball.trail.length > 15) {
            this.ball.trail.shift();
        }

        // Update trail alpha
        this.ball.trail.forEach((point, index) => {
            point.alpha = index / this.ball.trail.length;
        });

        // Apply beat-based force
        if (beatDetected) {
            const force = 5 * this.sensitivity;
            const angle = Math.random() * Math.PI * 2;
            this.ball.vx += Math.cos(angle) * force;
            this.ball.vy += Math.sin(angle) * force;

            // Create beat particles
            this.createBeatParticles();

            // Change ball color on beat
            this.ball.color = this.colors[Math.floor(Math.random() * this.colors.length)];

            // Increase glow
            this.ball.glowIntensity = 1;
        }

        // Gradually reduce glow
        this.ball.glowIntensity *= 0.95;

        // Apply gravity
        this.ball.vy += 0.3;

        // Apply friction
        this.ball.vx *= 0.99;
        this.ball.vy *= 0.99;

        // Update position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Collision detection with maze walls
        const cellSize = 30;
        const ballGridX = Math.floor(this.ball.x / cellSize);
        const ballGridY = Math.floor(this.ball.y / cellSize);

        // Check surrounding cells for collisions
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = ballGridX + dx;
                const checkY = ballGridY + dy;

                if (checkX >= 0 && checkX < 20 && checkY >= 0 && checkY < 15) {
                    if (this.maze[checkY][checkX] === 1) {
                        const wallLeft = checkX * cellSize;
                        const wallRight = (checkX + 1) * cellSize;
                        const wallTop = checkY * cellSize;
                        const wallBottom = (checkY + 1) * cellSize;

                        // Check collision with this wall
                        if (this.ball.x + this.ball.radius > wallLeft &&
                            this.ball.x - this.ball.radius < wallRight &&
                            this.ball.y + this.ball.radius > wallTop &&
                            this.ball.y - this.ball.radius < wallBottom) {

                            // Determine which side of the wall we hit
                            const overlapX = Math.min(this.ball.x + this.ball.radius - wallLeft, wallRight - (this.ball.x - this.ball.radius));
                            const overlapY = Math.min(this.ball.y + this.ball.radius - wallTop, wallBottom - (this.ball.y - this.ball.radius));

                            if (overlapX < overlapY) {
                                // Horizontal collision
                                if (this.ball.x < wallLeft + cellSize / 2) {
                                    this.ball.x = wallLeft - this.ball.radius;
                                } else {
                                    this.ball.x = wallRight + this.ball.radius;
                                }
                                this.ball.vx *= -0.8;
                            } else {
                                // Vertical collision
                                if (this.ball.y < wallTop + cellSize / 2) {
                                    this.ball.y = wallTop - this.ball.radius;
                                } else {
                                    this.ball.y = wallBottom + this.ball.radius;
                                }
                                this.ball.vy *= -0.8;
                            }
                        }
                    }
                }
            }
        }

        // Bounce off canvas edges
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -0.8;
        }
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -0.8;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -0.8;
        }
        if (this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.y = this.canvas.height - this.ball.radius;
            this.ball.vy *= -0.8;
        }
    }

    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze with some glow
        const cellSize = Math.min(this.canvas.width / 20, this.canvas.height / 15);
        this.ctx.shadowColor = '#333';
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = '#2a2a3a';

        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 1) {
                    this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }

        this.ctx.shadowBlur = 0;

        // Draw beat particles
        this.beatParticles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        // Draw ball trail
        this.ball.trail.forEach((point, index) => {
            const alpha = point.alpha * 0.5;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.ball.radius * (0.3 + alpha * 0.7), 0, Math.PI * 2);
            this.ctx.fillStyle = this.ball.color;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;

        // Draw ball with dynamic glow
        const glowAmount = 10 + this.ball.glowIntensity * 30;
        this.ctx.shadowColor = this.ball.color;
        this.ctx.shadowBlur = glowAmount;

        // Outer glow ring
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius + glowAmount * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.globalAlpha = 0.3;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        // Main ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.fill();

        // Inner highlight
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - 3, this.ball.y - 3, this.ball.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();

        // Beat pulse effect
        if (this.isPlaying && this.detectBeat()) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = '#fff';
            this.ctx.shadowBlur = 10;

            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.ctx.beginPath();
                    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius + 10 + i * 5, 0, Math.PI * 2);
                    this.ctx.stroke();
                }, i * 50);
            }

            this.ctx.shadowBlur = 0;
        }
    }

    animate() {
        this.updateBall();
        this.updateParticles();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SatisfyingBalls();
});
