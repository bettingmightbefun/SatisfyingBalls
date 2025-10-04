# 🎵 SatisfyingBalls

Transform your music into mesmerizing ball physics simulations! Upload audio files or paste YouTube links to see a ball bounce through procedurally generated mazes in perfect rhythm with your music.

## ✨ Features

- **Audio Input**: Support for YouTube URLs and direct audio file uploads
- **Beat Detection**: Real-time audio analysis to detect beats and rhythm
- **Physics Simulation**: Realistic ball physics with collision detection
- **Procedural Mazes**: Randomly generated maze layouts for each session
- **Visual Effects**: Satisfying particle effects, glowing trails, and dynamic lighting
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bettingmightbefun/SatisfyingBalls.git
   cd SatisfyingBalls
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## 🎮 How to Use

1. **Try the Demo**: Click "🎵 Play Demo Audio" to experience the built-in demo track
2. **Upload Your Own**: Use the file upload or paste a YouTube URL
3. **Adjust Settings**: Use the sensitivity slider to fine-tune beat detection
4. **Generate New Mazes**: Click "🌀 New Maze" for fresh challenges
5. **Control Playback**: Use play/pause and volume controls

## 🛠️ Technical Details

- **Frontend**: Vanilla HTML5, CSS3, and ES6+ JavaScript
- **Audio Processing**: Web Audio API for real-time frequency analysis
- **Physics Engine**: Custom physics simulation with collision detection
- **Visualization**: HTML5 Canvas with advanced rendering techniques

## 🎯 Beat Detection Algorithm

The application uses frequency domain analysis to detect beats:
- Analyzes low-frequency content (bass range) for beat detection
- Maintains a rolling average to identify significant energy spikes
- Adjustable sensitivity for different music genres and styles

## 🏗️ Architecture

```
SatisfyingBalls/
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive design
├── script.js           # Core application logic
├── package.json        # Project configuration
└── README.md          # This file
```

## 🎨 Visual Effects

- **Ball Trails**: Semi-transparent trail showing ball movement history
- **Beat Particles**: Colorful particles that burst out on each beat
- **Dynamic Glow**: Ball glows brighter during intense beats
- **Color Cycling**: Ball changes color with each detected beat
- **Gradient Backgrounds**: Dynamic canvas backgrounds

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

*Requires Web Audio API support*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎵 Future Enhancements

- [ ] YouTube audio extraction (requires backend service)
- [ ] Multiple ball support
- [ ] Different maze algorithms (DFS, Prim's, etc.)
- [ ] Audio waveform visualization
- [ ] Export animation as GIF/video
- [ ] Mobile app version

---

**Made with ❤️ for music lovers and physics enthusiasts**
