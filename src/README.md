# SatisfyingBalls - Source Code Architecture

This directory contains the modularized source code for the SatisfyingBalls application.

## Module Overview

### 🎵 **AudioManager.js**
Handles all audio-related functionality:
- Audio context initialization
- Loading audio from files
- Creating demo audio
- Playback control (play, pause, stop, restart)
- Volume management via GainNode
- Frequency data extraction for beat detection

**Key Fix**: Uses `GainNode` for volume control instead of the non-existent `BufferSource.volume` property.

### 🎯 **BeatDetector.js**
Analyzes audio frequency data to detect beats:
- Energy-based beat detection algorithm
- Analyzes low-frequency (bass) content
- Maintains rolling history for comparison
- Configurable sensitivity
- Prevents rapid false positives with timing constraints

**Key Fix**: Only analyzes when audio is actually playing, preventing phantom beat detection.

### 🏗️ **MazeGenerator.js**
Generates procedural mazes with guaranteed pathways:
- Recursive backtracking algorithm
- Ensures borders are walls
- Adds random openings for variety
- Guarantees valid start and end positions
- Fisher-Yates shuffle for randomness

**Key Fix**: Generates proper connected mazes instead of random wall placement.

### ⚙️ **PhysicsEngine.js**
Handles ball physics and collision detection:
- Gravity and friction simulation
- Beat-based force application
- Maze wall collision detection
- Canvas boundary collision
- Improved collision resolution (prevents ball getting stuck)

**Key Improvement**: Better collision detection using minimum overlap calculation.

### ✨ **ParticleSystem.js**
Manages visual particle effects:
- Burst particles on beats
- Trail system for ball movement
- Particle lifecycle management
- Gravity and air resistance for particles

### 🎨 **Renderer.js**
Handles all canvas drawing operations:
- Gradient backgrounds
- Maze rendering
- Ball rendering with glow effects
- Trail rendering
- Particle rendering
- Dynamic color changes

### 🚀 **App.js**
Main application coordinator:
- Initializes all modules
- Sets up event listeners
- Coordinates module interactions
- Main animation loop
- Error handling and user feedback

### 📍 **main.js**
Entry point for the application:
- Initializes App when DOM is ready
- Cleanup on page unload
- Exposes app instance on window for debugging

## Architecture Benefits

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Testability**: Modules can be tested independently
3. **Maintainability**: Easy to locate and fix bugs
4. **Extensibility**: Easy to add new features without affecting other modules
5. **Readability**: Clear structure and documentation

## Module Dependencies

```
main.js
  └── App.js
       ├── AudioManager.js
       ├── BeatDetector.js
       ├── MazeGenerator.js
       ├── PhysicsEngine.js
       ├── ParticleSystem.js
       └── Renderer.js
```

## Key Improvements Over Original Code

1. ✅ **Fixed Volume Control**: Now uses proper GainNode instead of non-existent property
2. ✅ **Fixed Beat Detection**: Only analyzes when audio is playing
3. ✅ **Better Maze Generation**: Proper recursive backtracking with guaranteed paths
4. ✅ **Improved Collision Detection**: Better handling prevents ball getting stuck
5. ✅ **Error Handling**: Proper try-catch blocks with user feedback
6. ✅ **Code Organization**: ~600 lines split into 7 focused modules
7. ✅ **Documentation**: JSDoc comments throughout
8. ✅ **ES6 Modules**: Proper import/export structure

## Usage

The modules are loaded as ES6 modules. The browser loads `main.js`, which imports and initializes `App.js`, which in turn imports all other modules as needed.

## Future Enhancements

Potential areas for expansion:
- Multiple ball support (modify PhysicsEngine)
- Different maze algorithms (extend MazeGenerator)
- YouTube audio extraction (extend AudioManager with backend)
- Audio waveform visualization (new Visualizer module)
- Recording/exporting animations (new Recorder module)
