/**
 * BeatDetector - Analyzes audio frequency data to detect beats
 * Uses energy-based beat detection algorithm
 */
export class BeatDetector {
    constructor(sensitivity = 1.0) {
        this.sensitivity = sensitivity;
        this.beatHistory = [];
        this.historySize = 10;
        this.baseThreshold = 1.3;
        this.lastBeatTime = 0;
        this.minTimeBetweenBeats = 200; // milliseconds
    }

    /**
     * Update sensitivity (0.1 to 2.0)
     */
    setSensitivity(value) {
        this.sensitivity = Math.max(0.1, Math.min(2.0, value));
    }

    /**
     * Detect if a beat occurred based on frequency data
     * @param {Uint8Array} frequencyData - Frequency data from analyser
     * @returns {boolean} True if beat detected
     */
    detectBeat(frequencyData) {
        if (!frequencyData) return false;

        const now = Date.now();

        // Prevent detecting beats too frequently
        if (now - this.lastBeatTime < this.minTimeBetweenBeats) {
            return false;
        }

        // Calculate average energy in low frequencies (bass range)
        const bassRange = Math.floor(frequencyData.length * 0.1); // First 10% of frequencies
        let sum = 0;

        for (let i = 0; i < bassRange; i++) {
            sum += frequencyData[i];
        }

        const average = sum / bassRange;

        // Keep history for beat detection
        this.beatHistory.push(average);
        if (this.beatHistory.length > this.historySize) {
            this.beatHistory.shift();
        }

        // Need enough history to detect beats
        if (this.beatHistory.length < this.historySize / 2) {
            return false;
        }

        // Calculate historical average
        const historyAvg = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;

        // Detect beat if current energy is significantly higher than average
        const threshold = this.baseThreshold * this.sensitivity;
        const beatDetected = average > historyAvg * threshold && average > 50; // Minimum energy threshold

        if (beatDetected) {
            this.lastBeatTime = now;
        }

        return beatDetected;
    }

    /**
     * Get the current beat strength (0.0 to 1.0)
     */
    getBeatStrength(frequencyData) {
        if (!frequencyData) return 0;

        const bassRange = Math.floor(frequencyData.length * 0.1);
        let sum = 0;

        for (let i = 0; i < bassRange; i++) {
            sum += frequencyData[i];
        }

        const average = sum / bassRange;
        const normalized = Math.min(1.0, average / 255);

        return normalized;
    }

    /**
     * Reset the beat detection history
     */
    reset() {
        this.beatHistory = [];
        this.lastBeatTime = 0;
    }
}
