/**
 * MazeGenerator - Generates procedural mazes with guaranteed pathways
 * Uses recursive backtracking algorithm
 */
export class MazeGenerator {
    constructor(width = 20, height = 15) {
        this.width = width;
        this.height = height;
        this.maze = [];
    }

    /**
     * Generate a new maze
     * @returns {Array<Array<number>>} 2D array where 1 = wall, 0 = empty
     */
    generate() {
        // Initialize maze with all walls
        this.maze = [];
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = 1; // Start with all walls
            }
        }

        // Create paths using recursive backtracking
        const visited = new Set();
        this.carvePassages(1, 1, visited);

        // Ensure borders are walls
        for (let x = 0; x < this.width; x++) {
            this.maze[0][x] = 1;
            this.maze[this.height - 1][x] = 1;
        }
        for (let y = 0; y < this.height; y++) {
            this.maze[y][0] = 1;
            this.maze[y][this.width - 1] = 1;
        }

        // Ensure start and end positions are clear
        this.maze[1][1] = 0;
        this.maze[this.height - 2][this.width - 2] = 0;

        // Add some openings to make it more interesting
        this.addRandomOpenings();

        return this.maze;
    }

    /**
     * Recursive backtracking algorithm to carve passages
     */
    carvePassages(x, y, visited) {
        const key = `${x},${y}`;
        visited.add(key);
        this.maze[y][x] = 0;

        // Directions: right, down, left, up
        const directions = [
            [2, 0],  // right
            [0, 2],  // down
            [-2, 0], // left
            [0, -2]  // up
        ];

        // Shuffle directions for randomness
        this.shuffleArray(directions);

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            const betweenX = x + dx / 2;
            const betweenY = y + dy / 2;

            // Check if the new position is valid and unvisited
            if (
                nx > 0 && nx < this.width - 1 &&
                ny > 0 && ny < this.height - 1 &&
                !visited.has(`${nx},${ny}`)
            ) {
                // Carve path between current and next cell
                this.maze[betweenY][betweenX] = 0;
                this.carvePassages(nx, ny, visited);
            }
        }
    }

    /**
     * Add some random openings to make the maze less dense
     */
    addRandomOpenings() {
        const openingsCount = Math.floor((this.width * this.height) * 0.05); // 5% openings

        for (let i = 0; i < openingsCount; i++) {
            const x = Math.floor(Math.random() * (this.width - 2)) + 1;
            const y = Math.floor(Math.random() * (this.height - 2)) + 1;

            // Only open if it has walls around it (don't create too open spaces)
            const wallCount = this.countAdjacentWalls(x, y);
            if (wallCount >= 2) {
                this.maze[y][x] = 0;
            }
        }
    }

    /**
     * Count adjacent walls for a given position
     */
    countAdjacentWalls(x, y) {
        let count = 0;
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (
                nx >= 0 && nx < this.width &&
                ny >= 0 && ny < this.height &&
                this.maze[ny][nx] === 1
            ) {
                count++;
            }
        }

        return count;
    }

    /**
     * Fisher-Yates shuffle algorithm
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Get the current maze
     */
    getMaze() {
        return this.maze;
    }

    /**
     * Get maze dimensions
     */
    getDimensions() {
        return { width: this.width, height: this.height };
    }
}
