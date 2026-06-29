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

        const tempo = 138;
        const beat = 60 / tempo;
        const eighth = beat / 2;
        const sixteenth = beat / 4;

        const master = this.ctx.createGain();
        master.gain.setValueAtTime(0.22, this.ctx.currentTime);
        master.connect(this.ctx.destination);

        const t = this.ctx.currentTime + 0.05;

        // Bass line - driving square wave (Am - F - C - G progression, 2 bars repeated)
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
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, bassTime);
            gain.gain.setValueAtTime(0.18, bassTime);
            gain.gain.setValueAtTime(0.18, bassTime + dur - 0.02);
            gain.gain.linearRampToValueAtTime(0.001, bassTime + dur);
            osc.connect(gain); gain.connect(master);
            osc.start(bassTime); osc.stop(bassTime + dur);
            this.activeNodes.push(osc);
            bassTime += dur;
        });

        // Lead arpeggio - sawtooth, fast sixteenth notes
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
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, leadTime);
            gain.gain.setValueAtTime(0.06, leadTime);
            gain.gain.exponentialRampToValueAtTime(0.001, leadTime + dur * 0.8);
            osc.connect(gain); gain.connect(master);
            osc.start(leadTime); osc.stop(leadTime + dur);
            this.activeNodes.push(osc);
            leadTime += dur;
        });

        // Kick drum - on each beat
        const totalBeats = 16;
        for (let i = 0; i < totalBeats; i++) {
            const kickTime = t + i * beat;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, kickTime);
            osc.frequency.exponentialRampToValueAtTime(30, kickTime + 0.08);
            gain.gain.setValueAtTime(0.25, kickTime);
            gain.gain.exponentialRampToValueAtTime(0.001, kickTime + 0.12);
            osc.connect(gain); gain.connect(master);
            osc.start(kickTime); osc.stop(kickTime + 0.12);
            this.activeNodes.push(osc);
        }

        // Hi-hat - off-beats (8th note off-beats)
        for (let i = 0; i < totalBeats * 2; i++) {
            if (i % 2 === 1) {
                const hatTime = t + i * eighth;
                const bufSize = this.ctx.sampleRate * 0.03;
                const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let s = 0; s < bufSize; s++) data[s] = Math.random() * 2 - 1;
                const noise = this.ctx.createBufferSource();
                const nGain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();
                noise.buffer = buf;
                filter.type = 'highpass'; filter.frequency.value = 9000;
                nGain.gain.setValueAtTime(0.05, hatTime);
                nGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.03);
                noise.connect(filter); filter.connect(nGain); nGain.connect(master);
                noise.start(hatTime); noise.stop(hatTime + 0.04);
                this.activeNodes.push(noise);
            }
        }

        // Total duration and auto-loop/callback
        const totalDuration = totalBeats * beat;
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
