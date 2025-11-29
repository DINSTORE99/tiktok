// Ambil elemen dari HTML
const urlInput = document.getElementById('url');
const result = document.getElementById('result');
const statusText = document.getElementById('statusText');
const statusIndicator = document.querySelector('.status-indicator');
const downloadForm = document.getElementById('download-form');
const loader = document.getElementById('loader');

// API config
const API_BASE = 'https://api.yydz.biz.id/api/download/tiktok';
const API_KEY = 'kZNc2Nu';

/* ===============================
   Fungsi Status
================================*/
function setStatus(text, type = 'idle') {
  statusText.textContent = text;

  statusIndicator.classList.remove('idle', 'loading', 'success', 'error');
  statusIndicator.classList.add(type);

  const iconMap = {
    idle: 'fas fa-clock',
    loading: 'fas fa-spinner fa-spin',
    success: 'fas fa-check',
    error: 'fas fa-exclamation-circle'
  };

  const statusIcon = statusIndicator.querySelector('.status-icon i');
  statusIcon.className = iconMap[type] || 'fas fa-clock';
}

/* ===============================
   Safe Text
================================*/
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtmlAttr(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&/g, '&amp;');
}

/* ===============================
   Error & Success UI
================================*/
function showError(message, detail = '') {
  loader.style.display = "none";

  result.innerHTML = `
    <div class="alert alert-error">
      <i class="fas fa-exclamation-circle"></i>
      <div>
        <h4>Gagal!</h4>
        <p>${escapeHtml(message)}</p>
        ${detail ? `<p class="alert-detail">${escapeHtml(detail)}</p>` : ''}
      </div>
    </div>
  `;
}

function showVideoLink(url) {
  loader.style.display = "none";

  result.innerHTML = `
    <div class="alert alert-success">
      <i class="fas fa-check-circle"></i>
      <div>
        <h4>Berhasil!</h4>
        <p>Klik tombol di bawah untuk mengunduh video.</p>
      </div>
    </div>
    <a 
      class="btn btn-download-link" 
      href="${escapeHtmlAttr(url)}" 
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fas fa-download"></i> Unduh Video Sekarang
    </a>
  `;

  setStatus("Selesai", "success");
}

/* ===============================
   Cari URL video otomatis
================================*/
function findFirstUrlInObject(obj) {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    for (const v of obj) {
      const found = findFirstUrlInObject(v);
      if (found) return found;
    }
  }

  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string' && val.startsWith("http")) return val;
    if (typeof val === 'object') {
      const found = findFirstUrlInObject(val);
      if (found) return found;
    }
  }

  return null;
}

/* ===============================
   Handler DOWNLOAD
================================*/
async function handleDownload(e) {
  e.preventDefault();

  const rawUrl = urlInput.value.trim();
  result.innerHTML = "";

  // Reset UI
  setStatus("Memeriksa link...", "idle");
  loader.style.display = "none";

  if (!rawUrl) {
    showError("Masukkan link TikTok terlebih dahulu!");
    setStatus("Error", "error");
    return;
  }

  if (!/tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(rawUrl)) {
    showError("Link bukan dari TikTok!", "Contoh: https://vt.tiktok.com/...");
    setStatus("Link tidak valid", "error");
    return;
  }

  try {
    setStatus("Loading...", "loading");
    loader.style.display = "block";

    const apiUrl = `${API_BASE}?url=${encodeURIComponent(rawUrl)}&apikey=${API_KEY}`;

    const res = await fetch(apiUrl);

    if (!res.ok) {
      showError("Gagal memanggil API!", `${res.status} - ${res.statusText}`);
      setStatus("Error API", "error");
      return;
    }

    const data = await res.json();

    loader.style.display = "none";

    if (!data || !data.result) {
      const autoUrl = findFirstUrlInObject(data);
      if (autoUrl) {
        showVideoLink(autoUrl);
        return;
      }

      showError("Tidak ada link unduh ditemukan!");
      setStatus("Error", "error");
      return;
    }

    showVideoLink(data.result.video_no_watermark);

  } catch (err) {
    loader.style.display = "none";
    showError("Terjadi kesalahan jaringan!", err.message);
    setStatus("Gagal", "error");
  }
}

/* ===============================
   EVENT LISTENER
================================*/
downloadForm.removeEventListener("submit", handleDownload); // cegah duplikasi
downloadForm.addEventListener("submit", handleDownload);

setStatus("Menunggu link TikTok...", "idle");
