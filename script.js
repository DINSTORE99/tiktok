// Ambil elemen
const form = document.getElementById("download-form");
const loader = document.getElementById("loader");
const statusText = document.getElementById("statusText");
const result = document.getElementById("result");

// === 3 API GRATIS ===
const API_LIST = [
  (u) => `https://www.tikwm.com/api/?url=${encodeURIComponent(u)}`,
  (u) => `https://api.douyin.wtf/api?url=${encodeURIComponent(u)}`,
  (u) => `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(u)}`
];

// === Fallback API ===
async function fetchFromAPIs(url) {
  for (let api of API_LIST) {
    try {
      const endpoint = api(url);
      const res = await fetch(endpoint);
      const json = await res.json();
      
      console.log("✔ Sukses dari:", endpoint);
      return json;
    } catch (err) {
      console.log("✘ Gagal:", api(url));
    }
  }
  return null;
}

// === Submit ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const url = document.getElementById("url").value.trim();
  if (!url) return alert("Masukkan URL TikTok terlebih dahulu!");
  
  // Reset UI
  result.innerHTML = "";
  loader.style.display = "block";
  statusText.innerHTML = "⏳ Mengambil data...";
  
  const data = await fetchFromAPIs(url);
  loader.style.display = "none";
  
  if (!data) {
    statusText.innerHTML = "❌ Semua API gagal!";
    return;
  }
  
  let title, video, audio, thumb;
  
  // ========================
  //   PARSER API TIKWM
  // ========================
  if (data.data && data.data.play) {
    const d = data.data;
    title = d.title;
    video = d.play;
    audio = d.music;
    thumb = d.cover;
  }
  
  // ========================
  //   PARSER API DOUYIN.WTF
  // ========================
  else if (data.aweme && data.aweme.detail) {
    const d = data.aweme.detail;
    title = d.desc;
    video = d.video.play_addr.url_list[0];
    audio = d.music.play_url.url_list[0];
    thumb = d.video.cover.url_list[0];
  }
  
  // ========================
  //   PARSER API TIKLYDOWN
  // ========================
  else if (data.result || data.video) {
    const d = data.result || data;
    title = d.title;
    video = d.video;
    audio = d.music;
    thumb = d.cover || d.thumbnail;
  }
  
  // Jika gagal parsing
  if (!video) {
    statusText.innerHTML = "❌ Format API tidak dikenali.";
    return;
  }
  
  statusText.innerHTML = "✅ Berhasil diambil!";
  
  // ========================
  //   OUTPUT HASIL
  // ========================
  result.innerHTML = `
    <div class="result-card">
      <h3>${title || "Tanpa Judul"}</h3>
      <img src="${thumb}" class="thumb">

      <div class="download-buttons">
        <a href="${video}" class="btn-primary" download>
          <i class="fas fa-video"></i> Download Video
        </a>

        <a href="${audio}" class="btn-secondary" download>
          <i class="fas fa-music"></i> Download Audio
        </a>
      </div>
    </div>
  `;
  
});
