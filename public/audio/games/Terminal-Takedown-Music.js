class TerminalTakedownMusic {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.activeNodes = [];
        this.loopTimeout = null;
        this.onFinishedCallback = null;
    }

    start(onFinished = null) {
        if (this.isPlaying) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.isPlaying = true;
        this.activeNodes = [];
        this.onFinishedCallback = onFinished;

        // Clotho-inspired: moderate tempo, minor key, mysterious & melodic
        const tempo = 120;
        const beat = 60 / tempo;
        const eighth = beat / 2;
        const sixteenth = beat / 4;

        const master = this.ctx.createGain();
        master.gain.setValueAtTime(0.22, this.ctx.currentTime);
        master.connect(this.ctx.destination);

        const t = this.ctx.currentTime + 0.05;
        const totalBeats = 16;
        const totalDuration = totalBeats * beat;

        // Note frequencies
        const freq = {
            'A2':110,'B2':123.47,'C3':130.81,'D3':146.83,'E3':164.81,'F3':174.61,'G3':196,
            'A3':220,'B3':246.94,'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392,
            'A4':440,'B4':493.88,'C5':523.25,'D5':587.33,'E5':659.25,'F5':698.46,'G5':783.99,
            'A5':880,'G#3':207.65,'G#4':415.30,'F#3':185,'F#4':369.99
        };

        // --- BASS LINE (triangle wave, steady pulse — Columns-style walking bass) ---
        // Am - Em - F - E pattern (classic dramatic minor progression)
        const bassPattern = [
            ['A2',4],['A2',2],['C3',2], ['E3',4],['E3',2],['B2',2],
            ['F3',4],['F3',2],['E3',2], ['E3',4],['E3',2],['G#3',2]
        ];
        let bassTime = t;
        bassPattern.forEach(([note, eighths]) => {
            const f = freq[note];
            const dur = eighths * eighth;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, bassTime);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, bassTime);
            gain.gain.setValueAtTime(0.2, bassTime);
            gain.gain.setValueAtTime(0.2, bassTime + dur - 0.04);
            gain.gain.linearRampToValueAtTime(0.001, bassTime + dur);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            osc.start(bassTime);
            osc.stop(bassTime + dur + 0.01);
            this.activeNodes.push(osc);
            bassTime += dur;
        });

        // --- ARPEGGIO (sine wave, Columns-style cascading notes) ---
        // Am arpeggio → Em arpeggio → F arpeggio → E arpeggio
        const arpPattern = [
            // Am (4 beats)
            'A4','C5','E5','A5','E5','C5','A4','C5',
            // Em (4 beats)
            'E4','G4','B4','E5','B4','G4','E4','G4',
            // F (4 beats)
            'F4','A4','C5','F5','C5','A4','F4','A4',
            // E (4 beats)
            'E4','G#4','B4','E5','B4','G#4','E4','G#4'
        ];
        let arpTime = t;
        arpPattern.forEach(note => {
            const f = freq[note];
            const dur = eighth;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, arpTime);
            // Bell-like envelope: quick attack, gentle decay
            gain.gain.setValueAtTime(0.12, arpTime);
            gain.gain.exponentialRampToValueAtTime(0.02, arpTime + dur * 0.7);
            gain.gain.linearRampToValueAtTime(0.001, arpTime + dur * 0.95);
            osc.connect(gain);
            gain.connect(master);
            osc.start(arpTime);
            osc.stop(arpTime + dur);
            this.activeNodes.push(osc);
            arpTime += dur;
        });

        // --- MELODY (square wave, filtered — haunting Clotho-style lead) ---
        // Descending minor melody, Russian-folk inspired intervals
        const melodyNotes = [
            ['E5',2],['D5',2],['C5',2],['B4',2],  // bar 1: descending
            ['A4',3],['G4',1],['A4',2],['B4',2],  // bar 2: resolve up
            ['C5',2],['D5',2],['E5',2],['C5',2],  // bar 3: climbing
            ['B4',3],['G#4',1],['A4',2],['REST',2] // bar 4: dramatic pause
        ];
        let melTime = t;
        melodyNotes.forEach(([note, eighths]) => {
            const dur = eighths * eighth;
            if (note === 'REST') {
                melTime += dur;
                return;
            }
            const f = freq[note];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            osc.type = 'square';
            osc.frequency.setValueAtTime(f, melTime);
            // Heavy filtering makes square wave sound like a music box
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1800, melTime);
            filter.frequency.exponentialRampToValueAtTime(600, melTime + dur * 0.8);
            filter.Q.setValueAtTime(1.5, melTime);
            gain.gain.setValueAtTime(0.055, melTime);
            gain.gain.setValueAtTime(0.055, melTime + dur * 0.6);
            gain.gain.exponentialRampToValueAtTime(0.001, melTime + dur * 0.95);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            osc.start(melTime);
            osc.stop(melTime + dur);
            this.activeNodes.push(osc);
            melTime += dur;
        });

        // --- KICK (soft, on beats 1 and 3) ---
        for (let i = 0; i < totalBeats; i++) {
            if (i % 2 !== 0) continue; // only on 1 and 3
            const kickTime = t + i * beat;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, kickTime);
            osc.frequency.exponentialRampToValueAtTime(40, kickTime + 0.08);
            gain.gain.setValueAtTime(0.18, kickTime);
            gain.gain.exponentialRampToValueAtTime(0.001, kickTime + 0.12);
            osc.connect(gain);
            gain.connect(master);
            osc.start(kickTime);
            osc.stop(kickTime + 0.13);
            this.activeNodes.push(osc);
        }

        // --- SHAKER/HI-HAT (gentle eighth-note pulse) ---
        for (let i = 0; i < totalBeats * 2; i++) {
            const hatTime = t + i * eighth;
            const bufSize = this.ctx.sampleRate * 0.02;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let s = 0; s < bufSize; s++) data[s] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            const nGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            noise.buffer = buf;
            filter.type = 'highpass';
            filter.frequency.value = 10000;
            // Accent on beat, softer off-beat
            const vol = (i % 2 === 0) ? 0.025 : 0.015;
            nGain.gain.setValueAtTime(vol, hatTime);
            nGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.018);
            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(master);
            noise.start(hatTime);
            noise.stop(hatTime + 0.025);
            this.activeNodes.push(noise);
        }

        // --- ATMOSPHERIC PAD (sustained minor chord, very quiet) ---
        const padNotes = [220, 261.63, 329.63]; // Am chord
        padNotes.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.025, t + 0.5);
            gain.gain.setValueAtTime(0.025, t + totalDuration - 0.5);
            gain.gain.linearRampToValueAtTime(0.001, t + totalDuration);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            osc.start(t);
            osc.stop(t + totalDuration + 0.1);
            this.activeNodes.push(osc);
        });

        // Auto-loop/callback at end
        const totalMs = totalDuration * 1000;
        this.loopTimeout = setTimeout(() => {
            this.stop();
            if (typeof this.onFinishedCallback === 'function') this.onFinishedCallback();
        }, totalMs);
    }

    stop() {
        if (!this.isPlaying) return;
        clearTimeout(this.loopTimeout);
        this.activeNodes.forEach(node => { try { node.stop(); } catch(e) {} });
        this.activeNodes = [];
        if (this.ctx && this.ctx.state !== 'closed') this.ctx.close().catch(()=>{});
        this.ctx = null;
        this.isPlaying = false;
    }
}
