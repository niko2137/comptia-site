/**
 * GameSounds — Web Audio API sound effects module for CompTIA A+ Study Hub
 * Generates synthesized sounds (tones/beeps) without external audio files.
 * Lazy-initializes AudioContext on first user interaction (browser policy compliant).
 * NO auto-play — sounds only trigger on user action.
 */
const GameSounds = (() => {
    let audioCtx = null;
    let _isMuted = localStorage.getItem('gameAudioMuted') === 'true';
    let _volume = parseFloat(localStorage.getItem('gameAudioVolume')) || 0.5;

    function getContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTone(frequency, duration, type = 'sine', gainValue = _volume, ramp = true) {
        if (_isMuted) return;
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(gainValue * _volume, ctx.currentTime);
        if (ramp) {
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        }
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    function playSequence(notes) {
        if (_isMuted) return;
        const ctx = getContext();
        let time = ctx.currentTime;
        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = note.type || 'sine';
            osc.frequency.setValueAtTime(note.freq, time);
            gain.gain.setValueAtTime((note.gain || 0.5) * _volume, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + note.dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(time);
            osc.stop(time + note.dur);
            time += note.delay || note.dur;
        });
    }

    const api = {
        get isMuted() { return _isMuted; },
        get volume() { return _volume; },

        correct() {
            // Pleasant ascending two-tone beep (ding!)
            playSequence([
                { freq: 523.25, dur: 0.12, delay: 0.1, type: 'sine', gain: 0.5 },
                { freq: 659.25, dur: 0.18, delay: 0.18, type: 'sine', gain: 0.6 }
            ]);
        },

        wrong() {
            // Short descending buzz
            playSequence([
                { freq: 330, dur: 0.1, delay: 0.08, type: 'square', gain: 0.3 },
                { freq: 220, dur: 0.15, delay: 0.15, type: 'square', gain: 0.25 }
            ]);
        },

        click() {
            // Subtle click sound
            playTone(1000, 0.05, 'sine', 0.3);
        },

        complete() {
            // Celebration jingle — ascending arpeggio
            playSequence([
                { freq: 523.25, dur: 0.12, delay: 0.1, type: 'sine', gain: 0.4 },
                { freq: 659.25, dur: 0.12, delay: 0.1, type: 'sine', gain: 0.45 },
                { freq: 783.99, dur: 0.12, delay: 0.1, type: 'sine', gain: 0.5 },
                { freq: 1046.5, dur: 0.3, delay: 0.3, type: 'sine', gain: 0.6 }
            ]);
        },

        tick() {
            // Quiet tick for timer countdowns
            playTone(800, 0.03, 'sine', 0.15);
        },

        mute() {
            _isMuted = true;
            localStorage.setItem('gameAudioMuted', 'true');
            api._updateUI();
        },

        unmute() {
            _isMuted = false;
            localStorage.setItem('gameAudioMuted', 'false');
            api._updateUI();
        },

        setVolume(v) {
            _volume = Math.max(0, Math.min(1, v));
            localStorage.setItem('gameAudioVolume', _volume.toString());
            api._updateUI();
        },

        createControlsUI() {
            return `
<div id="game-audio-controls" role="region" aria-label="Audio controls" style="position:fixed;bottom:16px;right:16px;z-index:9999;background:rgba(20,28,48,0.92);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 16px rgba(0,0,0,0.3);font-family:sans-serif;font-size:13px;">
    <button id="game-audio-mute-btn" aria-label="Toggle sound mute" onclick="GameSounds.isMuted ? GameSounds.unmute() : GameSounds.mute()" style="background:none;border:none;font-size:1.3em;cursor:pointer;padding:4px;line-height:1;color:#fff;">${_isMuted ? '\u{1F507}' : '\u{1F50A}'}</button>
    <input id="game-audio-volume" type="range" min="0" max="1" step="0.05" value="${_volume}" aria-label="Volume control" oninput="GameSounds.setVolume(parseFloat(this.value))" style="width:70px;cursor:pointer;accent-color:#00e5ff;">
</div>`;
        },

        initControls() {
            // Sync UI state on load
            api._updateUI();
        },

        _updateUI() {
            const btn = document.getElementById('game-audio-mute-btn');
            const slider = document.getElementById('game-audio-volume');
            if (btn) btn.textContent = _isMuted ? '\u{1F507}' : '\u{1F50A}';
            if (slider) slider.value = _volume;
        }
    };

    return api;
})();
