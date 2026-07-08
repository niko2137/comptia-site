class NeonCircuitMusic {
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

        const tempo = 128;
        const beat = 60 / tempo;
        const eighth = beat / 2;
        const sixteenth = beat / 4;

        const master = this.ctx.createGain();
        master.gain.setValueAtTime(0.24, this.ctx.currentTime);
        master.connect(this.ctx.destination);

        const t = this.ctx.currentTime + 0.05;
        const totalBeats = 16;
        const totalDuration = totalBeats * beat;

        // --- TRON-STYLE PAD (warm background glow) ---
        const padChords = [
            {notes: [220, 329.63, 440], dur: 4},  // Am
            {notes: [174.61, 261.63, 349.23], dur: 4},  // F
            {notes: [261.63, 392, 523.25], dur: 4},  // C
            {notes: [196, 293.66, 392], dur: 4}   // G
        ];
        let padTime = t;
        padChords.forEach(chord => {
            const dur = chord.dur * beat;
            chord.notes.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, padTime);
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, padTime);
                filter.Q.setValueAtTime(0.5, padTime);
                gain.gain.setValueAtTime(0, padTime);
                gain.gain.linearRampToValueAtTime(0.04, padTime + 0.15);
                gain.gain.setValueAtTime(0.04, padTime + dur - 0.1);
                gain.gain.linearRampToValueAtTime(0.001, padTime + dur);
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(master);
                osc.start(padTime);
                osc.stop(padTime + dur + 0.05);
                this.activeNodes.push(osc);
            });
            padTime += dur;
        });

        // --- BASS (smooth triangle wave, not harsh square) ---
        const bassNotes = [
            ['A2', 8], ['A2', 8], ['F2', 8], ['F2', 8],
            ['C3', 8], ['C3', 8], ['G2', 8], ['G2', 8],
            ['A2', 8], ['A2', 8], ['F2', 8], ['F2', 8],
            ['C3', 8], ['C3', 8], ['G2', 4], ['G2', 2], ['A2', 2]
        ];
        const bassFreqs = {'A2':110,'F2':87.31,'C3':130.81,'G2':98,'E2':82.41,'D2':73.42};

        let bassTime = t;
        bassNotes.forEach(([note, sixteenths]) => {
            const freq = bassFreqs[note] || 110;
            const dur = sixteenths * sixteenth;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, bassTime);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, bassTime);
            gain.gain.setValueAtTime(0.22, bassTime);
            gain.gain.setValueAtTime(0.22, bassTime + dur - 0.03);
            gain.gain.linearRampToValueAtTime(0.001, bassTime + dur);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            osc.start(bassTime);
            osc.stop(bassTime + dur);
            this.activeNodes.push(osc);
            bassTime += dur;
        });

        // --- LEAD ARPEGGIO (filtered triangle, smooth TRON glow) ---
        const leadPattern = [
            'A4','C5','E5','A5', 'A4','C5','E5','A5',
            'F4','A4','C5','F5', 'F4','A4','C5','F5',
            'C4','E4','G4','C5', 'C4','E4','G4','C5',
            'G4','B4','D5','G5', 'G4','B4','D5','G5',
            'A4','C5','E5','A5', 'A4','C5','E5','A5',
            'F4','A4','C5','F5', 'F4','A4','C5','F5',
            'C4','E4','G4','C5', 'C4','E4','G4','C5',
            'G4','B4','D5','G5', 'G4','B4','D5','A5'
        ];
        const noteFreqs = {
            'A4':440,'C5':523.25,'E5':659.25,'A5':880,
            'F4':349.23,'C4':261.63,'E4':329.63,'G4':392,
            'B4':493.88,'D5':587.33,'F5':698.46,'G5':783.99
        };

        let leadTime = t;
        leadPattern.forEach(note => {
            const freq = noteFreqs[note] || 440;
            const dur = sixteenth;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, leadTime);
            // Gentle filter sweep gives TRON shimmer
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2800, leadTime);
            filter.frequency.exponentialRampToValueAtTime(800, leadTime + dur * 0.9);
            filter.Q.setValueAtTime(2, leadTime);
            gain.gain.setValueAtTime(0.09, leadTime);
            gain.gain.exponentialRampToValueAtTime(0.001, leadTime + dur * 0.85);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            osc.start(leadTime);
            osc.stop(leadTime + dur);
            this.activeNodes.push(osc);
            leadTime += dur;
        });

        // --- KICK (punchy but smooth) ---
        for (let i = 0; i < totalBeats; i++) {
            const kickTime = t + i * beat;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, kickTime);
            osc.frequency.exponentialRampToValueAtTime(35, kickTime + 0.1);
            gain.gain.setValueAtTime(0.28, kickTime);
            gain.gain.exponentialRampToValueAtTime(0.001, kickTime + 0.15);
            osc.connect(gain);
            gain.connect(master);
            osc.start(kickTime);
            osc.stop(kickTime + 0.16);
            this.activeNodes.push(osc);
        }

        // --- SNARE (layered noise + body, on beats 2 and 4) ---
        for (let i = 0; i < totalBeats; i++) {
            if (i % 4 === 2 || i % 4 === 0) continue; // only on 2 and 4
            const snareTime = t + i * beat;
            // Noise burst
            const bufSize = this.ctx.sampleRate * 0.06;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let s = 0; s < bufSize; s++) data[s] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            const nGain = this.ctx.createGain();
            const nFilter = this.ctx.createBiquadFilter();
            noise.buffer = buf;
            nFilter.type = 'bandpass';
            nFilter.frequency.value = 5000;
            nFilter.Q.value = 0.8;
            nGain.gain.setValueAtTime(0.08, snareTime);
            nGain.gain.exponentialRampToValueAtTime(0.001, snareTime + 0.06);
            noise.connect(nFilter);
            nFilter.connect(nGain);
            nGain.connect(master);
            noise.start(snareTime);
            noise.stop(snareTime + 0.08);
            this.activeNodes.push(noise);
            // Body tone
            const snareOsc = this.ctx.createOscillator();
            const sGain = this.ctx.createGain();
            snareOsc.type = 'triangle';
            snareOsc.frequency.setValueAtTime(180, snareTime);
            snareOsc.frequency.exponentialRampToValueAtTime(80, snareTime + 0.04);
            sGain.gain.setValueAtTime(0.12, snareTime);
            sGain.gain.exponentialRampToValueAtTime(0.001, snareTime + 0.05);
            snareOsc.connect(sGain);
            sGain.connect(master);
            snareOsc.start(snareTime);
            snareOsc.stop(snareTime + 0.06);
            this.activeNodes.push(snareOsc);
        }

        // --- HI-HAT (softer, filtered noise on off-eighths) ---
        for (let i = 0; i < totalBeats * 2; i++) {
            if (i % 2 === 1) {
                const hatTime = t + i * eighth;
                const bufSize = this.ctx.sampleRate * 0.025;
                const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let s = 0; s < bufSize; s++) data[s] = Math.random() * 2 - 1;
                const noise = this.ctx.createBufferSource();
                const nGain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                noise.buffer = buf;
                filter.type = 'highpass';
                filter.frequency.value = 8000;
                nGain.gain.setValueAtTime(0.035, hatTime);
                nGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.025);
                noise.connect(filter);
                filter.connect(nGain);
                nGain.connect(master);
                noise.start(hatTime);
                noise.stop(hatTime + 0.03);
                this.activeNodes.push(noise);
            }
        }

        // Total duration and auto-loop/callback
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
