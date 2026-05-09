/* ==========================================================================
   upload.js — 餐車自助登錄表單邏輯
   流程：圖片 → Cloudinary 上傳 → 取得 URL → 連同表單一起 POST 到 Apps Script
   ========================================================================== */

// ⚙️ 設定（部署時請填入你的金鑰，見 SETUP.md）
const CONFIG = {
  // Cloudinary unsigned upload
  CLOUDINARY_CLOUD_NAME: 'diiyszovx',     // TODO: 你的 Cloudinary cloud name
  CLOUDINARY_UPLOAD_PRESET: 'niceshow',      // TODO: unsigned upload preset 名稱
  // Google Apps Script Web App 部署後的 URL
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzGa0BswKnKuKcHVXkRIFTMgF6v3OZDOOdNnr1Gkr_jjZWstzOBFOF_IJ_9pLK_jI9s7Q/exec',      // TODO: 部署後貼上這裡
};

// 圖片快取（上傳完成後存 URL）
const uploadedImages = { logo: null, menu: null };

/* ---------------- 檔案上傳 UI ---------------- */
function setupFileDrop(dropId, inputId, previewId, imgId, key) {
  const drop = document.getElementById(dropId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const img = document.getElementById(imgId);

  // 拖曳
  ['dragenter', 'dragover'].forEach(e =>
    drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(e =>
    drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', ev => {
    if (ev.dataTransfer.files.length) {
      input.files = ev.dataTransfer.files;
      handleFile(input.files[0]);
    }
  });

  input.addEventListener('change', () => {
    if (input.files.length) handleFile(input.files[0]);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showStatus('請選擇圖片檔', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showStatus('圖片超過 5MB，請壓縮後再上傳', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
      preview.classList.add('show');
      drop.classList.add('has-file');
      drop.querySelector('.label').textContent = '✓ ' + file.name;
    };
    reader.readAsDataURL(file);
    uploadedImages[key + '_file'] = file;  // 暫存 file，送出時才上 Cloudinary
  }
}

setupFileDrop('logoDrop', 'logoInput', 'logoPreview', 'logoImg', 'logo');
setupFileDrop('menuDrop', 'menuInput', 'menuPreview', 'menuImg', 'menu');

// 清除按鈕
document.querySelectorAll('.clear').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.target;
    document.getElementById(key + 'Input').value = '';
    document.getElementById(key + 'Preview').classList.remove('show');
    const drop = document.getElementById(key + 'Drop');
    drop.classList.remove('has-file');
    drop.querySelector('.label').textContent = key === 'logo' ? '點擊上傳或拖曳圖片' : '點擊上傳菜單';
    uploadedImages[key + '_file'] = null;
    uploadedImages[key] = null;
  });
});

/* ---------------- 社群連結動態增減（最多 3 個） ---------------- */
const socialList = document.getElementById('socialList');
const addSocialBtn = document.getElementById('addSocial');
const MAX_SOCIAL_LINKS = 3;

function updateAddSocialBtn() {
  const count = socialList.querySelectorAll('.social-row').length;
  if (count >= MAX_SOCIAL_LINKS) {
    addSocialBtn.disabled = true;
    addSocialBtn.style.opacity = '0.4';
    addSocialBtn.style.cursor = 'not-allowed';
    addSocialBtn.textContent = `已達上限（最多 ${MAX_SOCIAL_LINKS} 個）`;
  } else {
    addSocialBtn.disabled = false;
    addSocialBtn.style.opacity = '';
    addSocialBtn.style.cursor = '';
    addSocialBtn.textContent = '+ 加一個連結';
  }
}

addSocialBtn.addEventListener('click', () => {
  const count = socialList.querySelectorAll('.social-row').length;
  if (count >= MAX_SOCIAL_LINKS) return;
  const row = document.createElement('div');
  row.className = 'social-row with-remove';
  row.innerHTML = `
    <select class="social-type">
      <option value="FB">FB</option>
      <option value="IG">IG</option>
      <option value="官網">官網</option>
      <option value="LINE">LINE</option>
      <option value="其他">其他</option>
    </select>
    <input type="url" class="social-url" placeholder="https://...">
    <button type="button" class="remove">×</button>
  `;
  row.querySelector('.remove').addEventListener('click', () => {
    row.remove();
    updateAddSocialBtn();
  });
  socialList.appendChild(row);
  updateAddSocialBtn();
});

updateAddSocialBtn();

/* ---------------- 上傳到 Cloudinary ---------------- */
async function uploadToCloudinary(file) {
  if (CONFIG.CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
    throw new Error('Cloudinary 尚未設定（請見 SETUP.md）');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CONFIG.CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('圖片上傳失敗');
  const data = await res.json();
  return data.secure_url;
}

/* ---------------- 表單送出 ---------------- */
const form = document.getElementById('uploadForm');
const statusEl = document.getElementById('status');
const submitBtn = document.getElementById('submitBtn');

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = 'status show ' + type;
}
function hideStatus() {
  statusEl.className = 'status';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideStatus();
  submitBtn.disabled = true;

  try {
    const data = new FormData(form);
    const truckName = (data.get('truckName') || '').trim();
    if (!truckName) throw new Error('請填餐車名稱');

    // 1) 上傳圖片到 Cloudinary
    if (uploadedImages.logo_file) {
      showStatus('上傳餐車照片中…', 'loading');
      submitBtn.textContent = '上傳中…';
      uploadedImages.logo = await uploadToCloudinary(uploadedImages.logo_file);
    }
    if (uploadedImages.menu_file) {
      showStatus('上傳菜單圖中…', 'loading');
      uploadedImages.menu = await uploadToCloudinary(uploadedImages.menu_file);
    }

    // 2) 收集社群連結
    const links = [];
    document.querySelectorAll('#socialList .social-row').forEach(row => {
      const url = row.querySelector('.social-url').value.trim();
      const type = row.querySelector('.social-type').value;
      if (url) links.push({ text: type, url });
    });

    // 3) 組成 payload
    const payload = {
      truckName,
      phone: (data.get('phone') || '').trim(),
      logoUrl: uploadedImages.logo || '',
      menuUrl: uploadedImages.menu || '',
      links,
      timestamp: new Date().toISOString(),
    };

    // 4) 送 Apps Script
    showStatus('送出資料中…', 'loading');
    submitBtn.textContent = '送出中…';

    if (CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL') {
      throw new Error('Apps Script 尚未設定（請見 SETUP.md）');
    }

    // Apps Script Web App 不接受複雜 CORS preflight，用 text/plain
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('伺服器回應錯誤：' + res.status);
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || '寫入失敗');

    // 成功！
    form.style.display = 'none';
    document.getElementById('successScreen').classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error(err);
    showStatus('❌ ' + err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '送出登錄';
  }
});

// 「再登錄一筆」按鈕
document.getElementById('anotherBtn').addEventListener('click', () => {
  form.reset();
  ['logo', 'menu'].forEach(k => {
    const drop = document.getElementById(k + 'Drop');
    drop.classList.remove('has-file');
    drop.querySelector('.label').textContent = k === 'logo' ? '點擊上傳或拖曳圖片' : '點擊上傳菜單';
    document.getElementById(k + 'Preview').classList.remove('show');
    uploadedImages[k] = null;
    uploadedImages[k + '_file'] = null;
  });
  document.querySelectorAll('#socialList .social-row.with-remove').forEach(r => r.remove());
  if (typeof updateAddSocialBtn === 'function') updateAddSocialBtn();
  document.getElementById('successScreen').classList.remove('show');
  form.style.display = 'flex';
  hideStatus();
});
