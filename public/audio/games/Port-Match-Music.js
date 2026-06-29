class PortMatchMusic {
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

        const tempo = 100;
        const beat = 60 / tempo;
        const eighth = beat / 2;

        const master = this.ctx.createGain();
        master.gain.setValueAtTime(0.20, this.ctx.currentTime);
        master.connect(this.ctx.destination);

        const t = this.ctx.currentTime + 0.05;

        // Chill ambient pad - triangle wave chords (C major / Am feel)
        const chords = [
            {notes: [261.63, 329.63, 392], dur: 4},  // C major
            {notes: [220, 261.63, 329.63], dur: 4},   // Am
            {notes: [174.61, 220, 261.63], dur: 4},   // F
            {notes: [196, 246.94, 293.66], dur: 4}    // G
        ];

        let chordTime = t;
        chords.forEach(chord => {
            const dur = chord.dur * beat;
            chord.notes.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, chordTime);
                gain.gain.setValueAtTime(0.08, chordTime);
                gain.gain.setValueAtTime(0.08, chordTime + dur * 0.7);
                gain.gain.linearRampToValueAtTime(0.001, chordTime + dur);
                osc.connect(gain); gain.connect(master);
                osc.start(chordTime); osc.stop(chordTime + dur);
                this.activeNodes.push(osc);
            });
            chordTime += dur;
        });

        // Soft plucked melody - sine wave with fast decay
        const melodyNotes = [
            ['E5', 1], ['D5', 1], ['C5', 2],
            ['E5', 1], ['D5', 1], ['C5', 1], ['B4', 1],
            ['A4', 1], ['C5', 1], ['E5', 2],
            ['D5', 1], ['B4', 1], ['G4', 1], ['A4', 1]
        ];
        const noteFreqs = {
            'G4':392,'A4':440,'B4':493.88,'C5':523.25,
            'D5':587.33,'E5':659.25,'F5':698.46
        };

        let melTime = t;
        melodyNotes.forEach(([note, beats]) => {
            const freq = noteFreqs[note] || 440;
            const dur = beats * beat;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, melTime);
            gain.gain.setValueAtTime(0.12, melTime);
            gain.gain.exponentialRampToValueAtTime(0.001, melTime + dur * 0.9);
            osc.connect(gain); gain.connect(master);
            osc.start(melTime); osc.stop(melTime + dur);
            this.activeNodes.push(osc);
            melTime += dur;
        });

        // Gentle bass - low sine
        const bassNotes = [
            ['C2', 4], ['A1', 4], ['F2', 4], ['G2', 4]
        ];
        const bassFreqs = {'C2':65.41,'A1':55,'F2':87.31,'G2':98};

        let bassTime = t;
        bassNotes.forEach(([note, beats]) => {
            const freq = bassFreqs[note] || 65;
            const dur = beats * beat;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, bassTime);
            gain.gain.setValueAtTime(0.10, bassTime);
            gain.gain.setValueAtTime(0.10, bassTime + dur * 0.8);
            gain.gain.linearRampToValueAtTime(0.001, bassTime + dur);
            osc.connect(gain); gain.connect(master);
            osc.start(bassTime); osc.stop(bassTime + dur);
            this.activeNodes.push(osc);
            bassTime += dur;
        });

        // Total duration
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
