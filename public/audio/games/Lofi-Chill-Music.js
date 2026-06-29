class LofiChillMusic {
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

        const tempo = 72;
        const beat = 60 / tempo;
        const half = beat * 2;

        const master = this.ctx.createGain();
        master.gain.setValueAtTime(0.18, this.ctx.currentTime);
        master.connect(this.ctx.destination);

        const t = this.ctx.currentTime + 0.05;

        // Warm pad chords - triangle wave, long sustain (lofi jazzy)
        // Progression: Dmaj7 - Gmaj7 - Em7 - A7
        const chords = [
            {notes: [146.83, 185.00, 220.00, 277.18], dur: 4}, // Dmaj7 (D3,F#3,A3,C#4)
            {notes: [196.00, 246.94, 293.66, 369.99], dur: 4}, // Gmaj7 (G3,B3,D4,F#4)
            {notes: [164.81, 196.00, 246.94, 293.66], dur: 4}, // Em7 (E3,G3,B3,D4)
            {notes: [220.00, 277.18, 329.63, 392.00], dur: 4}  // A7 (A3,C#4,E4,G4)
        ];

        let chordTime = t;
        chords.forEach(chord => {
            const dur = chord.dur * beat;
            chord.notes.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, chordTime);
                // Soft attack, long sustain, gentle release
                gain.gain.setValueAtTime(0, chordTime);
                gain.gain.linearRampToValueAtTime(0.06, chordTime + 0.3);
                gain.gain.setValueAtTime(0.06, chordTime + dur * 0.75);
                gain.gain.linearRampToValueAtTime(0.001, chordTime + dur);
                osc.connect(gain); gain.connect(master);
                osc.start(chordTime); osc.stop(chordTime + dur + 0.1);
                this.activeNodes.push(osc);
            });
            chordTime += dur;
        });

        // Soft Rhodes-style melody - sine with gentle decay
        const melodyNotes = [
            ['F#4', 1.5], ['E4', 0.5], ['D4', 1], ['_', 1],
            ['B4', 1], ['A4', 0.5], ['G4', 0.5], ['F#4', 1], ['_', 1],
            ['E4', 1], ['G4', 1], ['B4', 1.5], ['A4', 0.5],
            ['D4', 1], ['E4', 1], ['F#4', 1.5], ['_', 0.5]
        ];
        const noteFreqs = {
            'C4':261.63,'D4':293.66,'E4':329.63,'F#4':369.99,
            'G4':392.00,'A4':440.00,'B4':493.88,'C5':523.25,
            'D5':587.33
        };

        let melTime = t;
        melodyNotes.forEach(([note, beats]) => {
            const dur = beats * beat;
            if (note !== '_') {
                const freq = noteFreqs[note] || 440;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, melTime);
                gain.gain.setValueAtTime(0, melTime);
                gain.gain.linearRampToValueAtTime(0.09, melTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, melTime + dur * 0.85);
                osc.connect(gain); gain.connect(master);
                osc.start(melTime); osc.stop(melTime + dur);
                this.activeNodes.push(osc);
            }
            melTime += dur;
        });

        // Sub bass - very low sine, gentle
        const bassNotes = [
            ['D2', 4], ['G2', 4], ['E2', 4], ['A2', 4]
        ];
        const bassFreqs = {'D2':73.42,'G2':98.00,'E2':82.41,'A2':110.00};

        let bassTime = t;
        bassNotes.forEach(([note, beats]) => {
            const freq = bassFreqs[note] || 73;
            const dur = beats * beat;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, bassTime);
            gain.gain.setValueAtTime(0, bassTime);
            gain.gain.linearRampToValueAtTime(0.10, bassTime + 0.1);
            gain.gain.setValueAtTime(0.10, bassTime + dur * 0.8);
            gain.gain.linearRampToValueAtTime(0.001, bassTime + dur);
            osc.connect(gain); gain.connect(master);
            osc.start(bassTime); osc.stop(bassTime + dur + 0.05);
            this.activeNodes.push(osc);
            bassTime += dur;
        });

        // Soft vinyl crackle (very low noise, filtered)
        const crackleLen = 16 * beat;
        const bufSize = Math.floor(this.ctx.sampleRate * crackleLen);
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (Math.random() > 0.97 ? 1 : 0.02);
        }
        const crackle = this.ctx.createBufferSource();
        const crackleGain = this.ctx.createGain();
        const crackleFilter = this.ctx.createBiquadFilter();
        crackle.buffer = buf;
        crackleFilter.type = 'bandpass';
        crackleFilter.frequency.value = 3000;
        crackleFilter.Q.value = 0.5;
        crackleGain.gain.setValueAtTime(0.015, t);
        crackle.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(master);
        crackle.start(t);
        crackle.stop(t + crackleLen);
        this.activeNodes.push(crackle);

        // Total duration and callback
        const totalBeats = 16;
        const totalMs = totalBeats * beat * 1000;
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
