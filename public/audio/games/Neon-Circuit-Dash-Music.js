// Old-school arcade space game music loop
// Retro chiptune style - driving bass, arpeggiated lead, punchy drums
// Compatible with SoundBox CPlayer

var song = {
  songData: [
    { // Instrument 0 - Punchy Bass (square wave, short decay)
      i: [
      1, // OSC1_WAVEFORM (square)
      200, // OSC1_VOL
      104, // OSC1_SEMI
      0, // OSC1_XENV
      1, // OSC2_WAVEFORM
      200, // OSC2_VOL
      104, // OSC2_SEMI
      12, // OSC2_DETUNE
      0, // OSC2_XENV
      0, // NOISE_VOL
      4, // ENV_ATTACK
      8, // ENV_SUSTAIN
      30, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      0, // LFO_WAVEFORM
      0, // LFO_AMT
      0, // LFO_FREQ
      0, // LFO_FX_FREQ
      2, // FX_FILTER
      220, // FX_FREQ
      40, // FX_RESONANCE
      1, // FX_DIST
      39, // FX_DRIVE
      0, // FX_PAN_AMT
      0, // FX_PAN_FREQ
      0, // FX_DELAY_AMT
      0 // FX_DELAY_TIME
      ],
      // Patterns
      p: [1,2,1,2,1,2,1,2,3,4,3,4,1,2,1,2],
      // Columns
      c: [
        {n: [123,,,,123,,,,123,,,,123,,135,,123,,,,123,,,,123,,,,123,,130,,135],
         f: []},
        {n: [128,,,,128,,,,128,,,,128,,140,,128,,,,128,,,,128,,,,128,,135,,140],
         f: []},
        {n: [123,,,,123,,123,,,,123,,123,,135,,123,,,,123,,123,,,,123,,123,,130],
         f: []},
        {n: [128,,,,128,,128,,,,128,,128,,140,,128,,,,128,,128,,,,128,,128,,135],
         f: []}
      ]
    },
    { // Instrument 1 - Arpeggio Lead (saw wave, fast arp)
      i: [
      2, // OSC1_WAVEFORM (saw)
      160, // OSC1_VOL
      128, // OSC1_SEMI
      0, // OSC1_XENV
      2, // OSC2_WAVEFORM
      160, // OSC2_VOL
      128, // OSC2_SEMI
      6, // OSC2_DETUNE
      0, // OSC2_XENV
      0, // NOISE_VOL
      4, // ENV_ATTACK
      6, // ENV_SUSTAIN
      18, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      0, // LFO_WAVEFORM
      0, // LFO_AMT
      0, // LFO_FREQ
      0, // LFO_FX_FREQ
      2, // FX_FILTER
      200, // FX_FREQ
      100, // FX_RESONANCE
      0, // FX_DIST
      32, // FX_DRIVE
      47, // FX_PAN_AMT
      3, // FX_PAN_FREQ
      35, // FX_DELAY_AMT
      3 // FX_DELAY_TIME
      ],
      // Patterns
      p: [,,1,2,1,2,1,2,3,4,3,4,1,2,1,2],
      // Columns
      c: [
        {n: [147,151,154,147,151,154,159,154,147,151,154,147,151,154,159,154,142,147,151,142,147,151,154,151,142,147,151,142,147,151,154,151],
         f: []},
        {n: [147,152,156,147,152,156,159,156,147,152,156,147,152,156,159,156,140,144,147,140,144,147,152,147,140,144,147,140,144,147,152,147],
         f: []},
        {n: [147,151,154,159,154,151,147,151,154,159,162,159,154,151,147,144,142,147,151,154,151,147,142,147,151,154,159,154,151,147,142,140],
         f: []},
        {n: [147,152,156,159,156,152,147,152,156,159,163,159,156,152,147,144,140,144,147,152,147,144,140,144,147,152,156,152,147,144,140,137],
         f: []}
      ]
    },
    { // Instrument 2 - Pad/Chord (triangle, long sustain)
      i: [
      3, // OSC1_WAVEFORM (triangle)
      100, // OSC1_VOL
      128, // OSC1_SEMI
      0, // OSC1_XENV
      3, // OSC2_WAVEFORM
      100, // OSC2_VOL
      128, // OSC2_SEMI
      8, // OSC2_DETUNE
      0, // OSC2_XENV
      0, // NOISE_VOL
      80, // ENV_ATTACK
      80, // ENV_SUSTAIN
      120, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      1, // LFO_WAVEFORM
      80, // LFO_AMT
      3, // LFO_FREQ
      1, // LFO_FX_FREQ
      2, // FX_FILTER
      60, // FX_FREQ
      120, // FX_RESONANCE
      0, // FX_DIST
      32, // FX_DRIVE
      80, // FX_PAN_AMT
      2, // FX_PAN_FREQ
      60, // FX_DELAY_AMT
      6 // FX_DELAY_TIME
      ],
      // Patterns
      p: [,,,,1,1,2,2,1,1,2,2,1,1,2,2],
      // Columns
      c: [
        {n: [135,,,,,,,,,,,,,,,,130],
         f: []},
        {n: [133,,,,,,,,,,,,,,,,128],
         f: []}
      ]
    },
    { // Instrument 3 - Kick Drum
      i: [
      0, // OSC1_WAVEFORM (sin)
      255, // OSC1_VOL
      116, // OSC1_SEMI
      79, // OSC1_XENV
      0, // OSC2_WAVEFORM
      255, // OSC2_VOL
      116, // OSC2_SEMI
      0, // OSC2_DETUNE
      79, // OSC2_XENV
      0, // NOISE_VOL
      4, // ENV_ATTACK
      6, // ENV_SUSTAIN
      29, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      0, // LFO_WAVEFORM
      0, // LFO_AMT
      0, // LFO_FREQ
      0, // LFO_FX_FREQ
      2, // FX_FILTER
      11, // FX_FREQ
      0, // FX_RESONANCE
      0, // FX_DIST
      32, // FX_DRIVE
      0, // FX_PAN_AMT
      0, // FX_PAN_FREQ
      0, // FX_DELAY_AMT
      0 // FX_DELAY_TIME
      ],
      // Patterns
      p: [1,1,1,1,1,1,1,1,2,2,2,2,1,1,1,1],
      // Columns
      c: [
        {n: [147,,,,147,,,,147,,,,147,,,,147,,,,147,,,,147,,,,147],
         f: []},
        {n: [147,,,,147,,,,147,,147,,147,,,,147,,,,147,,,,147,,147,,147,,,147],
         f: []}
      ]
    },
    { // Instrument 4 - Hi-hat (noise)
      i: [
      0, // OSC1_WAVEFORM
      0, // OSC1_VOL
      128, // OSC1_SEMI
      0, // OSC1_XENV
      0, // OSC2_WAVEFORM
      0, // OSC2_VOL
      128, // OSC2_SEMI
      0, // OSC2_DETUNE
      0, // OSC2_XENV
      80, // NOISE_VOL
      4, // ENV_ATTACK
      4, // ENV_SUSTAIN
      20, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      0, // LFO_WAVEFORM
      60, // LFO_AMT
      4, // LFO_FREQ
      1, // LFO_FX_FREQ
      1, // FX_FILTER
      200, // FX_FREQ
      180, // FX_RESONANCE
      0, // FX_DIST
      32, // FX_DRIVE
      60, // FX_PAN_AMT
      5, // FX_PAN_FREQ
      0, // FX_DELAY_AMT
      0 // FX_DELAY_TIME
      ],
      // Patterns
      p: [,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      // Columns
      c: [
        {n: [,,147,,,,147,,,,147,,,,147,,147,,147,,,,147,,,,147,,,,147,,147],
         f: []}
      ]
    },
    { // Instrument 5 - Snare
      i: [
      0, // OSC1_WAVEFORM
      0, // OSC1_VOL
      128, // OSC1_SEMI
      0, // OSC1_XENV
      0, // OSC2_WAVEFORM
      0, // OSC2_VOL
      128, // OSC2_SEMI
      0, // OSC2_DETUNE
      0, // OSC2_XENV
      150, // NOISE_VOL
      3, // ENV_ATTACK
      5, // ENV_SUSTAIN
      30, // ENV_RELEASE
      0, // ENV_EXP_DECAY
      0, // ARP_CHORD
      0, // ARP_SPEED
      0, // LFO_WAVEFORM
      0, // LFO_AMT
      0, // LFO_FREQ
      0, // LFO_FX_FREQ
      2, // FX_FILTER
      150, // FX_FREQ
      80, // FX_RESONANCE
      2, // FX_DIST
      32, // FX_DRIVE
      0, // FX_PAN_AMT
      0, // FX_PAN_FREQ
      20, // FX_DELAY_AMT
      3 // FX_DELAY_TIME
      ],
      // Patterns
      p: [,1,1,1,1,1,1,1,2,2,2,2,1,1,1,1],
      // Columns
      c: [
        {n: [,,,,,,,,147,,,,,,,,,,,,,,,,147],
         f: []},
        {n: [,,,,,,,,147,,,,,,,147,,,,,,,,,147,,,,,,147],
         f: []}
      ]
    }
  ],
  rowLen: 5513,   // In sample lengths (~140 BPM)
  patternLen: 32,  // Rows per pattern
  endPattern: 15,  // End pattern
  numChannels: 6  // Number of channels
};
