/**
 * Renderer - Handles all canvas drawing operations
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 30;
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
        this.currentBallColor = this.colors[0];
        this.glowIntensity = 0;
    }

    /**
     * Clear the canvas with a gradient background
     */
    clearCanvas() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f0f23');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Draw the maze
     */
    drawMaze(maze) {
        if (!maze || maze.length === 0) return;

        this.ctx.shadowColor = '#333';
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = '#2a2a3a';

        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 1) {
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }

        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw trail
     */
    drawTrail(trail, ballRadius) {
        trail.forEach((point) => {
            const alpha = point.alpha * 0.5;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, ballRadius * (0.3 + alpha * 0.7), 0, Math.PI * 2);
            this.ctx.fillStyle = this.currentBallColor;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw particles
     */
    drawParticles(particles) {
        particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw the ball with glow effect
     */
    drawBall(ball) {
        const glowAmount = 10 + this.glowIntensity * 30;
        this.ctx.shadowColor = this.currentBallColor;
        this.ctx.shadowBlur = glowAmount;

        // Outer glow ring
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius + glowAmount * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.currentBallColor;
        this.ctx.globalAlpha = 0.3;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;

        // Main ball
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.currentBallColor;
        this.ctx.fill();

        // Inner highlight for 3D effect
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.arc(ball.x - 3, ball.y - 3, ball.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();
    }

    /**
     * Set ball color (on beat change)
     */
    changeBallColor() {
        this.currentBallColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    /**
     * Get current ball color
     */
    getBallColor() {
        return this.currentBallColor;
    }

    /**
     * Set glow intensity (0 to 1)
     */
    setGlowIntensity(intensity) {
        this.glowIntensity = Math.max(0, Math.min(1, intensity));
    }

    /**
     * Reduce glow over time
     */
    updateGlow() {
        this.glowIntensity *= 0.95;
    }

    /**
     * Increase glow (on beat)
     */
    pulseGlow() {
        this.glowIntensity = 1;
    }

    /**
     * Render a complete frame
     */
    render(maze, ball, trail, particles) {
        this.clearCanvas();
        this.drawMaze(maze);
        this.drawTrail(trail, ball.radius);
        this.drawParticles(particles);
        this.drawBall(ball);
        this.updateGlow();
    }
}
