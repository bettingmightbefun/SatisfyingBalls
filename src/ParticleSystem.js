/**
 * ParticleSystem - Manages visual particle effects
 */
export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.trail = [];
        this.maxTrailLength = 15;
    }

    /**
     * Create burst particles (e.g., on beat)
     */
    createBurst(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 3 + Math.random() * 4;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 1,
                color,
                size: 2 + Math.random() * 3
            });
        }
    }

    /**
     * Add a point to the trail
     */
    addTrailPoint(x, y) {
        this.trail.push({ x, y, alpha: 1 });

        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }

    /**
     * Update all particles
     */
    update() {
        // Update burst particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life -= 0.02;
            particle.vx *= 0.98; // air resistance
            particle.vy *= 0.98;

            return particle.life > 0;
        });

        // Update trail alpha
        this.trail.forEach((point, index) => {
            point.alpha = index / this.trail.length;
        });
    }

    /**
     * Get all particles
     */
    getParticles() {
        return this.particles;
    }

    /**
     * Get trail points
     */
    getTrail() {
        return this.trail;
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.trail = [];
    }
}
