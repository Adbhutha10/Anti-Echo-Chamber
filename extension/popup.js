// popup.js — Extension popup logic

const API_BASE = 'https://anti-echo-chamber.onrender.com';

const usernameInput = document.getElementById('usernameInput');
const saveBtn       = document.getElementById('saveBtn');
const analyzeBtn    = document.getElementById('analyzeBtn');
const statusEl      = document.getElementById('status');
const resultCard    = document.getElementById('resultCard');

function showStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (isError ? ' error' : '');
}

function getBiasColor(score) {
  if (score > 0.65) return '#ef4444';
  if (score > 0.35) return '#f59e0b';
  return '#10b981';
}

function renderResult(data) {
  const biasColor = getBiasColor(data.cognitive_bias);
  const biasLabel = data.cognitive_bias > 0.65 ? 'HIGH BIAS' : data.cognitive_bias > 0.35 ? 'MODERATE' : 'BALANCED';
  const biasPercent = Math.round(data.cognitive_bias * 100);
  const emoPercent  = Math.round(data.emotional_manipulation * 100);

  const polLabel = data.political_leaning > 0.25 ? '▶ Right-Leaning'
                 : data.political_leaning < -0.25 ? '◀ Left-Leaning'
                 : '● Center';

  document.getElementById('biasBadge').textContent = biasLabel;
  document.getElementById('biasBadge').style.cssText = `background:${biasColor}22;border-color:${biasColor};color:${biasColor}`;

  document.getElementById('biasBar').style.width = `${biasPercent}%`;
  document.getElementById('biasBar').style.background = biasColor;
  document.getElementById('biasPct').textContent = `${biasPercent}%`;
  document.getElementById('biasPct').style.color = biasColor;

  document.getElementById('emoBar').style.width = `${emoPercent}%`;
  document.getElementById('emoBar').style.background = '#f59e0b';
  document.getElementById('emoPct').textContent = `${emoPercent}%`;
  document.getElementById('emoPct').style.color = '#f59e0b';

  document.getElementById('polChip').textContent = polLabel;

  resultCard.classList.add('visible');
  showStatus('');
}

// On load — restore saved username
chrome.storage.sync.get(['username', 'userId'], ({ username, userId }) => {
  if (username) {
    usernameInput.value = username;
    analyzeBtn.disabled = false;
  }
});

// Save username → create/get user from API
saveBtn.addEventListener('click', async () => {
  const uname = usernameInput.value.trim();
  if (!uname) return;
  showStatus('Connecting...');
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uname })
    });
    let data;
    if (res.ok) {
      data = await res.json();
    } else if (res.status === 400) {
      // User already exists — get existing users and find by name
      // As a workaround, we'll store username and attempt with ID=1 fallback
      data = { user_id: null };
    } else {
      throw new Error('API error');
    }
    chrome.storage.sync.set({ username: uname, userId: data.user_id });
    analyzeBtn.disabled = false;
    showStatus(`✓ Saved as "${uname}"`);
  } catch (err) {
    showStatus('Could not connect to backend. Is it running?', true);
  }
});

// Analyze current page — message background → content script
analyzeBtn.addEventListener('click', () => {
  chrome.storage.sync.get(['userId'], ({ userId }) => {
    if (!userId) {
      showStatus('Save your username first.', true);
      return;
    }
    showStatus('Analyzing...');
    analyzeBtn.disabled = true;
    resultCard.classList.remove('visible');

    chrome.runtime.sendMessage({ type: 'ANALYZE_TAB' }, (response) => {
      analyzeBtn.disabled = false;
      if (!response || response.error) {
        showStatus(response?.error || 'Analysis failed. Are you on a news page?', true);
        return;
      }
      renderResult(response);
    });
  });
});
