/**
 * Main entry point for the SatisfyingBalls application
 */
import { App } from './App.js';

// Initialize the application when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.dispose();
    }
});
