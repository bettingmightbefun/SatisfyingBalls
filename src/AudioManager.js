/**
 * AudioManager - Handles all audio-related functionality
 * - Audio context initialization
 * - Loading audio from various sources
 * - Playback control
 * - Volume management
 */
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.source = null;
        this.gainNode = null;
        this.analyser = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
    }

    /**
     * Initialize the audio context and analyser
     */
    async initialize() {
        if (this.audioContext) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create analyser for frequency analysis
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 0.7;

            // Connect: source -> gainNode -> analyser -> destination
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            console.log('AudioManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AudioManager:', error);
            throw new Error('Audio context initialization failed. Please check browser compatibility.');
        }
    }

    /**
     * Load audio from a file
     */
    async loadFromFile(file) {
        await this.initialize();

        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log('Audio file loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load audio file:', error);
            throw new Error('Failed to decode audio file. Please ensure it\'s a valid audio format.');
        }
    }

    /**
     * Create a demo audio buffer with beats
     */
    async createDemoAudio() {
        await this.initialize();

        try {
            const sampleRate = this.audioContext.sampleRate;
            const duration = 30; // 30 seconds
            const frameCount = sampleRate * duration;

            this.audioBuffer = this.audioContext.createBuffer(2, frameCount, sampleRate);

            // Create different sections with varying intensity
            const sections = [
                { start: 0, end: 8, bpm: 120, intensity: 0.6 },
                { start: 8, end: 16, bpm: 140, intensity: 0.9 },
                { start: 16, end: 24, bpm: 160, intensity: 1.0 },
                { start: 24, end: 30, bpm: 130, intensity: 0.7 }
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
                    const beatStrength = Math.max(0, 1 - (beatPosition / (beatInterval * 0.15)));

                    // Kick drum (low frequency pulse on each beat)
                    if (beatStrength > 0.1) {
                        const kickFreq = 50 + (beatStrength * 30);
                        sample += Math.sin(time * kickFreq * Math.PI * 2) * beatStrength * 0.5 * currentSection.intensity;
                    }

                    // Snare on 2nd and 4th beats
                    const measurePosition = ((time - currentSection.start) % (beatInterval * 4)) / (beatInterval * 4);
                    if ((measurePosition > 0.23 && measurePosition < 0.27) || (measurePosition > 0.73 && measurePosition < 0.77)) {
                        const noise = (Math.random() - 0.5) * 2;
                        sample += noise * 0.25 * currentSection.intensity;
                    }

                    // Bass line
                    const bassNotes = [55, 55, 65, 73]; // E, E, F#, G
                    const bassIndex = Math.floor((time - currentSection.start) / beatInterval) % bassNotes.length;
                    sample += Math.sin(time * bassNotes[bassIndex] * Math.PI * 2) * 0.2 * currentSection.intensity;

                    // Hi-hat (continuous high frequency)
                    if (Math.random() > 0.85) {
                        sample += (Math.random() - 0.5) * 0.1 * currentSection.intensity;
                    }

                    // Prevent clipping
                    sample = Math.max(-0.9, Math.min(0.9, sample));

                    channelData[i] = sample;
                }
            }

            console.log('Demo audio created successfully');
            return true;
        } catch (error) {
            console.error('Failed to create demo audio:', error);
            throw new Error('Failed to create demo audio.');
        }
    }

    /**
     * Play the loaded audio
     */
    play() {
        if (!this.audioBuffer) {
            console.warn('No audio buffer loaded');
            return false;
        }

        try {
            // Stop existing source if any
            this.stop();

            // Create new source
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;
            this.source.connect(this.gainNode);

            // Start playback from pause time or beginning
            const offset = this.pauseTime || 0;
            this.source.start(0, offset);
            this.startTime = this.audioContext.currentTime - offset;
            this.isPlaying = true;

            // Handle when audio ends
            this.source.onended = () => {
                if (this.isPlaying) {
                    this.isPlaying = false;
                    this.pauseTime = 0;
                }
            };

            return true;
        } catch (error) {
            console.error('Failed to play audio:', error);
            return false;
        }
    }

    /**
     * Pause the audio
     */
    pause() {
        if (!this.isPlaying || !this.source) return false;

        try {
            this.pauseTime = this.audioContext.currentTime - this.startTime;
            this.source.stop();
            this.isPlaying = false;
            return true;
        } catch (error) {
            console.error('Failed to pause audio:', error);
            return false;
        }
    }

    /**
     * Stop the audio completely
     */
    stop() {
        if (this.source) {
            try {
                this.source.stop();
                this.source.disconnect();
            } catch (error) {
                // Source might already be stopped
            }
            this.source = null;
        }
        this.isPlaying = false;
        this.pauseTime = 0;
    }

    /**
     * Restart the audio from the beginning
     */
    restart() {
        this.stop();
        this.pauseTime = 0;
        return this.play();
    }

    /**
     * Set the volume (0.0 to 1.0)
     */
    setVolume(value) {
        if (this.gainNode) {
            this.gainNode.gain.value = Math.max(0, Math.min(1, value));
        }
    }

    /**
     * Get frequency data for analysis
     */
    getFrequencyData() {
        if (!this.analyser) return null;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        return dataArray;
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
