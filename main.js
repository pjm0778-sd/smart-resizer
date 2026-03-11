let processedBlob = null;
let currentWidth = 512;
let currentHeight = 512;
let originalImage = null;
let currentLang = localStorage.getItem('lang') || 'ko';

// Tools State
let compressOriginalImage = null;
let compressQuality = 0.8;
let compressedBlob = null;

let converterOriginalImage = null;
let targetFormat = 'image/png';
let convertedBlob = null;

let watermarkOriginalImage = null;
let watermarkBlob = null;

let bgOriginalImage = null;
let bgRemovedBlob = null;

const translations = {
  ko: {
    title: "Smart Resizer - 올인원 이미지 도구",
    header: "📏 이미지 리사이저",
    subtitle: "이미지 크기를 즉시 조정합니다",
    navResizer: "이미지 리사이저",
    navCompress: "이미지 압축",
    navConverter: "포맷 변환기",
    navWatermark: "워터마크 삽입",
    navBgRemover: "배경 제거 (AI)",
    dropText: "이미지를 드래그하거나 클릭하여 업로드",
    downloadBtn: "다운로드",
    apply: "적용",
    specTitle: "📋 출력 설정",
    compressQuality: "품질",
    compressSubtitle: "용량을 획기적으로 줄입니다",
    // Converter
    converterSubtitle: "이미지 형식을 즉시 변환합니다 (PNG, JPG, WEBP)",
    // Watermark
    watermarkSubtitle: "텍스트 워터마크를 추가하여 도용을 방지하세요",
    // BG Remover
    bgRemoverSubtitle: "AI가 이미지 배경을 자동으로 제거합니다",
    bgProcessing: "🪄 AI가 작업 중입니다... (약 5-10초 소요)",
    about: "사이트 소개",
    contact: "문의하기",
    privacyPolicy: "개인정보처리방침"
  },
  en: {
    title: "Smart Resizer - All-in-One Image Tools",
    header: "📏 Image Resizer",
    subtitle: "Resize images instantly",
    navResizer: "Image Resizer",
    navCompress: "Image Compressor",
    navConverter: "Format Converter",
    navWatermark: "Add Watermark",
    navBgRemover: "BG Remover (AI)",
    dropText: "Drag & drop image here or click to upload",
    downloadBtn: "Download",
    apply: "Apply",
    specTitle: "📋 Output Settings",
    compressQuality: "Quality",
    compressSubtitle: "Significantly reduce file size",
    // Converter
    converterSubtitle: "Convert image formats instantly (PNG, JPG, WEBP)",
    // Watermark
    watermarkSubtitle: "Protect your images with text watermarks",
    // BG Remover
    bgRemoverSubtitle: "AI automatically removes image background",
    bgProcessing: "🪄 AI is processing... (takes 5-10s)",
    about: "About",
    contact: "Contact",
    privacyPolicy: "Privacy Policy"
  }
};

// --- Drag & Drop Setup ---
function setupDragAndDrop(dropZoneId, fileInputId, processFn) {
  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(fileInputId);

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFn(file);
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) processFn(file);
  });
}

// --- View Navigation ---
function showView(viewId) {
  document.querySelectorAll('.tool-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewId}`)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewId);
  });
  document.getElementById('sidebar').classList.remove('open');
}

// Mobile Menu
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Language
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('.lang-selector button').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${lang}`));
  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });
  document.title = t.title;
}

// --- 1. Resizer Logic ---
function onCustomInput() {
  const w = document.getElementById('customW').value;
  const h = document.getElementById('customH').value;
  document.getElementById('applyBtn').disabled = !(w > 0 && h > 0);
}

function applyCustomSize() {
  const w = parseInt(document.getElementById('customW').value);
  const h = parseInt(document.getElementById('customH').value);
  if (w > 0 && h > 0) {
    currentWidth = w; currentHeight = h;
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    if (originalImage) processImage(originalImage);
  }
}

function setSize(size, btn) {
  currentWidth = size; currentHeight = size;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('customW').value = '';
  document.getElementById('customH').value = '';
  document.getElementById('applyBtn').disabled = true;
  if (originalImage) processImage(originalImage);
}

function processResizerFile(file) {
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
  const canvas = document.getElementById('resultCanvas');
  canvas.width = currentWidth; canvas.height = currentHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
  canvas.toBlob(blob => { 
    processedBlob = blob; 
    document.getElementById('downloadBtn').disabled = false; 
    document.getElementById('previewArea').classList.add('show'); 
  }, 'image/png');
}

function reset() {
  originalImage = null;
  processedBlob = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('originalPreview').src = '';
  const canvas = document.getElementById('resultCanvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('previewArea').classList.remove('show');
  document.getElementById('downloadBtn').disabled = true;
}

function download() {
  if (!processedBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(processedBlob);
  a.download = `resized_${currentWidth}x${currentHeight}.png`;
  a.click();
}

// --- 2. Compressor Logic ---
function updateQuality(val) {
  compressQuality = val / 100;
  document.getElementById('qualityValueLabel').textContent = `${val}%`;
  if (compressOriginalImage) runCompression();
}

function processCompressFile(file) {
  document.getElementById('origSizeLabel').textContent = (file.size/1024).toFixed(1) + 'KB';
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => { 
      compressOriginalImage = img; 
      document.getElementById('compressOrigPreview').src = e.target.result; 
      runCompression(); 
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function runCompression() {
  const canvas = document.getElementById('compressCanvas');
  canvas.width = compressOriginalImage.width; canvas.height = compressOriginalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(compressOriginalImage, 0, 0);
  canvas.toBlob(blob => {
    compressedBlob = blob;
    document.getElementById('newSizeLabel').textContent = (blob.size/1024).toFixed(1) + 'KB';
    document.getElementById('compressDownloadBtn').disabled = false;
    document.getElementById('compressPreviewArea').classList.add('show');
  }, 'image/jpeg', compressQuality);
}

function downloadCompressed() {
  if (!compressedBlob) return;
  const a = document.createElement('a'); 
  a.href = URL.createObjectURL(compressedBlob); 
  a.download = 'compressed.jpg'; 
  a.click();
}

// --- 3. Converter Logic ---
function setConvertFormat(fmt, btn) {
  targetFormat = fmt === 'jpeg' ? 'image/jpeg' : `image/${fmt}`;
  document.querySelectorAll('#view-converter .preset-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (converterOriginalImage) runConversion();
}

function processConverterFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => { 
      converterOriginalImage = img; 
      runConversion(); 
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function runConversion() {
  const canvas = document.createElement('canvas');
  canvas.width = converterOriginalImage.width; canvas.height = converterOriginalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(converterOriginalImage, 0, 0);
  canvas.toBlob(blob => { 
    convertedBlob = blob; 
    document.getElementById('converterDownloadBtn').disabled = false; 
    const ext = targetFormat.split('/')[1].replace('jpeg', 'jpg').toUpperCase();
    document.getElementById('converterInfoBar').textContent = `준비됨: ${ext} 형식`;
  }, targetFormat);
}

function downloadConverted() {
  if (!convertedBlob) return;
  const ext = targetFormat.split('/')[1].replace('jpeg', 'jpg');
  const a = document.createElement('a'); 
  a.href = URL.createObjectURL(convertedBlob); 
  a.download = `converted.${ext}`; 
  a.click();
}

// --- 4. Watermark Logic ---
function processWatermarkFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => { 
      watermarkOriginalImage = img; 
      runWatermark(); 
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function runWatermark() {
  if (!watermarkOriginalImage) return;
  const canvas = document.getElementById('watermarkCanvas');
  const text = document.getElementById('watermarkText').value || 'Smart Resizer';
  const opacity = document.getElementById('watermarkOpacity').value / 100;
  
  canvas.width = watermarkOriginalImage.width;
  canvas.height = watermarkOriginalImage.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(watermarkOriginalImage, 0, 0);
  
  ctx.globalAlpha = opacity;
  ctx.fillStyle = 'white';
  ctx.font = `bold ${canvas.width / 15}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add slight shadow for better visibility
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  canvas.toBlob(blob => { 
    watermarkBlob = blob; 
    document.getElementById('watermarkDownloadBtn').disabled = false; 
  }, 'image/png');
}

function downloadWatermark() {
  if (!watermarkBlob) return;
  const a = document.createElement('a'); 
  a.href = URL.createObjectURL(watermarkBlob); 
  a.download = 'watermarked.png'; 
  a.click();
}

// --- 5. Background Remover (AI) ---
async function processBgFile(file) {
  if (!file) return;
  
  const loadingEl = document.getElementById('bgLoading');
  const previewArea = document.getElementById('bgPreviewArea');
  const downloadBtn = document.getElementById('bgDownloadBtn');
  
  loadingEl.style.display = 'block';
  previewArea.classList.remove('show');
  downloadBtn.disabled = true;

  try {
    // imgly background removal
    const blob = await imglyRemoveBackground(file);
    bgRemovedBlob = blob;
    
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('bgResultCanvas');
      canvas.width = img.width; 
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      loadingEl.style.display = 'none';
      previewArea.classList.add('show');
      downloadBtn.disabled = false;
    };
    img.src = url;
  } catch (error) {
    console.error("Background removal failed:", error);
    alert("배경 제거에 실패했습니다. 다른 이미지를 시도해보세요.");
    loadingEl.style.display = 'none';
  }
}

function downloadBgRemoved() {
  if (!bgRemovedBlob) return;
  const a = document.createElement('a'); 
  a.href = URL.createObjectURL(bgRemovedBlob); 
  a.download = 'no_bg.png'; 
  a.click();
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  
  // Setup Drag & Drop for all zones
  setupDragAndDrop('dropZone', 'fileInput', processResizerFile);
  setupDragAndDrop('compressDropZone', 'compressFileInput', processCompressFile);
  setupDragAndDrop('converterDropZone', 'converterFileInput', processConverterFile);
  setupDragAndDrop('watermarkDropZone', 'watermarkFileInput', processWatermarkFile);
  setupDragAndDrop('bgDropZone', 'bgFileInput', processBgFile);
});

// Export functions to window
window.showView = showView;
window.setLanguage = setLanguage;
window.setSize = setSize;
window.onCustomInput = onCustomInput;
window.applyCustomSize = applyCustomSize;
window.reset = reset;
window.updateQuality = updateQuality;
window.setConvertFormat = setConvertFormat;
window.runWatermark = runWatermark;
window.download = download;
window.downloadCompressed = downloadCompressed;
window.downloadConverted = downloadConverted;
window.downloadWatermark = downloadWatermark;
window.downloadBgRemoved = downloadBgRemoved;
