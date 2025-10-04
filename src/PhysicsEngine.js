/**
 * PhysicsEngine - Handles ball physics and collision detection
 */
export class PhysicsEngine {
    constructor(maze, canvasWidth, canvasHeight) {
        this.maze = maze;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.cellSize = 30;
        
        this.ball = {
            x: 50,
            y: 50,
            vx: 0,
            vy: 0,
            radius: 12,
            mass: 1
        };

        // Physics constants
        this.gravity = 0.3;
        this.friction = 0.99;
        this.wallBounce = 0.8; // Energy retention after wall collision
    }

    /**
     * Update maze reference
     */
    setMaze(maze) {
        this.maze = maze;
    }

    /**
     * Reset ball to starting position
     */
    resetBall() {
        this.ball.x = 50;
        this.ball.y = 50;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    /**
     * Apply a force to the ball (e.g., from a beat)
     */
    applyBeatForce(force, direction = null) {
        if (direction === null) {
            // Random direction if not specified
            direction = Math.random() * Math.PI * 2;
        }

        this.ball.vx += Math.cos(direction) * force;
        this.ball.vy += Math.sin(direction) * force;
    }

    /**
     * Update ball physics
     */
    update() {
        // Apply gravity
        this.ball.vy += this.gravity;

        // Apply friction
        this.ball.vx *= this.friction;
        this.ball.vy *= this.friction;

        // Update position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Collision detection with maze walls
        this.handleMazeCollisions();

        // Collision detection with canvas edges
        this.handleCanvasCollisions();
    }

    /**
     * Handle collisions with maze walls
     */
    handleMazeCollisions() {
        if (!this.maze || this.maze.length === 0) return;

        const ballGridX = Math.floor(this.ball.x / this.cellSize);
        const ballGridY = Math.floor(this.ball.y / this.cellSize);

        // Check surrounding cells for collisions
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = ballGridX + dx;
                const checkY = ballGridY + dy;

                if (
                    checkX >= 0 && checkX < 20 &&
                    checkY >= 0 && checkY < 15 &&
                    this.maze[checkY] && this.maze[checkY][checkX] === 1
                ) {
                    this.handleWallCollision(checkX, checkY);
                }
            }
        }
    }

    /**
     * Handle collision with a specific wall cell
     */
    handleWallCollision(cellX, cellY) {
        const wallLeft = cellX * this.cellSize;
        const wallRight = (cellX + 1) * this.cellSize;
        const wallTop = cellY * this.cellSize;
        const wallBottom = (cellY + 1) * this.cellSize;

        // Check if ball overlaps with this wall
        if (
            this.ball.x + this.ball.radius > wallLeft &&
            this.ball.x - this.ball.radius < wallRight &&
            this.ball.y + this.ball.radius > wallTop &&
            this.ball.y - this.ball.radius < wallBottom
        ) {
            // Calculate overlaps
            const overlapLeft = this.ball.x + this.ball.radius - wallLeft;
            const overlapRight = wallRight - (this.ball.x - this.ball.radius);
            const overlapTop = this.ball.y + this.ball.radius - wallTop;
            const overlapBottom = wallBottom - (this.ball.y - this.ball.radius);

            // Find minimum overlap
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
                // Horizontal collision
                if (overlapLeft < overlapRight) {
                    this.ball.x = wallLeft - this.ball.radius - 0.1;
                } else {
                    this.ball.x = wallRight + this.ball.radius + 0.1;
                }
                this.ball.vx *= -this.wallBounce;
            } else {
                // Vertical collision
                if (overlapTop < overlapBottom) {
                    this.ball.y = wallTop - this.ball.radius - 0.1;
                } else {
                    this.ball.y = wallBottom + this.ball.radius + 0.1;
                }
                this.ball.vy *= -this.wallBounce;
            }
        }
    }

    /**
     * Handle collisions with canvas boundaries
     */
    handleCanvasCollisions() {
        // Left edge
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -this.wallBounce;
        }

        // Right edge
        if (this.ball.x + this.ball.radius > this.canvasWidth) {
            this.ball.x = this.canvasWidth - this.ball.radius;
            this.ball.vx *= -this.wallBounce;
        }

        // Top edge
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -this.wallBounce;
        }

        // Bottom edge
        if (this.ball.y + this.ball.radius > this.canvasHeight) {
            this.ball.y = this.canvasHeight - this.ball.radius;
            this.ball.vy *= -this.wallBounce;
        }
    }

    /**
     * Get current ball state
     */
    getBall() {
        return this.ball;
    }

    /**
     * Get ball velocity magnitude
     */
    getVelocityMagnitude() {
        return Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
    }
}
