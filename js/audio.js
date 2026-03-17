const savedAudioSettings = JSON.parse(localStorage.getItem('foa_audio_settings')) || {};

const AudioManager = {
    settings: { 
        bgmVolume: savedAudioSettings.bgmVolume !== undefined ? savedAudioSettings.bgmVolume : 0.8,
        sfxVolume: savedAudioSettings.sfxVolume !== undefined ? savedAudioSettings.sfxVolume : 0.7,
        announcerVolume: savedAudioSettings.announcerVolume !== undefined ? savedAudioSettings.announcerVolume : 0.6
    },
    
    updateVolume: function(type, value) {
        const vol = parseFloat(value);
        this.settings[type + 'Volume'] = vol;
        localStorage.setItem('foa_audio_settings', JSON.stringify(this.settings));
        
        if (type === 'bgm' && this.bgm.current) {
            this.bgm.current.volume = vol;
        }
    },

    announcer: {
        getKey: function(alien) {
            if (!alien) return 'alien';
            if (alien.group === 'E-ramm') return 'jangutz-khan';
            if (alien.group === 'Sciroids') return 'sciroid';
            if (alien.group === 'RAMMs' || alien.type === 'metallic') return 'ramm';
            if (alien.type === 'hybrid') return 'mutant';
            if (alien.type === 'red') return 'dredrock';
            if (alien.type === 'green') return 'gangreen';
            if (alien.type === 'blue') return 'mutoid';
            return 'alien';
        },
        playCombat: function(winner, loser) {
            const winKey = this.getKey(winner);
            const loseKey = this.getKey(loser);
            const audio = new Audio(`assets/audio/announcer/combat/${winKey}-beats-${loseKey}.ogg`);
            audio.volume = AudioManager.settings.announcerVolume;
            audio.play().catch(e => console.warn("Audio afspilning fejlede (findes filen?):", e));
        },
        playSystem: function(effect) {
            // effect kan fx være 'victory', 'defeat', 'draw' etc.
            const audio = new Audio(`assets/audio/announcer/results/${effect}.ogg`);
            audio.volume = AudioManager.settings.announcerVolume;
            audio.play().catch(e => console.warn("Audio afspilning fejlede (findes filen?):", e));
        },
        playEvent: function(effect) {
            const audio = new Audio(`assets/audio/announcer/combat/${effect}.ogg`);
            audio.volume = AudioManager.settings.announcerVolume;
            audio.play().catch(e => console.warn("Audio afspilning fejlede (findes filen?):", e));
        }
    },
    sfx: {
        play: function(folder, file, ext = 'ogg') {
            const path = `assets/audio/sfx/${folder}/${file}.${ext}`;
            const audio = new Audio(path);
            audio.volume = AudioManager.settings.sfxVolume;
            audio.play().catch(e => console.warn(`SFX fejlede (${path}):`, e));
        },
        playRandom: function(folder, prefix, count, padZeros = true, ext = 'ogg') {
            const rand = Math.floor(Math.random() * count) + 1;
            const suffix = padZeros ? rand.toString().padStart(2, '0') : rand.toString();
            this.play(folder, `${prefix}-${suffix}`, ext);
        }
    },
    bgm: {
        path: 'assets/audio/bgm/',
        current: null,
        oldTracks: [],
        fadeTimer: null,
    
        /**
         * Spiller et musiknummer med en blød crossfade effekt
         */
        play(trackName, loop = true) {
            const newSrc = `${this.path}${trackName}.ogg`;
            
            // Hvis sangen allerede spiller, så gør intet
            if (this.current && this.current.src.includes(newSrc)) return;
    
            if (this.current) {
                this.oldTracks.push(this.current);
            }

            const newTrack = new Audio(newSrc);
            
            newTrack.loop = loop;
            newTrack.volume = 0; // Start fra lydløs for at fade ind
            this.current = newTrack;
    
            newTrack.play().then(() => {
                this.crossfade(newTrack);
            }).catch(e => console.warn("BGM kunne ikke starte (venter på brugerinteraktion):", e));
        },
    
        /**
         * Håndterer den glidende overgang mellem to numre
         */
        crossfade(newTrack) {
            if (this.fadeTimer) clearInterval(this.fadeTimer);
            
            const targetVol = AudioManager.settings.bgmVolume;
            const step = Math.max(0.01, targetVol / 10); // 10 steps for at fade over 1 sekund (10 * 100ms)
            
            this.fadeTimer = setInterval(() => {
                let finished = true;
    
                // Fade det nye nummer IND
                if (newTrack.volume < targetVol) {
                    newTrack.volume = Math.min(targetVol, newTrack.volume + step);
                    finished = false;
                }
    
                // Fade alle gamle numre UD
                for (let i = this.oldTracks.length - 1; i >= 0; i--) {
                    let track = this.oldTracks[i];
                    if (track.volume > 0) {
                        track.volume = Math.max(0, track.volume - step);
                        finished = false;
                    } else {
                        track.pause();
                        this.oldTracks.splice(i, 1);
                    }
                }
    
                if (finished) {
                    clearInterval(this.fadeTimer);
                    this.fadeTimer = null;
                }
            }, 100); // Kører hver 100ms
        },
    
        stop() {
            if (this.current) {
                this.current.pause();
                this.current = null;
            }
            this.oldTracks.forEach(t => t.pause());
            this.oldTracks = [];
            if (this.fadeTimer) clearInterval(this.fadeTimer);
        }
    }
};