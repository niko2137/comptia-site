/**
 * HighScores — namespaced localStorage high-score helper for CompTIA A+ Study Hub games.
 * Each game gets its own top-10 list under a shared key prefix, plus a
 * reusable "Top Scores" panel renderer so every new/reworked game looks consistent.
 */
const HighScores = (() => {
    const PREFIX = 'compTIA_';

    function storageKey(gameId) {
        return PREFIX + gameId + '_scores';
    }

    function getScores(gameId) {
        try {
            const raw = JSON.parse(localStorage.getItem(storageKey(gameId)));
            return Array.isArray(raw) ? raw : [];
        } catch (e) {
            return [];
        }
    }

    // opts: { lowerIsBetter: bool, label: string (e.g. player initials), extra: any }
    function submitScore(gameId, score, opts = {}) {
        const entry = {
            score,
            date: new Date().toISOString(),
            label: opts.label || '',
            extra: opts.extra
        };
        let scores = getScores(gameId);
        scores.push(entry);
        scores.sort((a, b) => opts.lowerIsBetter ? a.score - b.score : b.score - a.score);
        scores = scores.slice(0, 10);
        try { localStorage.setItem(storageKey(gameId), JSON.stringify(scores)); } catch (e) {}
        return scores;
    }

    function isHighScore(gameId, score, lowerIsBetter = false) {
        const scores = getScores(gameId);
        if (scores.length < 10) return true;
        const worst = scores[scores.length - 1].score;
        return lowerIsBetter ? score < worst : score > worst;
    }

    function clear(gameId) {
        localStorage.removeItem(storageKey(gameId));
    }

    // Seeds a permanent "Pip" entry as a default target score, so the board
    // is never empty for a first-time player. Idempotent — does nothing once
    // a Pip entry already exists (players can beat it/push it off the top 10
    // like any other real entry).
    function ensureSeeded(gameId, pipScore, opts = {}) {
        const scores = getScores(gameId);
        if (scores.some(s => s.label === 'Pip')) return scores;
        scores.push({
            score: pipScore,
            date: new Date().toISOString(),
            label: 'Pip',
            extra: opts.extra
        });
        scores.sort((a, b) => opts.lowerIsBetter ? a.score - b.score : b.score - a.score);
        const trimmed = scores.slice(0, 10);
        try { localStorage.setItem(storageKey(gameId), JSON.stringify(trimmed)); } catch (e) {}
        return trimmed;
    }

    function injectStyles() {
        if (document.getElementById('hs-styles')) return;
        const style = document.createElement('style');
        style.id = 'hs-styles';
        style.textContent = `
.hs-panel{background:rgba(10,15,30,0.85);border:1px solid rgba(91,155,213,0.3);border-radius:10px;padding:14px 16px;font-family:system-ui,-apple-system,sans-serif;}
.hs-title{margin:0 0 10px;font-size:0.95em;color:#5b9bd5;font-weight:700;letter-spacing:0.3px;}
.hs-list{display:flex;flex-direction:column;}
.hs-row{display:flex;align-items:center;gap:10px;padding:5px 0;font-size:0.85em;color:#e2e8f0;border-bottom:1px solid rgba(255,255,255,0.08);}
.hs-row:last-child{border-bottom:none;}
.hs-row.hs-new{color:#f39c12;font-weight:700;}
.hs-rank{color:#f39c12;font-weight:700;min-width:26px;}
.hs-name{flex:1;font-weight:600;}
.hs-score{font-weight:600;font-family:'Consolas','Courier New',monospace;}
.hs-date{color:#94a3b8;font-size:0.8em;}
.hs-empty{color:#94a3b8;font-size:0.85em;padding:8px 0;text-align:center;}
`;
        document.head.appendChild(style);
    }

    function renderPanel(gameId, opts = {}) {
        injectStyles();
        const scores = getScores(gameId);
        const unit = opts.unit || '';
        const title = opts.title || '\u{1F3C6} Top Scores';
        const highlightIndex = typeof opts.highlightIndex === 'number' ? opts.highlightIndex : -1;
        const rows = scores.length
            ? scores.map((s, i) => `<div class="hs-row${i === highlightIndex ? ' hs-new' : ''}"><span class="hs-rank">#${i + 1}</span><span class="hs-name">${s.label || 'Anonymous'}</span><span class="hs-score">${s.score}${unit}</span><span class="hs-date">${new Date(s.date).toLocaleDateString()}</span></div>`).join('')
            : '<div class="hs-empty">No scores yet — be the first!</div>';
        return `<div class="hs-panel"><h3 class="hs-title">${title}</h3><div class="hs-list">${rows}</div></div>`;
    }

    return { getScores, submitScore, isHighScore, clear, ensureSeeded, renderPanel, injectStyles };
})();
