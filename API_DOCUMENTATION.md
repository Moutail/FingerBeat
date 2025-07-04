# 📚 API Documentation - Finger Beat Ultimate

## Game Configuration API

### Core Settings
\`\`\`javascript
window.game.settings = {
  musicVolume: 0.7,        // 0.0 - 1.0
  sfxEnabled: true,        // boolean
  metronomeEnabled: true,  // boolean
  particlesEnabled: true,  // boolean
  screenShakeEnabled: true,// boolean
  vibrationEnabled: true,  // boolean
  difficulty: 'normal',    // 'easy'|'normal'|'hard'|'expert'
  autoSave: true,         // boolean
  theme: 'viral'          // theme identifier
}
\`\`\`

### Game State Management
\`\`\`javascript
// Start new game
window.game.startGame()

// Pause/Resume
window.game.pauseGame()
window.game.resumeGame()

// Restart current game
window.game.restartGame()

// Return to main menu
window.game.quitToMenu()

// Get current game state
const state = window.game.gameState
\`\`\`

### Audio System API
\`\`\`javascript
// Load custom track
window.game.selectTrack('trackId')

// Generate procedural audio
window.game.selectGenre('viral') // 'viral'|'hype'|'chill'

// Load custom audio file
window.game.handleCustomAudio(fileInputEvent)

// Audio controls
window.game.setVolume(0.8)        // 0.0 - 1.0
window.game.toggleMetronome()
window.game.toggleSFX()
\`\`\`

### Statistics API
\`\`\`javascript
// Get player statistics
const stats = window.game.stats
// Returns: {
//   totalScore: number,
//   gamesPlayed: number,
//   bestCombo: number,
//   totalTime: number,     // in seconds
//   totalHits: number,
//   correctHits: number,
//   perfectGames: number,
//   highScores: Array
// }

// Update statistics
window.game.updateStatisticsDisplay()

// Export statistics
window.game.exportGameData()

// Reset all data
window.game.resetGameData()
\`\`\`

### Achievement System
\`\`\`javascript
// Check achievements
window.game.checkAchievements()

// Get achievement status
const achievements = window.game.achievements
// Returns: {
//   firstSteps: boolean,
//   combo10: boolean,
//   level5: boolean,
//   perfect: boolean,
//   score10k: boolean
// }

// Unlock specific achievement
window.game.unlockAchievement('achievementId')
\`\`\`

### Theme System API
\`\`\`javascript
// Change theme
window.game.selectTheme('themeId')

// Available themes
const themes = [
  'viral',    // Phonk style
  'hype',     // EDM style  
  'chill',    // Trap style
  'neon',     // Cyberpunk style
  'sunset',   // Warm colors
  'custom'    // User defined
]

// Add custom theme
window.game.addCustomTheme({
  id: 'mytheme',
  name: 'My Theme',
  primaryColor: '#ff0000',
  secondaryColor: '#00ff00',
  backgroundColor: '#000000'
})
\`\`\`

### Level System API
\`\`\`javascript
// Get current level info
const level = window.game.gameState.level
const goals = window.game.levelGoals[level]

// Skip to specific level (debug only)
window.game.setLevel(5)

// Get level progression
const progress = window.game.targetsHitInLevel
const required = window.game.levelGoals[level].targetsToHit
\`\`\`

### Input System API
\`\`\`javascript
// Simulate input (for testing)
window.game.handleInput(1) // 1-5

// Get input timing
const timing = window.game.getInputTiming()

// Enable/disable input
window.game.setInputEnabled(true)
\`\`\`

### Save System API
\`\`\`javascript
// Manual save
window.game.saveGameData()

// Load saved data
window.game.loadGameData()

// Get save data object
const saveData = window.game.getSaveData()

// Import save data
window.game.importSaveData(dataObject)

// Auto-save settings
window.game.settings.autoSave = false // Disable auto-save
\`\`\`

## Event System

### Game Events
\`\`\`javascript
// Listen for game events
document.addEventListener('gameStateChange', (event) => {
  console.log('Game state:', event.detail.state)
})

document.addEventListener('scoreUpdate', (event) => {
  console.log('New score:', event.detail.score)
})

document.addEventListener('levelComplete', (event) => {
  console.log('Level completed:', event.detail.level)
})

document.addEventListener('achievementUnlocked', (event) => {
  console.log('Achievement:', event.detail.achievement)
})
\`\`\`

### Audio Events
\`\`\`javascript
document.addEventListener('audioLoaded', (event) => {
  console.log('Audio ready:', event.detail.source)
})

document.addEventListener('beatDetected', (event) => {
  console.log('Beat at:', event.detail.time)
})
\`\`\`

## Customization Hooks

### UI Customization
\`\`\`javascript
// Override button styles
window.game.customizeButton = (button, type) => {
  if (type === 'correct') {
    button.style.background = 'your-color'
  }
}

// Custom score display
window.game.customScoreFormat = (score) => {
  return score.toLocaleString() + ' pts'
}
\`\`\`

### Audio Customization
\`\`\`javascript
// Custom audio generation
window.game.customAudioGenerator = (genre, time, beatPosition) => {
  // Return audio sample value
  return Math.sin(time * frequency)
}

// Custom beat detection
window.game.customBeatDetector = (audioData) => {
  // Return BPM value
  return detectedBPM
}
\`\`\`

### Scoring Customization
\`\`\`javascript
// Custom scoring algorithm
window.game.customScoring = (baseScore, combo, level, timing) => {
  return baseScore * (1 + combo * 0.1) * level
}
\`\`\`

## Plugin System

### Creating Plugins
\`\`\`javascript
class FingerBeatPlugin {
  constructor(game) {
    this.game = game
    this.init()
  }
  
  init() {
    // Plugin initialization
  }
  
  onGameStart() {
    // Called when game starts
  }
  
  onScoreUpdate(score) {
    // Called on score changes
  }
}

// Register plugin
window.game.registerPlugin(new FingerBeatPlugin(window.game))
\`\`\`

### Available Plugin Hooks
- \`onGameStart()\`
- \`onGameEnd()\`
- \`onLevelComplete()\`
- \`onScoreUpdate(score)\`
- \`onComboUpdate(combo)\`
- \`onInput(number, timing)\`
- \`onBeatDetected(time)\`

## Advanced Configuration

### Performance Tuning
\`\`\`javascript
window.game.performanceConfig = {
  targetFPS: 60,
  audioBufferSize: 2048,
  particleCount: 50,
  enableWebGL: true,
  useDedicatedWorker: true
}
\`\`\`

### Debug Mode
\`\`\`javascript
// Enable debug features
window.game.debug = true

// Debug functions
window.game.debugSetScore(10000)
window.game.debugSetLevel(5)
window.game.debugShowFPS(true)
window.game.debugLogAudio(true)
\`\`\`

### Analytics Integration
\`\`\`javascript
// Custom analytics
window.game.analytics = {
  trackEvent: (category, action, label) => {
    // Your analytics code
    gtag('event', action, {
      event_category: category,
      event_label: label
    })
  }
}
\`\`\`