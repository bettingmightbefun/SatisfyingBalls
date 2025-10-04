/**
 * App - Main application class that coordinates all modules
 */
import { AudioManager } from './AudioManager.js';
import { BeatDetector } from './BeatDetector.js';
import { MazeGenerator } from './MazeGenerator.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { ParticleSystem } from './ParticleSystem.js';
import { Renderer } from './Renderer.js';

export class App {
    constructor() {
        // Initialize modules
        this.audioManager = new AudioManager();
        this.beatDetector = new BeatDetector(1.0);
        this.mazeGenerator = new MazeGenerator(20, 15);
        this.particleSystem = new ParticleSystem();

        // Get canvas
        this.canvas = document.getElementById('simulation-canvas');
        this.renderer = new Renderer(this.canvas);

        // Initialize physics engine with maze
        const initialMaze = this.mazeGenerator.generate();
        this.physicsEngine = new PhysicsEngine(
            initialMaze,
            this.canvas.width,
            this.canvas.height
        );

        // Animation state
        this.animationId = null;

        // Initialize the app
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.startAnimation();
    }

    /**
     * Setup canvas dimensions
     */
    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.canvas.width = Math.min(800, window.innerWidth - 40);
            this.canvas.height = Math.min(600, window.innerHeight - 200);
        });
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Demo button
        document.getElementById('play-demo').addEventListener('click', async () => {
            await this.loadDemo();
        });

        // YouTube URL input
        document.getElementById('load-youtube').addEventListener('click', async () => {
            const url = document.getElementById('youtube-url').value;
            if (url) {
                await this.loadYouTube(url);
            } else {
                this.showError('Please enter a YouTube URL');
            }
        });

        // File upload
        document.getElementById('load-file').addEventListener('click', async () => {
            const fileInput = document.getElementById('audio-file');
            const file = fileInput.files[0];
            if (file) {
                await this.loadFile(file);
            } else {
                this.showError('Please select an audio file');
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
            this.audioManager.setVolume(parseFloat(e.target.value));
        });

        // Simulation controls
        document.getElementById('generate-maze').addEventListener('click', () => {
            this.generateNewMaze();
        });

        document.getElementById('reset-ball').addEventListener('click', () => {
            this.resetBall();
        });

        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.beatDetector.setSensitivity(parseFloat(e.target.value));
        });
    }

    /**
     * Load demo audio
     */
    async loadDemo() {
        const button = document.getElementById('play-demo');
        const originalText = button.textContent;
        button.textContent = '🎵 Loading Demo...';
        button.disabled = true;

        try {
            await this.audioManager.createDemoAudio();
            button.textContent = '✅ Demo Ready!';
            document.getElementById('audio-controls').style.display = 'flex';

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);

            // Auto-play demo
            setTimeout(() => {
                this.audioManager.play();
                document.getElementById('play-pause').textContent = '⏸️ Pause';
            }, 500);
        } catch (error) {
            button.textContent = '❌ Error';
            button.disabled = false;
            this.showError(error.message);
            console.error(error);
        }
    }

    /**
     * Load audio from YouTube (placeholder for now)
     */
    async loadYouTube(url) {
        const button = document.getElementById('load-youtube');
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;

        try {
            // For now, load demo audio as YouTube extraction requires backend
            console.log('YouTube URL:', url);
            await this.audioManager.createDemoAudio();

            button.textContent = '✅ Loaded!';
            document.getElementById('audio-controls').style.display = 'flex';
            this.showError('YouTube extraction not yet implemented. Playing demo audio instead.', 'info');

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        } catch (error) {
            button.textContent = '❌ Error';
            button.disabled = false;
            this.showError(error.message);
            console.error(error);
        }
    }

    /**
     * Load audio from file
     */
    async loadFile(file) {
        const button = document.getElementById('load-file');
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;

        try {
            await this.audioManager.loadFromFile(file);

            button.textContent = '✅ Loaded!';
            document.getElementById('audio-controls').style.display = 'flex';

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        } catch (error) {
            button.textContent = '❌ Error';
            button.disabled = false;
            this.showError(error.message);
            console.error(error);
        }
    }

    /**
     * Toggle playback
     */
    togglePlayback() {
        const button = document.getElementById('play-pause');

        if (this.audioManager.isPlaying) {
            this.audioManager.pause();
            button.textContent = '▶️ Play';
        } else {
            const success = this.audioManager.play();
            if (success) {
                button.textContent = '⏸️ Pause';
            }
        }
    }

    /**
     * Restart audio
     */
    restartAudio() {
        this.audioManager.restart();
        document.getElementById('play-pause').textContent = '⏸️ Pause';
        this.beatDetector.reset();
    }

    /**
     * Generate a new maze
     */
    generateNewMaze() {
        const newMaze = this.mazeGenerator.generate();
        this.physicsEngine.setMaze(newMaze);
        this.particleSystem.clear();
    }

    /**
     * Reset ball position
     */
    resetBall() {
        this.physicsEngine.resetBall();
        this.particleSystem.clear();
    }

    /**
     * Show error message to user
     */
    showError(message, type = 'error') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message); // Simple alert for now, could be improved with a nicer UI
    }

    /**
     * Main animation loop
     */
    animate() {
        // Get frequency data if audio is playing
        const frequencyData = this.audioManager.isPlaying
            ? this.audioManager.getFrequencyData()
            : null;

        // Detect beats
        const beatDetected = this.audioManager.isPlaying &&
            this.beatDetector.detectBeat(frequencyData);

        // Handle beat events
        if (beatDetected) {
            const ball = this.physicsEngine.getBall();
            const force = 5 * this.beatDetector.sensitivity;

            // Apply force to ball
            this.physicsEngine.applyBeatForce(force);

            // Create particle burst
            const color = this.renderer.getBallColor();
            this.particleSystem.createBurst(ball.x, ball.y, color);

            // Change ball color and pulse glow
            this.renderer.changeBallColor();
            this.renderer.pulseGlow();
        }

        // Update physics
        this.physicsEngine.update();

        // Update particles
        this.particleSystem.update();

        // Add trail point
        const ball = this.physicsEngine.getBall();
        this.particleSystem.addTrailPoint(ball.x, ball.y);

        // Render frame
        this.renderer.render(
            this.mazeGenerator.getMaze(),
            ball,
            this.particleSystem.getTrail(),
            this.particleSystem.getParticles()
        );

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Start animation loop
     */
    startAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    /**
     * Stop animation loop
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopAnimation();
        this.audioManager.dispose();
    }
}
