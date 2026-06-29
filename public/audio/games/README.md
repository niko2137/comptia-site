# Game Music System

## How It Works

Each game checks for a background music file in this folder. Files must follow the naming convention:

```
Game-Name-music.js
```

### Naming Examples:
- `Neon-Circuit-Dash-music.js` → plays in Neon Circuit Dash
- `Maze-Runner-music.js` → plays in Maze Runner
- `Memory-Overflow-music.js` → plays in Memory Overflow
- `Cable-Match-music.js` → plays in Cable Match
- `Jeopardy-music.js` → plays in Jeopardy

### File Format:
Music files are generated using [SoundBox](https://sb.bitsnbites.eu/) — a tiny browser-based music tracker.

Each file should define a `song` variable with SoundBox format data:

```javascript
var song = {
  songData: [ /* instrument definitions */ ],
  rowLen: 5513,
  patternLen: 32,
  endPattern: 14,
  numChannels: 7
};
```

### How Games Load Music:
Games include this snippet to auto-detect and play background music:

```javascript
// Music loader - checks for /js/music/Game-Name-music.js
(function loadGameMusic() {
  const gameName = document.title.split('—')[0].trim().replace(/\s+/g, '-');
  const script = document.createElement('script');
  script.src = '../js/music/' + gameName + '-music.js';
  script.onload = function() {
    if (window.song) {
      // Initialize SoundBox player and start music
      window.gameMusic = new CPlayer();
      window.gameMusic.init(window.song);
      window.gameMusic.generate();
      // Wait for generation, then play
      var checkReady = setInterval(function() {
        if (window.gameMusic.generate() >= 1) {
          clearInterval(checkReady);
          var wave = window.gameMusic.createWave();
          var audio = document.createElement('audio');
          audio.src = URL.createObjectURL(new Blob([wave], {type: 'audio/wav'}));
          audio.loop = true;
          audio.volume = 0.3;
          window.gameMusicAudio = audio;
          // Don't auto-play - wait for user interaction
          document.addEventListener('click', function playOnce() {
            audio.play().catch(function(){});
            document.removeEventListener('click', playOnce);
          }, { once: true });
        }
      }, 200);
    }
  };
  script.onerror = function() { /* No music file found - silent fail */ };
  document.head.appendChild(script);
})();
```

### Creating Music:
1. Go to https://sb.bitsnbites.eu/
2. Create your track (keep it loopable, 15-30 seconds)
3. Export as JavaScript
4. Save as `Game-Name-music.js` in this folder
5. The game will auto-detect it on next load

### Muting:
All games have a mute button. When muted:
```javascript
if (window.gameMusicAudio) window.gameMusicAudio.pause();
```
When unmuted:
```javascript
if (window.gameMusicAudio) window.gameMusicAudio.play();
```
