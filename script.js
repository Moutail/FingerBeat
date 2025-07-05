class FingerBeatGame {
           constructor() {
            this.initializeGame();
            this.setupEventListeners();
            this.hideLoadingScreen();
            
            // Précharger tous les fichiers audio en arrière-plan
            this.preloadAudioFiles();
            
            // Générer l'audio synthétique immédiatement pour avoir du son
            this.generateGenreAudio('viral');
            
            // Essayer de charger Arcade après un court délai
            setTimeout(() => {
                this.selectTrack('arcade').catch(() => {
                    console.log('Arcade pas encore prête, utilisation de l\'audio généré');
                });
            }, 2000);
        }

           initializeGame() {
               this.audioContext = null;
               this.audioSource = null;
               this.audioBuffer = null;
               this.currentGenre = 'viral';
               this.currentTrack = null;
               this.isLoadingAudio = false;
               this.metronomeInterval = null;
               this.nextBeatTime = 0;
               this.beatIndex = 0;
               this.gainNode = null;

                this.tutorialMode = true;
                this.tutorialStep = 0;
                this.levelGoals = {
                    1: { targetsToHit: 5, description: "Apprenez les bases - Tapez 5 nombres correctement" },
                    2: { targetsToHit: 10, description: "Prenez le rythme - Tapez 10 nombres sans erreur" },
                    3: { targetsToHit: 15, description: "Accélérez - Le timer devient plus rapide" },
                    4: { targetsToHit: 20, description: "Mode Combo - Construisez des combos pour plus de points" },
                    5: { targetsToHit: 25, description: "Mode Expert - Vitesse maximale activée" }
                };
                this.targetsHitInLevel = 0;
                        
                this.gameState = {
                    isPlaying: false,
                    isPaused: false,
                    score: 0,
                    level: 1,
                    lives: 3,
                    combo: 0,
                    maxCombo: 0,
                    currentTarget: 3,
                    timeRemaining: 100,
                    maxTime: 100,
                    speedMultiplier: 1,
                    startTime: 0,
                    totalHits: 0,
                    correctHits: 0
                };


               this.genres = {
                   viral: { bpm: 140, name: 'Viral Phonk' },
                   hype: { bpm: 128, name: 'EDM Hype' },
                   chill: { bpm: 85, name: 'Chill Trap' },
                   custom: { bpm: 120, name: 'Custom Audio' }
               };

               // Predefined tracks info
                this.tracks = {
                    arcade: { 
                        name: 'Love is Gone - SLANDER',
                        file: 'audio/SLANDER_Love_is_Gone.mp3',
                        bpm: 72
                    },
                    losing_game: { 
                        name: 'A Losing Game - Duncan Laurence',
                        file: 'Duncan_Laurence_A_Losing_Game.mp3',
                        bpm: 95
                    },
                    jujutsu: { 
                        name: 'Jujutsu Kaisen OP3',
                        file: 'jujukaisenOp3.mp3',
                        bpm: 145
                    },
                    dandadan: { 
                        name: 'DAN DA DAN Opening',
                        file: 'DAN_DA_DAN_Opening.mp3',
                        bpm: 165
                    },
                    crazy: { 
                        name: 'Crazy - Electronic Pop',
                        file: 'BEAUZ_JVNA_Crazy_Electronic_Pop_NCS.mp3',
                        bpm: 128
                    }
                };

                // Settings
                this.settings = {
                    musicVolume: 0.7,
                    sfxEnabled: true,
                    metronomeEnabled: true,
                    particlesEnabled: true,
                    screenShakeEnabled: true,
                    vibrationEnabled: true,
                    difficulty: 'normal',
                    autoSave: true,
                    theme: 'viral'
                };
                // Statistics
                this.stats = {
                    totalScore: 0,
                    gamesPlayed: 0,
                    bestCombo: 0,
                    totalTime: 0,
                    totalHits: 0,
                    correctHits: 0,
                    perfectGames: 0,
                    highScores: []
                };

                // Achievements
                this.achievements = {
                    firstSteps: true,
                    combo10: false,
                    level5: false,
                    perfect: false,
                    score10k: false
                };
           }

           // Game data management
            saveGameData() {
                if (!this.settings.autoSave) return;
                
                const saveData = {
                    stats: this.stats,
                    achievements: this.achievements,
                    settings: this.settings,
                    version: '2.0',
                    timestamp: Date.now()
                };
                
                try {
                    localStorage.setItem('fingerBeat_saveData', JSON.stringify(saveData));
                } catch (error) {
                    console.warn('Could not save game data:', error);
                }
            }

            loadGameData() {
                try {
                    const savedData = localStorage.getItem('fingerBeat_saveData');
                    if (savedData) {
                        const data = JSON.parse(savedData);
                        
                        // Merge with defaults to handle version updates
                        this.stats = { ...this.stats, ...data.stats };
                        this.achievements = { ...this.achievements, ...data.achievements };
                        this.settings = { ...this.settings, ...data.settings };
                        
                        this.updateStatisticsDisplay();
                        this.applySettings();
                    }
                } catch (error) {
                    console.warn('Could not load game data:', error);
                }
            }

            // PWA Setup
            setupPWA() {
                // Service worker registration
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('sw.js').catch(console.error);
                }

                // Install prompt
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    this.deferredPrompt = e;
                    this.showInstallPrompt();
                });
            }

            showInstallPrompt() {
                // Show install button or toast
                this.showToast('📱 Install Finger Beat for the best experience!', 5000);
            }

           showToast(message, duration = 3000, type = 'info') {
            const existingToast = document.querySelector('.toast');
                if (existingToast) {
                    existingToast.remove();
                }

                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                toast.textContent = message;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.style.animation = 'toastSlide 0.3s ease-out reverse';
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            
            toast.className = 'toast-notification';
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 12px 24px;
                border-radius: 24px;
                font-size: 14px;
                z-index: 1000;
                animation: slideUp 0.3s ease-out;
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideDown 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
           // Nouvelle fonction pour afficher les objectifs de niveau
            showLevelObjective() {
                const level = this.gameState.level;
                const goal = this.levelGoals[level];
                
                if (!goal) return;
                
                // Créer l'overlay d'objectif
                const objectiveOverlay = document.createElement('div');
                objectiveOverlay.className = 'objective-overlay';
                objectiveOverlay.innerHTML = `
                    <div class="objective-card">
                        <h3>NIVEAU ${level}</h3>
                        <p class="objective-description">${goal.description}</p>
                        <div class="objective-progress">
                            <div class="progress-text">Objectif: ${goal.targetsToHit} touches correctes</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 0%"></div>
                            </div>
                        </div>
                        <button class="continue-button" id="startLevelBtn">COMMENCER</button>
                    </div>
                `;
                
                document.body.appendChild(objectiveOverlay);
                
                // Ajouter l'événement après avoir ajouté l'overlay au DOM
                document.getElementById('startLevelBtn').addEventListener('click', () => {
                    this.startLevel();
                });
            }

            // Nouvelle fonction pour démarrer un niveau
            startLevel() {
                const objectiveOverlay = document.querySelector('.objective-overlay');
                if (objectiveOverlay) {
                    objectiveOverlay.remove();
                }
                
                // Ajuster la difficulté selon le niveau
                switch(this.gameState.level) {
                    case 1:
                        // Niveau 1 : Très lent, beaucoup de temps
                        this.gameState.maxTime = 150;
                        this.gameState.speedMultiplier = 0.5;
                        break;
                    case 2:
                        // Niveau 2 : Un peu plus rapide
                        this.gameState.maxTime = 120;
                        this.gameState.speedMultiplier = 0.7;
                        break;
                    case 3:
                        // Niveau 3 : Vitesse normale
                        this.gameState.maxTime = 100;
                        this.gameState.speedMultiplier = 1;
                        break;
                    case 4:
                        // Niveau 4 : Plus rapide
                        this.gameState.maxTime = 80;
                        this.gameState.speedMultiplier = 1.2;
                        break;
                    default:
                        // Niveau 5+ : Difficulté progressive
                        this.gameState.maxTime = Math.max(40, 80 - (this.gameState.level - 4) * 10);
                        this.gameState.speedMultiplier = 1.2 + (this.gameState.level - 4) * 0.15;
                }
                
                this.targetsHitInLevel = 0;
                this.gameState.isPaused = false; // AJOUTEZ CETTE LIGNE
                this.generateNewChallenge();
                this.gameLoop();
            }

           hideLoadingScreen() {
               setTimeout(() => {
                   const loadingScreen = document.getElementById('loadingScreen');
                   loadingScreen.style.opacity = '0';
                   setTimeout(() => {
                       loadingScreen.style.display = 'none';
                   }, 500);
               }, 1500);
           }

           showLoadingIndicator(text = 'Loading...') {
               const indicator = document.getElementById('loadingIndicator');
               const loadingText = document.getElementById('loadingText');
               loadingText.textContent = text;
               indicator.classList.add('show');
           }

           hideLoadingIndicator() {
               const indicator = document.getElementById('loadingIndicator');
               indicator.classList.remove('show');
           }

           // 
            async preloadAudioFiles() {
                const tracksToPreload = ['arcade', 'losing_game', 'jujutsu', 'dandadan'];
                
                for (const trackId of tracksToPreload) {
                    const track = this.tracks[trackId];
                    if (track) {
                        // Créer un élément audio caché pour précharger
                        const audio = new Audio();
                        audio.preload = 'auto';
                        audio.src = track.file;
                        
                        // Stocker la référence pour usage futur
                        track.preloadedAudio = audio;
                    }
                }
            }

           async setupAudioContext() {
               try {
                   if (!this.audioContext) {
                       this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                   }
                   if (this.audioContext.state === 'suspended') {
                       await this.audioContext.resume();
                   }
                   return true;
               } catch (error) {
                   console.error('Audio context error:', error);
                   return false;
               }
           }

           playMetronomeBeat(isDownbeat = false) {
               if (!this.audioContext || this.audioContext.state !== 'running') return;
               
               const now = this.audioContext.currentTime;
               const oscillator = this.audioContext.createOscillator();
               const gainNode = this.audioContext.createGain();
               
               oscillator.connect(gainNode);
               gainNode.connect(this.audioContext.destination);
               
               // Different sound for downbeat vs regular beat
               if (isDownbeat) {
                   oscillator.frequency.value = 1000; // Higher pitch for downbeat
                   gainNode.gain.value = 0.15;
               } else {
                   oscillator.frequency.value = 800; // Lower pitch for regular beats
                   gainNode.gain.value = 0.1;
               }
               
               // Quick decay
               gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
               
               oscillator.start(now);
               oscillator.stop(now + 0.05);
           }

           startMetronome() {
               if (!this.audioContext) return;
               
               const bpm = this.getCurrentBPM();
               const beatInterval = 60 / bpm;
               
               // Reset beat tracking
               this.nextBeatTime = this.audioContext.currentTime;
               this.beatIndex = 0;
               
               // Clear any existing interval
               if (this.metronomeInterval) {
                   clearInterval(this.metronomeInterval);
               }
               
               // Schedule beats
               const scheduleBeats = () => {
                   const currentTime = this.audioContext.currentTime;
                   
                   // Schedule beats up to 0.1 seconds ahead
                   while (this.nextBeatTime < currentTime + 0.1) {
                       const isDownbeat = this.beatIndex % 4 === 0;
                       this.playMetronomeBeat(isDownbeat);
                       
                       // Visual feedback for beat
                       if (this.gameState.isPlaying && !this.gameState.isPaused) {
                           const beatDelay = (this.nextBeatTime - currentTime) * 1000;
                           if (beatDelay >= 0) {
                               setTimeout(() => {
                                   this.flashBeatIndicator(isDownbeat);
                                   this.updateBeatDots(this.beatIndex % 4);
                               }, beatDelay);
                           }
                       }
                       
                       this.nextBeatTime += beatInterval;
                       this.beatIndex++;
                   }
               };
               
               // Run scheduler every 25ms
               this.metronomeInterval = setInterval(scheduleBeats, 25);
               scheduleBeats(); // Run immediately
           }

           stopMetronome() {
               if (this.metronomeInterval) {
                   clearInterval(this.metronomeInterval);
                   this.metronomeInterval = null;
               }
               
               // Reset beat dots
               document.querySelectorAll('.beat-dot').forEach(dot => {
                   dot.classList.remove('active');
               });
           }

           flashBeatIndicator(isDownbeat) {
                const targetRing = document.querySelector('.target-ring');
                const targetNumber = document.querySelector('.target-number');
                if (!targetRing || !targetNumber) return;
                
                // Animation fluide pour l'anneau
                if (isDownbeat) {
                    targetRing.style.transform = 'scale(1.08)';
                    targetRing.style.opacity = '1';
                } else {
                    targetRing.style.transform = 'scale(1.04)';
                    targetRing.style.opacity = '0.9';
                }
                
                // Animation fluide pour le chiffre - pas de changement de couleur
                if (isDownbeat) {
                    // Temps fort : compression puis expansion
                    targetNumber.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        targetNumber.style.transform = 'scale(1.15)';
                    }, 50);
                } else {
                    // Temps faible : pulse simple
                    targetNumber.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        targetNumber.style.transform = 'scale(1.05)';
                    }, 50);
                }
                
                // Retour fluide à la normale
                setTimeout(() => {
                    targetRing.style.transform = 'scale(1)';
                    targetRing.style.opacity = '0.8';
                    targetNumber.style.transform = 'scale(1)';
                }, 150);
            }

           updateBeatDots(beatIndex) {
               document.querySelectorAll('.beat-dot').forEach((dot, index) => {
                   if (index === beatIndex) {
                       dot.classList.add('active');
                       setTimeout(() => {
                           dot.classList.remove('active');
                       }, 150);
                   }
               });
           }

           getCurrentBPM() {
               if (this.currentTrack && this.tracks[this.currentTrack]) {
                   return this.tracks[this.currentTrack].bpm;
               } else if (this.currentGenre && this.genres[this.currentGenre]) {
                   return this.genres[this.currentGenre].bpm;
               }
               return 120; // Default BPM
           }

           setupEventListeners() {
               // Music toggle with better touch handling
               const musicToggleBtn = document.getElementById('musicToggleBtn');
               musicToggleBtn.addEventListener('click', (e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   const musicPanel = document.getElementById('musicPanel');
                   musicPanel.classList.toggle('show');
               });

               // Touch optimization for mobile
               musicToggleBtn.addEventListener('touchend', (e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   const musicPanel = document.getElementById('musicPanel');
                   musicPanel.classList.toggle('show');
               });

               // Music selection with better feedback
               document.querySelectorAll('.music-option').forEach(option => {
                   const handleSelection = (e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       
                       // Visual feedback
                       option.style.transform = 'scale(0.95)';
                       setTimeout(() => {
                           option.style.transform = '';
                       }, 150);

                       const genre = option.dataset.genre;
                       const track = option.dataset.track;
                       
                       if (genre === 'custom') {
                           document.getElementById('audioFile').click();
                       } else if (track) {
                           this.selectTrack(track);
                       } else if (genre) {
                           this.selectGenre(genre);
                       }
                   };

                   option.addEventListener('click', handleSelection);
                   option.addEventListener('touchend', (e) => {
                       e.preventDefault();
                       handleSelection(e);
                   });
               });

               // Input buttons with improved touch response
               document.querySelectorAll('.input-button').forEach(button => {
                   const handleInput = (e) => {
                       e.preventDefault();
                       if (this.gameState.isPlaying && !this.gameState.isPaused) {
                           this.handleInput(parseInt(button.dataset.number));
                       }
                   };

                   button.addEventListener('click', handleInput);
                   button.addEventListener('touchstart', (e) => {
                       e.preventDefault();
                       handleInput(e);
                   });
               });

               // Pause button
               const pauseBtn = document.getElementById('pauseBtn');
               pauseBtn.addEventListener('click', (e) => {
                   e.preventDefault();
                   this.pauseGame();
               });
               pauseBtn.addEventListener('touchend', (e) => {
                   e.preventDefault();
                   this.pauseGame();
               });

               // File input with loading feedback
               document.getElementById('audioFile').addEventListener('change', (e) => {
                   this.handleCustomAudio(e);
               });

               // Close music panel when clicking outside
               document.addEventListener('click', (e) => {
                   const musicPanel = document.getElementById('musicPanel');
                   const musicToggle = document.getElementById('musicToggleBtn');
                   if (!musicPanel.contains(e.target) && 
                       !musicToggle.contains(e.target) && 
                       musicPanel.classList.contains('show')) {
                       musicPanel.classList.remove('show');
                   }
               });

               // Menu buttons with better touch handling
               document.querySelectorAll('.menu-button').forEach(button => {
                   button.addEventListener('touchstart', (e) => {
                       e.preventDefault();
                       button.style.transform = 'scale(0.98)';
                   });
                   button.addEventListener('touchend', (e) => {
                       e.preventDefault();
                       button.style.transform = '';
                       button.click();
                   });
               });

               // Keyboard support
               document.addEventListener('keydown', (e) => {
                   if (this.gameState.isPlaying && !this.gameState.isPaused) {
                       if (e.key >= '1' && e.key <= '5') {
                           this.handleInput(parseInt(e.key));
                       }
                   }
                   if (e.key === 'Escape' && this.gameState.isPlaying) {
                       this.pauseGame();
                   }
               });

               // Prevent iOS bounce and zoom
               document.addEventListener('touchmove', (e) => {
                   if (e.touches.length === 1) {
                       e.preventDefault();
                   }
               }, { passive: false });

               // Prevent double tap zoom
               let lastTouchEnd = 0;
               document.addEventListener('touchend', (e) => {
                   const now = Date.now();
                   if (now - lastTouchEnd <= 300) {
                       e.preventDefault();
                   }
                   lastTouchEnd = now;
               }, false);
           }

           selectGenre(genre) {
               if (this.isLoadingAudio) return;

               // Update UI
               document.querySelectorAll('.music-option').forEach(opt => {
                   opt.classList.remove('active');
               });
               document.querySelector(`[data-genre="${genre}"]`).classList.add('active');

               // Update background
               document.querySelectorAll('.bg-layer').forEach(layer => {
                   layer.classList.remove('active');
               });
               const bgId = `bg${genre.charAt(0).toUpperCase() + genre.slice(1)}`;
               document.getElementById(bgId).classList.add('active');

               this.currentGenre = genre;
               this.currentTrack = null;
               
               // Generate audio with loading indicator
               this.showLoadingIndicator(`Loading ${this.genres[genre].name}...`);
               this.generateGenreAudio(genre).then(() => {
                   this.hideLoadingIndicator();
               });

               // Close panel after selection
               setTimeout(() => {
                   document.getElementById('musicPanel').classList.remove('show');
               }, 200);
           }

           async selectTrack(trackId) {
               if (this.isLoadingAudio) return;

               const track = this.tracks[trackId];
               if (!track) return;

               // Update UI
               document.querySelectorAll('.music-option').forEach(opt => {
                   opt.classList.remove('active');
               });
               document.querySelector(`[data-track="${trackId}"]`).classList.add('active');

               // Update background to custom
               document.querySelectorAll('.bg-layer').forEach(layer => {
                   layer.classList.remove('active');
               });
               document.getElementById('bgCustom').classList.add('active');

               this.currentTrack = trackId;
               this.currentGenre = null;

               // Load track
               this.showLoadingIndicator(`Loading ${track.name}...`);
               
               try {
                   await this.loadTrackFile(track.file);
                   this.hideLoadingIndicator();
               } catch (error) {
                   console.error('Error loading track:', error);
                   this.hideLoadingIndicator();
                   alert(`Could not load ${track.name}. Please make sure the file "${track.file}" is in the same directory as the game.`);
                   
                   // Fall back to generated audio
                   this.selectGenre('viral');
               }

               // Close panel after selection
               setTimeout(() => {
                   document.getElementById('musicPanel').classList.remove('show');
               }, 200);
           }

           async loadTrackFile(filename) {
               if (this.isLoadingAudio) return;
               this.isLoadingAudio = true;

               try {
                   const audioReady = await this.setupAudioContext();
                   if (!audioReady) {
                       throw new Error('Audio context not available');
                   }

                   // Try to load the file
                   const response = await fetch(filename);
                   if (!response.ok) {
                       throw new Error(`HTTP error! status: ${response.status}`);
                   }
                   
                   const arrayBuffer = await response.arrayBuffer();
                   this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

                   // Stop previous audio
                   if (this.audioSource) {
                       try {
                           this.audioSource.stop();
                           this.audioSource.disconnect();
                       } catch (e) {
                           // Already stopped
                       }
                   }

                   // Start playback if game is active
                   if (this.gameState.isPlaying) {
                       this.startAudioPlayback();
                   }

               } catch (error) {
                   console.error('Error loading track file:', error);
                   throw error;
               } finally {
                   this.isLoadingAudio = false;
               }
           }

           async generateGenreAudio(genre) {
               if (this.isLoadingAudio) return;
               this.isLoadingAudio = true;

               try {
                   const audioReady = await this.setupAudioContext();
                   if (!audioReady) {
                       throw new Error('Audio context not available');
                   }

                   const sampleRate = this.audioContext.sampleRate;
                   const duration = 120; // 2 minutes
                   const frameCount = sampleRate * duration;
                   const audioBuffer = this.audioContext.createBuffer(2, frameCount, sampleRate);

                   const bpm = this.genres[genre].bpm;
                   const beatInterval = (60 / bpm) * sampleRate;

                   // Generate audio data
                   for (let channel = 0; channel < 2; channel++) {
                       const channelData = audioBuffer.getChannelData(channel);
                       
                       for (let i = 0; i < frameCount; i++) {
                           const time = i / sampleRate;
                           const beatPosition = (i % beatInterval) / beatInterval;
                           let sample = 0;

                           switch (genre) {
                               case 'viral':
                                   // Heavy bass with phonk elements
                                   if (beatPosition < 0.1) {
                                       sample = Math.sin(2 * Math.PI * 55 * time) * 0.8 * Math.exp(-beatPosition * 15);
                                       sample += Math.sin(2 * Math.PI * 110 * time) * 0.4 * Math.exp(-beatPosition * 10);
                                   }
                                   // Cowbell rhythm
                                   if ((beatPosition > 0.5 && beatPosition < 0.52) || 
                                       (beatPosition > 0.75 && beatPosition < 0.77)) {
                                       sample += Math.sin(2 * Math.PI * 800 * time) * 0.3 * Math.exp(-(beatPosition % 0.25) * 100);
                                   }
                                   // Sub bass
                                   sample += Math.sin(2 * Math.PI * 35 * time) * 0.15;
                                   // Distortion
                                   sample = Math.tanh(sample * 1.5) * 0.7;
                                   break;

                               case 'hype':
                                   // Four-on-floor kick
                                   if (beatPosition < 0.05) {
                                       sample = Math.sin(2 * Math.PI * 60 * time) * Math.exp(-beatPosition * 20);
                                       sample += Math.sin(2 * Math.PI * 120 * time) * 0.5 * Math.exp(-beatPosition * 25);
                                   }
                                   // Side-chain compression effect
                                   const sidechain = beatPosition < 0.1 ? 0.3 : 1;
                                   // Supersaw lead
                                   const sawFreq = 440 * Math.pow(2, Math.sin(time * 0.5) * 0.5);
                                   for (let h = 1; h <= 5; h++) {
                                       sample += Math.sin(2 * Math.PI * sawFreq * h * time) * (0.3 / h) * sidechain;
                                   }
                                   // Hi-hats
                                   if ((beatPosition > 0.25 && beatPosition < 0.27) || 
                                       (beatPosition > 0.75 && beatPosition < 0.77)) {
                                       sample += (Math.random() - 0.5) * 0.2;
                                   }
                                   sample *= 0.5;
                                   break;

                               case 'chill':
                                   // Trap 808 bass
                                   if (beatPosition < 0.2) {
                                       const pitch = beatPosition < 0.05 ? 50 : 45;
                                       sample = Math.sin(2 * Math.PI * pitch * time) * 0.7 * Math.exp(-beatPosition * 8);
                                   }
                                   // Snare
                                   if (beatPosition > 0.48 && beatPosition < 0.52) {
                                       sample += (Math.random() - 0.5) * 0.5 * Math.exp(-(beatPosition - 0.5) * 50);
                                       sample += Math.sin(2 * Math.PI * 200 * time) * 0.3 * Math.exp(-(beatPosition - 0.5) * 40);
                                   }
                                   // Ambient pad
                                   sample += Math.sin(2 * Math.PI * 220 * time) * 0.1 * Math.sin(time * 0.2);
                                   sample += Math.sin(2 * Math.PI * 330 * time) * 0.05 * Math.sin(time * 0.3);
                                   // Hi-hat rolls
                                   const hihatPattern = Math.sin(time * bpm * 4) > 0.7;
                                   if (hihatPattern) {
                                       sample += (Math.random() - 0.5) * 0.15;
                                   }
                                   sample *= 0.6;
                                   break;
                           }

                           // Stereo effect
                           if (channel === 1) {
                               sample *= 0.95;
                               sample += Math.sin(2 * Math.PI * 0.5 * time) * 0.02;
                           }

                           channelData[i] = sample;
                       }
                   }

                   // Stop previous audio
                   if (this.audioSource) {
                       try {
                           this.audioSource.stop();
                           this.audioSource.disconnect();
                       } catch (e) {
                           // Already stopped
                       }
                   }

                   this.audioBuffer = audioBuffer;
                   
                   // Start playback if game is active
                   if (this.gameState.isPlaying) {
                       this.startAudioPlayback();
                   }

               } catch (error) {
                   console.error('Error generating audio:', error);
                   this.hideLoadingIndicator();
               } finally {
                   this.isLoadingAudio = false;
               }
           }

           async handleCustomAudio(event) {
               const file = event.target.files[0];
               if (!file) return;

               this.showLoadingIndicator(`Loading ${file.name}...`);

               try {
                   const audioReady = await this.setupAudioContext();
                   if (!audioReady) {
                       throw new Error('Audio context not available');
                   }

                   const arrayBuffer = await file.arrayBuffer();
                   this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                   
                   // Update UI
                   this.selectGenre('custom');
                   const customOption = document.querySelector('[data-genre="custom"]');
                   const fileName = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
                   customOption.innerHTML = `
                       <svg class="music-icon" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                       </svg>
                       ${fileName}
                   `;

                   this.hideLoadingIndicator();

                   if (this.gameState.isPlaying) {
                       this.startAudioPlayback();
                   }

               } catch (error) {
                   console.error('Error loading audio:', error);
                   this.hideLoadingIndicator();
                   alert('Error loading audio file. Please try another file.');
               }

               // Reset file input
               event.target.value = '';
           }

           startAudioPlayback() {
               try {
                   if (!this.audioBuffer || !this.audioContext) return;

                   if (this.audioSource) {
                       try {
                           this.audioSource.stop();
                           this.audioSource.disconnect();
                       } catch (e) {
                           // Already stopped
                       }
                   }

                   this.audioSource = this.audioContext.createBufferSource();
                   this.audioSource.buffer = this.audioBuffer;
                   this.audioSource.loop = true;
                   
                   // Add a gain node for volume control
                   this.gainNode = this.audioContext.createGain();
                   this.gainNode.gain.value = 0.7; // Reduce music volume to hear metronome better
                   
                   this.audioSource.connect(this.gainNode);
                   this.gainNode.connect(this.audioContext.destination);
                   this.audioSource.start(0);
                   
                   // Start metronome
                   this.startMetronome();

               } catch (error) {
                   console.error('Error starting audio:', error);
               }
           }

           handleInput(number) {
                console.log('Input received:', number, 'Target:', this.gameState.currentTarget, 'isPaused:', this.gameState.isPaused);
                
                const button = document.querySelector(`[data-number="${number}"]`);
                
                if (number === this.gameState.currentTarget) {
                    this.handleCorrectInput(button);
                } else {
                    this.handleWrongInput(button);
                }
            }

           handleCorrectInput(button) {
               button.classList.add('correct');
               setTimeout(() => button.classList.remove('correct'), 600);

               this.animateTargetHit();
               // Incrémenter les cibles touchées
               this.targetsHitInLevel++;

                // Vérifier si l'objectif du niveau est atteint
                const currentGoal = this.levelGoals[this.gameState.level];
                if (currentGoal && this.targetsHitInLevel >= currentGoal.targetsToHit) {
                    this.completeLevelObjective();
                }
                
                // Mettre à jour la barre de progression si elle existe
                this.updateLevelProgress();
               // Update combo
               this.gameState.combo++;
               this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);

               // Calculate score
               const baseScore = 100;
               const comboBonus = Math.min(this.gameState.combo * 10, 500);
               const speedBonus = Math.floor((this.gameState.timeRemaining / this.gameState.maxTime) * 50);
               const levelBonus = this.gameState.level * 20;
               const totalScore = baseScore + comboBonus + speedBonus + levelBonus;

               this.gameState.score += totalScore;
               this.createScorePopup(totalScore, button);

               // Update displays
               this.updateDisplay();

               // Create particles
               this.createParticles(button);

               // Vibrate if available
               if (navigator.vibrate) {
                   navigator.vibrate(50);
               }

               // Check level up
               if (this.gameState.score > 0 && this.gameState.score % 1000 < totalScore) {
                   this.levelUp();
               }

               this.generateNewChallenge();
           }

           // Nouvelle fonction pour compléter un objectif de niveau
            completeLevelObjective() {
                // Pause le jeu
                this.gameState.isPaused = true;
                
                // Afficher l'écran de succès
                const successOverlay = document.createElement('div');
                successOverlay.className = 'objective-overlay success';
                successOverlay.innerHTML = `
                    <div class="objective-card">
                        <h3>NIVEAU ${this.gameState.level} TERMINÉ!</h3>
                        <div class="stars">
                            ⭐ ⭐ ⭐
                        </div>
                        <p class="success-stats">
                            Score: ${this.gameState.score}<br>
                            Meilleur Combo: ${this.gameState.maxCombo}<br>
                            Précision: ${Math.round((this.targetsHitInLevel / (this.targetsHitInLevel + (3 - this.gameState.lives))) * 100)}%
                        </p>
                        <button class="continue-button primary" id="nextLevelBtn">NIVEAU SUIVANT</button>
                    </div>
                `;
                
                document.body.appendChild(successOverlay);
                
                // Ajouter l'événement après avoir ajouté l'overlay au DOM
                document.getElementById('nextLevelBtn').addEventListener('click', () => {
                    this.nextLevel();
                });
            }

            // Fonction pour passer au niveau suivant
            nextLevel() {
                const successOverlay = document.querySelector('.objective-overlay.success');
                if (successOverlay) {
                    successOverlay.remove();
                }
                
                this.gameState.level++;
                this.gameState.isPaused = false;
                this.gameState.lives = 3; // Restaurer les vies
                
                // Réinitialiser l'affichage des vies
                document.querySelectorAll('.life-dot').forEach(dot => {
                    dot.classList.remove('lost');
                });
                
                this.showLevelObjective();
            }

            // Mettre à jour la progression du niveau
            updateLevelProgress() {
                const progressBar = document.querySelector('.level-progress-bar');
                if (progressBar) {
                    const goal = this.levelGoals[this.gameState.level];
                    if (goal) {
                        const progress = (this.targetsHitInLevel / goal.targetsToHit) * 100;
                        progressBar.style.width = Math.min(progress, 100) + '%';
                    }
                }
            }

           animateTargetHit() {
                const targetNumber = document.querySelector('.target-number');
                const targetInner = document.querySelector('.target-inner');
                const targetRing = document.querySelector('.target-ring');
                
                if (!targetNumber || !targetInner) return;
                
                // Effet de flash sur le cercle intérieur
                targetInner.style.background = 'radial-gradient(circle at center, rgba(0,255,136,0.2) 0%, rgba(0,0,0,0.95) 50%)';
                
                // Animation du numéro
                targetNumber.style.transform = 'scale(1.4)';
                targetNumber.style.color = '#00ff88';
                targetNumber.style.textShadow = '0 0 60px rgba(0,255,136,1), 0 0 30px rgba(0,255,136,0.8)';
                
                // Effet d'onde sur l'anneau
                targetRing.style.transform = 'scale(1.2)';
                targetRing.style.filter = 'blur(6px) brightness(1.5)';
                
                // Créer un effet d'onde expansive
                const wave = document.createElement('div');
                wave.style.cssText = `
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 3px solid #00ff88;
                    border-radius: 50%;
                    top: 0;
                    left: 0;
                    transform: scale(1);
                    opacity: 1;
                    pointer-events: none;
                    z-index: 10;
                `;
                targetNumber.parentElement.appendChild(wave);
                
                // Animation de l'onde
                requestAnimationFrame(() => {
                    wave.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    wave.style.transform = 'scale(1.5)';
                    wave.style.opacity = '0';
                    wave.style.borderWidth = '1px';
                });
                
                // Retour à la normale
                setTimeout(() => {
                    targetInner.style.background = '';
                    targetNumber.style.transform = 'scale(1)';
                    targetNumber.style.color = '#ffffff';
                    targetNumber.style.textShadow = '0 0 30px rgba(255,255,255,0.5)';
                    targetRing.style.transform = 'scale(1)';
                    targetRing.style.filter = 'blur(3px)';
                }, 300);
                
                // Nettoyer l'onde
                setTimeout(() => {
                    wave.remove();
                }, 600);
            }

           handleWrongInput(button) {
               button.classList.add('wrong');
               setTimeout(() => button.classList.remove('wrong'), 500);

               this.gameState.combo = 0;
               this.gameState.lives--;
               this.updateDisplay();

               if (navigator.vibrate) {
                   navigator.vibrate([100, 50, 100]);
               }

               if (this.gameState.lives <= 0) {
                   this.gameOver();
               }
           }

           createScorePopup(score, element) {
               const popup = document.createElement('div');
               popup.className = 'score-popup';
               popup.textContent = `+${score}`;
               popup.style.color = '#00ff88';
               
               const rect = element.getBoundingClientRect();
               popup.style.left = rect.left + rect.width / 2 + 'px';
               popup.style.top = rect.top + 'px';

               document.body.appendChild(popup);
               setTimeout(() => popup.remove(), 1500);
           }

           createParticles(element) {
               const rect = element.getBoundingClientRect();
               const centerX = rect.left + rect.width / 2;
               const centerY = rect.top + rect.height / 2;

               for (let i = 0; i < 12; i++) {
                   const particle = document.createElement('div');
                   particle.className = 'particle';
                   
                   const angle = (i / 12) * Math.PI * 2;
                   const velocity = 100 + Math.random() * 100;
                   const tx = Math.cos(angle) * velocity;
                   const ty = Math.sin(angle) * velocity;

                   particle.style.left = centerX + 'px';
                   particle.style.top = centerY + 'px';
                   particle.style.setProperty('--tx', tx + 'px');
                   particle.style.setProperty('--ty', ty + 'px');
                   particle.style.background = `hsl(${Math.random() * 60 + 120}, 100%, 60%)`;

                   document.body.appendChild(particle);
                   setTimeout(() => particle.remove(), 1000);
               }
           }

           updateDisplay() {
               // Score
               document.getElementById('scoreValue').textContent = this.gameState.score.toLocaleString();

               // Combo
               document.getElementById('comboValue').textContent = `x${this.gameState.combo}`;
               const fillPercent = Math.min((this.gameState.combo / 20) * 100, 100);
               document.getElementById('comboFill').style.width = fillPercent + '%';

               // Lives
               for (let i = 1; i <= 3; i++) {
                   const lifeDot = document.getElementById(`life${i}`);
                   if (i > this.gameState.lives) {
                       lifeDot.classList.add('lost');
                   } else {
                       lifeDot.classList.remove('lost');
                   }
               }
           }

           updateTimerDisplay() {
               const progress = this.gameState.timeRemaining / this.gameState.maxTime;
               const circumference = 2 * Math.PI * 140;
               const offset = circumference - (progress * circumference);
               document.getElementById('timerCircle').style.strokeDashoffset = offset;

               // Change color based on time remaining
               if (progress < 0.2) {
                   document.getElementById('timerCircle').style.stroke = '#ff006e';
               } else if (progress < 0.5) {
                   document.getElementById('timerCircle').style.stroke = '#ffff00';
               }
           }

           levelUp() {
               this.gameState.level++;
               this.gameState.speedMultiplier += 0.15;
               this.gameState.maxTime = Math.max(40, this.gameState.maxTime - 5);
               
               const popup = document.createElement('div');
               popup.className = 'score-popup';
               popup.textContent = `LEVEL ${this.gameState.level}!`;
               popup.style.color = '#ffff00';
               popup.style.fontSize = '48px';
               popup.style.left = '50%';
               popup.style.top = '40%';
               popup.style.transform = 'translate(-50%, -50%)';
               document.body.appendChild(popup);
               setTimeout(() => popup.remove(), 2000);
           }

           generateNewChallenge() {
               // More varied number generation at higher levels
               if (this.gameState.level > 5) {
                   // Include previous number to make it harder
                   let newTarget;
                   do {
                       newTarget = Math.floor(Math.random() * 5) + 1;
                   } while (Math.random() < 0.3 && newTarget === this.gameState.currentTarget);
                   this.gameState.currentTarget = newTarget;
               } else {
                   this.gameState.currentTarget = Math.floor(Math.random() * 5) + 1;
               }
               
               this.gameState.timeRemaining = this.gameState.maxTime;
               
               document.getElementById('targetNumber').textContent = this.gameState.currentTarget;
               
               // Update indicator dots with animation
               const dots = document.querySelectorAll('.indicator-dot');
               dots.forEach((dot, index) => {
                   setTimeout(() => {
                       if (index < this.gameState.currentTarget) {
                           dot.classList.add('active');
                       } else {
                           dot.classList.remove('active');
                       }
                   }, index * 50);
               });
           }

           gameLoop() {
               if (!this.gameState.isPlaying || this.gameState.isPaused) return;

               this.gameState.timeRemaining -= this.gameState.speedMultiplier;
               this.updateTimerDisplay();

               if (this.gameState.timeRemaining <= 0) {
                   this.handleWrongInput(document.createElement('div'));
                   if (this.gameState.lives > 0) {
                       this.generateNewChallenge();
                   }
               }

               requestAnimationFrame(() => this.gameLoop());
           }

           async startGame() {
            document.getElementById('tutorialOverlay').style.display = 'none';
            
            this.gameState = {
                isPlaying: true,
                isPaused: true,
                score: 0,
                level: 1,
                lives: 3,
                combo: 0,
                maxCombo: 0,
                currentTarget: 3,
                timeRemaining: 100,
                maxTime: 150,
                speedMultiplier: 0.5
            };
            
            this.updateDisplay();
            document.getElementById('targetContainer').style.display = 'flex';
            document.getElementById('controlsContainer').style.display = 'flex';
            document.getElementById('pauseBtn').style.display = 'flex';
            
            // Préparer l'audio AVANT d'afficher l'objectif
            if (!this.audioBuffer) {
                await this.generateGenreAudio(this.currentGenre);
            }
            
            await this.setupAudioContext();
            this.startAudioPlayback();
            
            // Afficher l'objectif du premier niveau APRÈS l'audio
            this.showLevelObjective();
            
            // NE PAS appeler gameLoop() ici car on est en pause
        }

           pauseGame() {
               if (!this.gameState.isPlaying || this.gameState.isPaused) return;
               
               this.gameState.isPaused = true;
               document.getElementById('pauseOverlay').classList.add('show');
               
               if (this.audioContext && this.audioContext.state === 'running') {
                   this.audioContext.suspend();
               }
               
               this.stopMetronome();
           }

           resumeGame() {
               this.gameState.isPaused = false;
               document.getElementById('pauseOverlay').classList.remove('show');
               
               if (this.audioContext && this.audioContext.state === 'suspended') {
                   this.audioContext.resume().then(() => {
                       this.startMetronome();
                   });
               }
               
               this.gameLoop();
           }

           gameOver() {
               this.gameState.isPlaying = false;
               
               this.stopMetronome();
               
               if (this.audioSource) {
                   try {
                       this.audioSource.stop();
                       this.audioSource.disconnect();
                   } catch (e) {
                       // Already stopped
                   }
               }

               document.getElementById('finalScore').textContent = this.gameState.score.toLocaleString();
               document.getElementById('finalLevel').textContent = this.gameState.level;
               document.getElementById('finalCombo').textContent = this.gameState.maxCombo;

               document.getElementById('gameOverOverlay').classList.add('show');
               document.getElementById('targetContainer').style.display = 'none';
               document.getElementById('controlsContainer').style.display = 'none';
               document.getElementById('pauseBtn').style.display = 'none';
           }

           restartGame() {
               document.getElementById('gameOverOverlay').classList.remove('show');
               document.getElementById('pauseOverlay').classList.remove('show');
               
               // Reset lives display
               document.querySelectorAll('.life-dot').forEach(dot => {
                   dot.classList.remove('lost');
               });

               // Reset timer color
               document.getElementById('timerCircle').style.stroke = 'url(#timerGradient)';

               this.startGame();
           }

           quitToMenu() {
               this.gameState.isPlaying = false;
               
               this.stopMetronome();
               
               if (this.audioSource) {
                   try {
                       this.audioSource.stop();
                       this.audioSource.disconnect();
                   } catch (e) {
                       // Already stopped
                   }
               }

               document.getElementById('gameOverOverlay').classList.remove('show');
               document.getElementById('pauseOverlay').classList.remove('show');
               document.getElementById('targetContainer').style.display = 'none';
               document.getElementById('controlsContainer').style.display = 'none';
               document.getElementById('pauseBtn').style.display = 'none';
               document.getElementById('tutorialOverlay').style.display = 'flex';

               // Reset displays
               document.getElementById('scoreValue').textContent = '0';
               document.getElementById('comboValue').textContent = 'x0';
               document.getElementById('comboFill').style.width = '0%';
               document.querySelectorAll('.life-dot').forEach(dot => {
                   dot.classList.remove('lost');
               });
           }
       }

       // Global functions
       let game;

       function startGame() {
            if (!window.game) {
                window.game = new FingerBeatGame();
            }
            window.game.startGame();
        }

        function showTutorial() {
            document.getElementById('tutorialOverlay').style.display = 'none';
            document.getElementById('howToPlayOverlay').classList.add('show');
        }

        function hideHowToPlay() {
            document.getElementById('howToPlayOverlay').classList.remove('show');
            document.getElementById('tutorialOverlay').style.display = 'flex';
        }

       function resumeGame() {
            if (window.game) window.game.resumeGame();
        }

       function restartGame() {
            if (window.game) window.game.restartGame();
        }

       function quitToMenu() {
            if (window.game) window.game.quitToMenu();
        }
        function shareScore() {
            if (window.game) window.game.shareScore();
        }

        function exportGameData() {
            if (window.game) window.game.exportGameData();
        }

        function importGameData() {
            if (window.game) window.game.importGameData();
        }

        function resetGameData() {
            if (window.game) window.game.resetGameData();
        }

       // Initialize on load
       window.addEventListener('load', () => {
            console.log('Finger Beat Ultimate v2.0 - Initializing...');
            
            try {
                window.game = new FingerBeatGame();
                console.log('Game initialized successfully!');
            } catch (error) {
                console.error('Initialization error:', error);
            }
            
            // Mobile optimizations
            document.addEventListener('gesturestart', e => e.preventDefault());
            
            // Viewport height fix
            function setViewportHeight() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }
            
            setViewportHeight();
            window.addEventListener('resize', setViewportHeight);
            window.addEventListener('orientationchange', setViewportHeight);
        });

       // Add CSS variable for viewport height
       const style = document.createElement('style');
       style.textContent = `
           .game-container {
               height: 100vh;
               height: calc(var(--vh, 1vh) * 100);
           }
       `;
       document.head.appendChild(style);