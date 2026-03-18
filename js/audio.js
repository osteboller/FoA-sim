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
            this.bgm.current.volume(vol);
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
        _play: function(path) {
            const sound = new Howl({
                src: [path],
                volume: AudioManager.settings.announcerVolume
            });
            sound.play();
        },
        playCombat: function(winner, loser) {
            const winKey = this.getKey(winner);
            const loseKey = this.getKey(loser);
            this._play(`assets/audio/announcer/combat/${winKey}-beats-${loseKey}.ogg`);
        },
        playSystem: function(effect) {
            this._play(`assets/audio/announcer/results/${effect}.ogg`);
        },
        playEvent: function(effect) {
            this._play(`assets/audio/announcer/combat/${effect}.ogg`);
        }
    },

    sfx: {
        currentRiser: null,
        play: function(folder, file, ext = 'ogg') {
            const path = `assets/audio/sfx/${folder}/${file}.${ext}`;
            
            const sound = new Howl({
                src: [path],
                volume: AudioManager.settings.sfxVolume
            });
            
            if (file.startsWith('riser-')) {
                if (this.currentRiser) {
                    this.currentRiser.stop();
                }
                this.currentRiser = sound;
            }
            
            if (file.startsWith('reveal-')) {
                if (this.currentRiser) {
                    this.currentRiser.stop();
                    this.currentRiser = null;
                }
            }
            
            sound.play();
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
        currentTrackName: null,
    
        play(trackName, loop = true) {
            if (this.currentTrackName === trackName) return;

            const newSrc = `${this.path}${trackName}.ogg`;
            const targetVol = AudioManager.settings.bgmVolume;

            const newTrack = new Howl({
                src: [newSrc],
                loop: loop,
                volume: 0, 
                html5: true 
            });

            if (this.current) {
                const oldTrack = this.current;
                oldTrack.fade(oldTrack.volume(), 0, 1000);
                oldTrack.once('fade', () => {
                    oldTrack.stop();
                    oldTrack.unload();
                });
            }

            newTrack.play();
            newTrack.fade(0, targetVol, 1000);

            this.current = newTrack;
            this.currentTrackName = trackName;
        },
        
        stop() {
            if (this.current) {
                this.current.fade(this.current.volume(), 0, 1000);
                this.current.once('fade', () => {
                    this.current.stop();
                    this.current.unload();
                    this.current = null;
                    this.currentTrackName = null;
                });
            }
        }
    }
};