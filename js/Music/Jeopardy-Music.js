class JeopardyTheme {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.activeNodes = [];
        this.onFinishedCallback = null;

        // Musical frequencies dictionary mapped to raw Hz numbers
        this.NOTES = {
            'C3': 130.81, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
        };

        // Channel 1: The main melody array [Note Name, Beat Count]
        this.melody = [
            ['G4', 1], ['C5', 1], ['G4', 1], ['C4', 1], ['G4', 1], ['C5', 1], ['G4', 1], ['C5', 1],
            ['G4', 1], ['C5', 1], ['G4', 1], ['C5', 1], ['E5', 1], ['D5', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5],
            ['G4', 1], ['C5', 1], ['G4', 1], ['C4', 1], ['G4', 1], ['C5', 1], ['G4', 2],
            ['C5', 1], ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['G4', 1], ['B4', 1], ['C5', 2]
        ];

        // Channel 2: The walking bass line
        this.bassLine = [
            ['C3', 1], ['G3', 1], ['C3', 1], ['E3', 1], ['C3', 1], ['G3', 1], ['C3', 1], ['E3', 1],
            ['C3', 1], ['G3', 1], ['C3', 1], ['E3', 1], ['C3', 1], ['D3', 1], ['E3', 1], ['F3', 1],
            ['C3', 1], ['G3', 1], ['C3', 1], ['E3', 1], ['C3', 1], ['G3', 1], ['C3', 2],
            ['F3', 1], ['F3', 1], ['E3', 1], ['E3', 1], ['D3', 1], ['G3', 1], ['C3', 2]
        ];
    }

    /**
     * Starts playing the song sequence.
     * @param {Function} onFinished - Optional callback function to fire when the song finishes.
     */
    start(onFinished = null) {
        if (this.isPlaying) return;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.isPlaying = true;
        this.activeNodes = [];
        this.onFinishedCallback = onFinished;
        
        const tempo = 130; 
        const beatDuration = 60 / tempo;
        
        // Create a Master Gain node to mix down channels and protect speakers
        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        masterGain.connect(this.ctx.destination);

        // --- FUNCTION TO SEQUENCE A CHANNEL ---
        const scheduleTrack = (notesArray, waveType, basicVolume) => {
            let trackTimeline = this.ctx.currentTime + 0.1; // Shared anchor starting point

            notesArray.forEach(([noteName, beats]) => {
                const freq = this.NOTES[noteName];
                const noteDuration = beats * beatDuration;

                if (freq) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();

                    osc.type = waveType;
                    osc.frequency.setValueAtTime(freq, trackTimeline);

                    // Articulation: fast ramp setup to dodge aggressive digital audio pops
                    gain.gain.setValueAtTime(basicVolume, trackTimeline);
                    gain.gain.setValueAtTime(basicVolume, trackTimeline + noteDuration - 0.04);
                    gain.gain.linearRampToValueAtTime(0.0001, trackTimeline + noteDuration);

                    osc.connect(gain);
                    gain.connect(masterGain);

                    osc.start(trackTimeline);
                    osc.stop(trackTimeline + noteDuration);

                    // Keep track of nodes so we can forcefully stop them if requested
                    this.activeNodes.push(osc);
                }
                
                trackTimeline += noteDuration;
            });
            return trackTimeline;
        };

        // --- TRIGGER CHANNELS IN PARALLEL ---
        scheduleTrack(this.melody, 'triangle', 0.4);
        const endTime = scheduleTrack(this.bassLine, 'square', 0.15);

        // Automatically clean up context and fire callback when song is done
        const totalDurationMs = (endTime - this.ctx.currentTime) * 1000;
        this.finishTimeout = setTimeout(() => {
            this.stop();
        }, totalDurationMs);
    }

    /**
     * Instantly halts playback and closes the underlying audio pipeline.
     */
    stop() {
        if (!this.isPlaying) return;

        clearTimeout(this.finishTimeout);
        
        // Stop all active oscillators immediately
        this.activeNodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        this.activeNodes = [];

        // Close down context hardware to free memory
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
        }
        
        this.isPlaying = false;

        // Execute the finish callback if one was provided
        if (typeof this.onFinishedCallback === 'function') {
            this.onFinishedCallback();
        }
    }
}
