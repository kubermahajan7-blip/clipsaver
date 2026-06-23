let allItems = [];
let knownIds = new Set();
let searchTerm = '';

const listEl = document.getElementById('list');
const countEl = document.getElementById('count');
const searchEl = document.getElementById('search');
const clearBtn = document.getElementById('clearBtn');
const toastEl = document.getElementById('toast');

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(isoString).toLocaleDateString();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 1100);
}

function render() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = term
    ? allItems.filter(i => i.text.toLowerCase().includes(term))
    : allItems;

  const pinned = filtered.filter(i => i.pinned);
  const recent = filtered.filter(i => !i.pinned);

  countEl.textContent = `${allItems.length} item${allItems.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty">
        <div class="big">∅</div>
        ${term ? 'No matches found.' : 'Copy something to get started.<br>It will show up here automatically.'}
      </div>`;
    return;
  }

  let html = '';
  if (pinned.length) {
    html += `<div class="section-label">Pinned</div>`;
    html += pinned.map(renderItem).join('');
  }
  if (recent.length) {
    html += `<div class="section-label">Recent</div>`;
    html += recent.map(renderItem).join('');
  }
  listEl.innerHTML = html;

  // Attach event listeners after render
  listEl.querySelectorAll('.item').forEach(el => {
    const id = el.dataset.id;
    el.addEventListener('click', (e) => {
      if (e.target.closest('.icon-btn')) return; // handled separately
      const item = allItems.find(i => i.id === id);
      if (item) {
        window.clipAPI.copyToClipboard(item.text);
        showToast('Copied to clipboard');
      }
    });
  });

  listEl.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.closest('.item').dataset.id;
      allItems = await window.clipAPI.togglePin(id);
      render();
    });
  });

  listEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.closest('.item').dataset.id;
      allItems = await window.clipAPI.deleteItem(id);
      render();
    });
  });
}

function renderItem(item) {
  const isFresh = !knownIds.has(item.id);
  return `
    <div class="item ${item.pinned ? 'pinned' : ''} ${isFresh ? 'fresh' : ''}" data-id="${item.id}" title="Click to copy">
      <div class="item-text">${escapeHtml(item.text)}</div>
      <div class="item-meta">
        <span class="item-time">${timeAgo(item.createdAt)}</span>
        <div class="item-actions">
          <button class="icon-btn pin-btn ${item.pinned ? 'pin-active' : ''}" title="${item.pinned ? 'Unpin' : 'Pin'}">${item.pinned ? '★' : '☆'}</button>
          <button class="icon-btn delete-btn" title="Delete">✕</button>
        </div>
      </div>
    </div>`;
}

async function init() {
  allItems = await window.clipAPI.getHistory();
  allItems.forEach(i => knownIds.add(i.id));
  render();

  window.clipAPI.onHistoryUpdated((items) => {
    allItems = items;
    render();
    // mark everything as known after the fresh-pulse animation has had a chance to show
    setTimeout(() => allItems.forEach(i => knownIds.add(i.id)), 1000);
  });
}

searchEl.addEventListener('input', (e) => {
  searchTerm = e.target.value;
  render();
});

clearBtn.addEventListener('click', async () => {
  const ok = confirm('Clear all unpinned history? Pinned items will be kept.');
  if (!ok) return;
  allItems = await window.clipAPI.clearUnpinned();
  render();
});

init();
