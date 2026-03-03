let processedBlob = null;
let currentWidth = 512;
let currentHeight = 512;
let originalImage = null;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const infoBar = document.getElementById('infoBar');
const previewArea = document.getElementById('previewArea');
const downloadBtn = document.getElementById('downloadBtn');
const currentSizeLabel = document.getElementById('currentSizeLabel');
const resultLabel = document.getElementById('resultLabel');

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
  
  // Update active button state
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  if (originalImage) {
    processImage(originalImage);
  }
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
    if (originalImage) {
      processImage(originalImage);
    }
  }
}

function updateSizeUI() {
  currentSizeLabel.textContent = `${currentWidth} × ${currentHeight} px`;
  resultLabel.textContent = `변환 결과 (${currentWidth}×${currentHeight}, 투명 배경)`;
  downloadBtn.innerHTML = `📥 PNG 다운로드 (${currentWidth}×${currentHeight})`;
}

function processFile(file) {
  if (!file.type.startsWith('image/')) {
    showInfo('이미지 파일만 지원합니다.', true);
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
  // Process: resize to currentWidth x currentHeight with transparency
  const offscreen = document.createElement('canvas');
  offscreen.width = currentWidth;
  offscreen.height = currentHeight;
  const ctx = offscreen.getContext('2d');
  ctx.clearRect(0, 0, currentWidth, currentHeight);
  
  // Maintain aspect ratio or stretch? Usually icons are square and source is square.
  // Here we stretch to fill the target size as requested by "App Icon Converter" context.
  ctx.drawImage(img, 0, 0, currentWidth, currentHeight);

  // Draw preview at fixed 200x200 (or proportional)
  const previewCanvas = document.getElementById('resultCanvas');
  const pCtx = previewCanvas.getContext('2d');
  pCtx.clearRect(0, 0, 200, 200);
  
  // Draw maintaining aspect ratio in the 200x200 preview
  const ratio = Math.min(200 / currentWidth, 200 / currentHeight);
  const nw = currentWidth * ratio;
  const nh = currentHeight * ratio;
  pCtx.drawImage(offscreen, (200 - nw) / 2, (200 - nh) / 2, nw, nh);

  // Convert to blob
  offscreen.toBlob(blob => {
    processedBlob = blob;
    const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
    const isOk = blob.size < 1024 * 1024;
    showInfo(
      `✅ 변환 완료! 크기: ${currentWidth}×${currentHeight}px | 용량: ${sizeMB}MB | ${isOk ? '✓ 1MB 이하' : '⚠ 1MB 초과'}`,
      !isOk
    );
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
  
  // Reset to default size
  setSize(512, document.querySelector('.preset-btn.active'));
}
