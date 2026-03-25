// content.js — Injected into news pages
// Extracts article text and injects a bias overlay into the DOM

const API_BASE = 'http://localhost:8000';
const OVERLAY_ID = 'aec-bias-overlay';

function extractArticleText() {
  // Try common article selectors used by major news sites
  const selectors = [
    'article', '[role="article"]', '.article-body', '.story-body',
    '.post-content', '.entry-content', '.article__body', 'main p'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.length > 200) return el.innerText.slice(0, 3000);
  }
  // Fallback: grab all paragraph text
  return Array.from(document.querySelectorAll('p'))
    .map(p => p.innerText).join(' ').slice(0, 3000);
}

function getBiasColor(score) {
  if (score > 0.65) return '#ef4444';
  if (score > 0.35) return '#f59e0b';
  return '#10b981';
}

function getBiasLabel(score) {
  if (score > 0.65) return 'HIGH BIAS';
  if (score > 0.35) return 'MODERATE';
  return 'BALANCED';
}

function getPoliticalLabel(leaning) {
  if (leaning > 0.25) return '▶ Right-Leaning';
  if (leaning < -0.25) return '◀ Left-Leaning';
  return '● Center';
}

function injectOverlay(data) {
  // Remove existing overlay if present
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  const biasColor = getBiasColor(data.cognitive_bias);
  const biasLabel = getBiasLabel(data.cognitive_bias);
  const polLabel = getPoliticalLabel(data.political_leaning);
  const biasPercent = Math.round(data.cognitive_bias * 100);
  const emoPercent = Math.round(data.emotional_manipulation * 100);

  overlay.innerHTML = `
    <div class="aec-header">
      <span class="aec-logo">👁 Anti-Echo Chamber</span>
      <button class="aec-close" onclick="document.getElementById('${OVERLAY_ID}').remove()">✕</button>
    </div>
    <div class="aec-badge" style="background:${biasColor}22;border-color:${biasColor};color:${biasColor}">${biasLabel}</div>
    <div class="aec-metrics">
      <div class="aec-metric">
        <span class="aec-metric-label">Cognitive Bias</span>
        <div class="aec-bar-track">
          <div class="aec-bar-fill" style="width:${biasPercent}%;background:${biasColor}"></div>
        </div>
        <span class="aec-metric-val" style="color:${biasColor}">${biasPercent}%</span>
      </div>
      <div class="aec-metric">
        <span class="aec-metric-label">Emotional Manipulation</span>
        <div class="aec-bar-track">
          <div class="aec-bar-fill" style="width:${emoPercent}%;background:#f59e0b"></div>
        </div>
        <span class="aec-metric-val" style="color:#f59e0b">${emoPercent}%</span>
      </div>
    </div>
    <div class="aec-politics">${polLabel}</div>
    <a class="aec-dashboard-link" href="http://localhost:5173" target="_blank">Open Dashboard →</a>
  `;

  document.body.appendChild(overlay);
}

function injectLoadingOverlay() {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.innerHTML = `
    <div class="aec-header">
      <span class="aec-logo">👁 Anti-Echo Chamber</span>
      <button class="aec-close" onclick="document.getElementById('${OVERLAY_ID}').remove()">✕</button>
    </div>
    <div class="aec-loading">Analyzing article<span class="aec-dots">...</span></div>
  `;
  document.body.appendChild(overlay);
}

async function analyzeCurrentPage(userId) {
  const text = extractArticleText();
  if (!text || text.length < 100) return { error: 'Not enough article text found.' };

  injectLoadingOverlay();

  try {
    const res = await fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, text })
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    injectOverlay(data);
    return data;
  } catch (err) {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) existing.remove();
    return { error: err.message };
  }
}

// Listen for messages from popup / background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_AND_ANALYZE') {
    chrome.storage.sync.get(['userId'], async ({ userId }) => {
      if (!userId) {
        sendResponse({ error: 'No user ID set. Open the extension popup first.' });
        return;
      }
      const result = await analyzeCurrentPage(userId);
      sendResponse(result);
    });
    return true;
  }
});
