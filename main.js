let processedBlob = null;
let currentWidth = 512;
let currentHeight = 512;
let originalImage = null;
let currentLang = localStorage.getItem('lang') || 'ko';

const translations = {
  ko: {
    title: "무료 온라인 이미지 변환기",
    header: "🖼️ 무료 이미지 변환기",
    subtitle: "이미지를 다양한 스토어 규격에 맞게 무료로 변환합니다",
    specTitle: "📋 출력 설정",
    quickSelect: "빠른 선택",
    customInput: "직접 입력",
    width: "가로",
    height: "세로",
    apply: "적용",
    currentSize: "현재 출력 크기",
    dropText: "이미지를 여기에 드래그하거나 클릭하여 업로드",
    formats: "PNG, JPEG, WEBP 지원",
    originalLabel: "원본 이미지",
    resultLabel: (w, h) => `변환 결과 (${w}×${h}, 투명 배경)`,
    reset: "초기화",
    downloadBtn: "PNG 다운로드",
    infoSuccess: (w, h, size, ok) => `✅ 변환 완료! 크기: ${w}×${h}px | 용량: ${size}MB | ${ok ? '✓ 1MB 이하' : '⚠ 1MB 초과'}`,
    infoError: "이미지 파일만 지원합니다.",
    privacyPolicy: "개인정보처리방침",
    contact: "문의하기",
    about: "사이트 소개"
  },
  en: {
    title: "Free Image Converter",
    header: "🖼️ Free Image Converter",
    subtitle: "Convert images to various store sizes for free",
    specTitle: "📋 Output Settings",
    quickSelect: "Quick Select",
    customInput: "Manual Input",
    width: "Width",
    height: "Height",
    apply: "Apply",
    currentSize: "Current Size",
    dropText: "Drag & drop image here or click to upload",
    formats: "Supports PNG, JPEG, WEBP",
    originalLabel: "Original Image",
    resultLabel: (w, h) => `Result (${w}×${h}, Transparent)`,
    reset: "Reset",
    downloadBtn: "Download PNG",
    infoSuccess: (w, h, size, ok) => `✅ Done! Size: ${w}×${h}px | Weight: ${size}MB | ${ok ? '✓ Under 1MB' : '⚠ Over 1MB'}`,
    infoError: "Only image files are supported.",
    privacyPolicy: "Privacy Policy",
    contact: "Contact",
    about: "About"
  }
};

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const infoBar = document.getElementById('infoBar');
const previewArea = document.getElementById('previewArea');
const downloadBtn = document.getElementById('downloadBtn');
const currentSizeLabel = document.getElementById('currentSizeLabel');
const resultLabel = document.getElementById('resultLabel');

// --- Language Logic ---
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  
  // Update Buttons
  document.querySelectorAll('.lang-selector button').forEach(btn => {
    btn.classList.toggle('active', btn.id === `lang-${lang}`);
  });

  // Update Text
  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] && typeof t[key] === 'string') {
      el.textContent = t[key];
    }
  });

  // Update Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });

  document.title = t.title;
  updateSizeUI();
  if (originalImage) processImage(originalImage);
}

// --- Core Logic ---
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
});
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) processFile(e.target.files[0]);
});

function setSize(size, btn) {
  currentWidth = size;
  currentHeight = size;
  updateSizeUI();
  
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  if (originalImage) processImage(originalImage);
}

function onCustomInput() {
  const w = document.getElementById('customW').value;
  const h = document.getElementById('customH').value;
  document.getElementById('applyBtn').disabled = !(w >= 16 && h >= 16);
}

function applyCustomSize() {
  const w = parseInt(document.getElementById('customW').value);
  const h = parseInt(document.getElementById('customH').value);
  if (w >= 16 && h >= 16) {
    currentWidth = w;
    currentHeight = h;
    updateSizeUI();
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    if (originalImage) processImage(originalImage);
  }
}

function updateSizeUI() {
  const t = translations[currentLang];
  currentSizeLabel.textContent = `${currentWidth} × ${currentHeight} px`;
  resultLabel.textContent = t.resultLabel(currentWidth, currentHeight);
  downloadBtn.innerHTML = `📥 ${t.downloadBtn} (${currentWidth}×${currentHeight})`;
}

function processFile(file) {
  const t = translations[currentLang];
  if (!file.type.startsWith('image/')) {
    showInfo(t.infoError, true);
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      originalImage = img;
      document.getElementById('originalPreview').src = e.target.result;
      processImage(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function processImage(img) {
  const t = translations[currentLang];
  const offscreen = document.createElement('canvas');
  offscreen.width = currentWidth;
  offscreen.height = currentHeight;
  const ctx = offscreen.getContext('2d');
  ctx.clearRect(0, 0, currentWidth, currentHeight);
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

  const previewCanvas = document.getElementById('resultCanvas');
  const pCtx = previewCanvas.getContext('2d');
  pCtx.clearRect(0, 0, 200, 200);
  
  const ratio = Math.min(200 / currentWidth, 200 / currentHeight);
  const nw = currentWidth * ratio;
  const nh = currentHeight * ratio;
  pCtx.drawImage(offscreen, (200 - nw) / 2, (200 - nh) / 2, nw, nh);

  offscreen.toBlob(blob => {
    processedBlob = blob;
    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    const isOk = blob.size < 1024 * 1024;
    showInfo(t.infoSuccess(currentWidth, currentHeight, sizeMB, isOk), !isOk);
    previewArea.classList.add('show');
    downloadBtn.disabled = false;
  }, 'image/png');
}

function showInfo(msg, warn = false) {
  infoBar.textContent = msg;
  infoBar.className = 'info-bar show' + (warn ? ' warn' : '');
}

function download() {
  if (!processedBlob) return;
  const url = URL.createObjectURL(processedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `converted_image_${currentWidth}x${currentHeight}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

function reset() {
  processedBlob = null;
  originalImage = null;
  fileInput.value = '';
  document.getElementById('originalPreview').src = '';
  const ctx = document.getElementById('resultCanvas').getContext('2d');
  ctx.clearRect(0, 0, 200, 200);
  previewArea.classList.remove('show');
  infoBar.className = 'info-bar';
  downloadBtn.disabled = true;
  setSize(512, document.querySelector('.preset-btn.active'));
}

// Init language
setLanguage(currentLang);
