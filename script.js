// Ambil elemen dari HTML (sesuai yang baru)
const urlInput = document.getElementById('url');
const result = document.getElementById('result');
const statusText = document.getElementById('statusText');
const statusIndicator = document.querySelector('.status-indicator'); // Tambah untuk animasi status
const downloadForm = document.getElementById('download-form'); // Gunakan form untuk handling submit

// Konfigurasi API
const API_BASE = 'https://api.yydz.biz.id/api/download/tiktok';
const API_KEY = 'kZNc2Nu'; // Ubah jika API key tidak valid lagi

/**
 * Fungsi untuk mengatur status (teks + gaya animasi)
 * @param {string} text - Teks status
 * @param {string} type - Tipe status: 'idle', 'loading', 'success', 'error'
 */
function setStatus(text, type = 'idle') {
  statusText.textContent = text;
  
  // Hapus semua kelas status lama
  statusIndicator.classList.remove('idle', 'loading', 'success', 'error');
  
  // Tambah kelas status baru
  statusIndicator.classList.add(type);
  
  // Ganti ikon sesuai tipe status
  const statusIcon = statusIndicator.querySelector('.status-icon i');
  const iconMap = {
    idle: 'fas fa-clock',
    loading: 'fas fa-spinner',
    success: 'fas fa-check',
    error: 'fas fa-exclamation-circle'
  };
  
  // Hapus ikon lama dan tambah ikon baru
  statusIcon.className = '';
  statusIcon.classList.add(...iconMap[type].split(' '));
}

/**
 * Fungsi untuk menampilkan pesan error di bagian hasil
 * @param {string} message - Pesan error
 * @param {string} detail - Detail tambahan (opsional)
 */
function showError(message, detail = '') {
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

/**
 * Fungsi untuk menampilkan pesan sukses + link unduh
 * @param {string} url - Link unduh video
 */
function showVideoLink(url) {
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
      rel="noreferrer noopener"
      aria-label="Unduh video TikTok yang sudah diambil linknya"
    >
      <i class="fas fa-download"></i> Unduh Video Sekarang
    </a>
  `;

  setStatus('Selesai', 'success');
}

/**
 * Fungsi untuk mencari link pertama di dalam objek (jika field unduh tidak ditemukan)
 * @param {object} obj - Objek yang akan dicari
 * @returns {string|null} Link yang ditemukan atau null
 */
function findFirstUrlInObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) && obj.length === 0) return null;

  // Cek jika itu array
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findFirstUrlInObject(item);
      if (found) return found;
    }
  }

  // Cek jika itu objek
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      return value;
    }
    if (typeof value === 'object') {
      const found = findFirstUrlInObject(value);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Fungsi untuk meng-escape teks agar aman ditampilkan di HTML
 * @param {string} str - Teks yang akan di-escape
 * @returns {string} Teks yang sudah di-escape
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Fungsi untuk meng-escape teks agar aman digunakan di atribut HTML
 * @param {string} str - Teks yang akan di-escape
 * @returns {string} Teks yang sudah di-escape
 */
function escapeHtmlAttr(str) {
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&/g, '&amp;');
}

/**
 * Handler utama untuk proses unduh
 */
async function handleDownload(e) {
  e.preventDefault(); // Mencegah form reload halaman
  const rawUrl = urlInput.value.trim();
  
  // Reset bagian hasil dan set status awal
  result.innerHTML = '';
  setStatus('Memeriksa link...', 'idle');

  // Validasi input link
  if (!rawUrl) {
    showError('Masukkan link TikTok terlebih dahulu!');
    setStatus('Gagal memeriksa link', 'error');
    return;
  }

  // Cek apakah link itu benar-benar TikTok
  const isTikTokLink = /tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com/i.test(rawUrl);
  if (!isTikTokLink) {
    showError('Link yang dimasukkan bukan link TikTok!', 'Contoh: https://vt.tiktok.com/... atau https://www.tiktok.com/...');
    setStatus('Link tidak valid', 'error');
    return;
  }

  try {
    // Set status loading
    setStatus('Memanggil API...', 'loading');
    const apiUrl = `${API_BASE}?url=${encodeURIComponent(rawUrl)}&apikey=${encodeURIComponent(API_KEY)}`;
    console.log('API URL yang dipanggil:', apiUrl);

    // Panggil API dengan timeout (untuk mencegah tunggu terlalu lama)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout 15 detik
    const res = await fetch(apiUrl, { 
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    console.log('Status respons API:', res.status);

    // Cek jika respons HTTP tidak sukses
    if (!res.ok) {
      const text = await res.text().catch(() => '(Tidak bisa membaca isi respons)');
      const errorMsg = `Terjadi kesalahan HTTP: ${res.status} ${res.statusText}`;
      const detail = res.status === 401 ? 'API key mungkin tidak valid atau kadaluarsa' : 
                     res.status === 404 ? 'Link TikTok tidak ditemukan' : 
                     res.status === 500 ? 'Server API sedang bermasalah' : text;
      
      showError(errorMsg, detail);
      setStatus('Error HTTP', 'error');
      return;
    }

    // Parse data dari respons
    setStatus('Memproses data...', 'loading');
    const contentType = res.headers.get('content-type') || '';
    let data;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text); // Coba parse meskipun tipe bukan JSON
      } catch (parseErr) {
        data = { raw: text };
        console.warn('Gagal parse JSON, menggunakan data mentah:', parseErr);
      }
    }

    console.log('Data yang diproses:', data);
    setStatus('Data diterima', 'idle');

    // Validasi data yang diterima
    if (!data) {
      showError('Respons dari API kosong atau tidak valid.');
      setStatus('Data tidak valid', 'error');
      return;
    }

    const body = data.data || data;
    if (!body) {
      showError('Field "data" tidak ditemukan di respons API.');
      setStatus('Struktur data salah', 'error');
      return;
    }

    // Cari field link unduh
    const unduhList = body.unduh || body.downloads || body.download || [];
    if (!unduhList || unduhList.length === 0) {
      console.log('Field unduh tidak ditemukan, mencari link secara otomatis...');
      const foundUrl = findFirstUrlInObject(body);
      
      if (foundUrl) {
        showVideoLink(foundUrl);
        return;
      }

      showError('Tidak ditemukan link unduh di respons API.');
      setStatus('Link unduh tidak ditemukan', 'error');
      return;
    }

    // Ambil link pertama dari list unduh
    const firstDownload = unduhList[0];
    const videoUrl = firstDownload.tautan || firstDownload.link || firstDownload.url || firstDownload.download;
    
    if (!videoUrl) {
      showError('Item unduh pertama tidak berisi link yang valid.');
      setStatus('Link tidak valid', 'error');
      return;
    }

    // Tampilkan link unduh
    showVideoLink(videoUrl);

  } catch (err) {
    console.error('Kesalahan saat proses unduh:', err);
    const isTimeout = err.name === 'AbortError';
    const isCors = String(err).includes('Failed to fetch') || String(err).includes('NetworkError');
    
    const errorMsg = isTimeout ? 'Waktu tunggu habis (timeout)' : 
                     isCors ? 'Terjadi kesalahan CORS' : 
                     'Terjadi kesalahan tidak terduga';
    
    const detail = isCors ? 'Browser memblokir request ke API. Solusi: Gunakan proxy backend atau ubah API.' : 
                   isTimeout ? 'API terlalu lama merespons, coba lagi nanti.' : 
                   err.message;

    showError(errorMsg, detail);
    setStatus('Gagal memproses', 'error');
  }
}

// Tambah event listener ke form (bukan tombol saja, agar bisa submit dengan Enter)
downloadForm.addEventListener('submit', handleDownload);

// Set status awal saat halaman dimuat
setStatus('Menunggu link TikTok...', 'idle');
  
