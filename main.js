let processedBlob = null;
let currentWidth = 512;
let currentHeight = 512;
let originalImage = null;
let currentLang = localStorage.getItem('lang') || 'ko';

const translations = {
  ko: {
    title: "Smart Resizer - 무료 온라인 이미지 변환기 (PNG, JPEG, WEBP)",
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
    about: "사이트 소개",
    // New Info Content
    infoTitle1: "무료 온라인 이미지 변환기: 빠르고 안전한 이미지 최적화",
    infoDesc1: "저희 Smart Resizer는 별도의 설치 없이 브라우저에서 즉시 사용할 수 있는 고성능 이미지 변환 도구입니다. 단순히 크기를 조정하는 것을 넘어, 다양한 플랫폼의 규격에 맞는 최적화된 이미지를 생성할 수 있도록 도와드립니다.",
    feat1Title: "🔒 철저한 개인정보 보호",
    feat1Desc: "업로드하신 모든 이미지는 서버로 전송되지 않습니다. 모든 변환 과정이 사용자의 웹 브라우저 내에서 직접 이루어집니다.",
    feat2Title: "⚡ 초고속 클라이언트 처리",
    feat2Desc: "서버 대기 시간 없이 즉각적으로 결과를 확인할 수 있습니다. 실시간 미리보기를 통해 변환 결과를 즉시 확인하세요.",
    feat3Title: "🎯 다양한 프리셋 지원",
    feat3Desc: "512px, 1024px 등 표준 규격부터 직접 입력 방식까지 지원하여 원하는 정확한 크기로 변환할 수 있습니다.",
    guideTitle: "이미지 포맷 선택 가이드: PNG, JPG, WEBP",
    guideDesc: "이미지 변환 시 상황에 맞는 적절한 포맷을 선택하는 것이 중요합니다.",
    guideLi1: "PNG (Portable Network Graphics): 손실 없는 압축과 투명 배경을 지원합니다. 로고, 아이콘에 적합합니다.",
    guideLi2: "JPEG (Joint Photographic Experts Group): 압축률이 높아 용량을 줄이기 좋습니다. 사진형 이미지에 추천합니다.",
    guideLi3: "WebP: 구글의 차세대 포맷으로, 작은 용량과 고화질을 동시에 제공합니다. 웹 최적화의 핵심입니다.",
    faqTitle: "자주 묻는 질문 (FAQ)",
    q1: "Q: 서비스 이용 비용이 있나요?",
    a1: "A: 아니요, Smart Resizer는 100% 무료이며 횟수 제한 없이 누구나 이용하실 수 있습니다.",
    q2: "Q: 스마트폰에서도 사용 가능한가요?",
    a2: "A: 네, 반응형 웹 디자인을 적용하여 모바일 브라우저에서도 PC와 동일하게 사용 가능합니다.",
    q3: "Q: 변환된 이미지의 화질 저하가 있나요?",
    a3: "A: 고품질 캔버스 렌더링 기술을 사용하여 크기 조정 시 화질 손실을 최소화합니다."
  },
  en: {
    title: "Smart Resizer - Free Online Image Converter (PNG, JPEG, WEBP)",
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
    about: "About",
    // New Info Content
    infoTitle1: "Free Online Image Converter: Fast & Secure Optimization",
    infoDesc1: "Smart Resizer is a high-performance image conversion tool that works instantly in your browser without installation. Go beyond simple resizing to create optimized images for various platform standards.",
    feat1Title: "🔒 Total Privacy Protection",
    feat1Desc: "Your images are never sent to a server. All processing happens locally within your web browser.",
    feat2Title: "⚡ Lightning Fast Processing",
    feat2Desc: "No server wait times. Get instant results and previews powered by your browser's performance.",
    feat3Title: "🎯 Versatile Presets",
    feat3Desc: "From standard 512px/1024px to custom dimensions, we support exact sizes for your professional needs.",
    guideTitle: "Format Guide: PNG, JPG, WEBP",
    guideDesc: "Choosing the right format is crucial for image optimization.",
    guideLi1: "PNG: Lossless compression with transparency. Best for logos, icons, and text-heavy images.",
    guideLi2: "JPEG: High compression for smaller file sizes. Recommended for photos and complex backgrounds.",
    guideLi3: "WebP: Google's next-gen format. Offers high quality with even smaller sizes and transparency support.",
    faqTitle: "Frequently Asked Questions (FAQ)",
    q1: "Q: Is there any cost for using the service?",
    a1: "A: No, Smart Resizer is 100% free with no usage limits for everyone.",
    q2: "Q: Is it available on smartphones?",
    a2: "A: Yes, our responsive design ensures a seamless experience on both mobile and desktop browsers.",
    q3: "Q: Does resizing reduce image quality?",
    a3: "A: We use high-quality canvas rendering to minimize quality loss during resizing.",
    // About Page Translations
    aboutTitle: "Smart Resizer - About & Vision",
    backHome: "← Home",
    backHomeSimple: "Home",
    aboutHeroTitle: "The Birth of Smart Resizer",
    aboutHeroDesc: "From a single image to perfect store listings",
    visionTitle: "Our Mission: 'Simple but Powerful'",
    visionP1: "Every developer who has released an app on Google Play or the App Store knows the struggle. 512x512 icons, 1024x1024 graphics, and countless screenshot sizes... Even for simple resizing, you had to open paid software or upload to ad-filled websites.",
    visionP2: "Smart Resizer was born to solve this hassle. We take care of standard-compliant conversion so you can focus strictly on the essence of your product.",
    badgeSecurity: "Security First",
    featSecTitle: "Zero-Server Architecture",
    featSecDesc: "We never transmit a single byte of your data to a server. Everything happens locally in your browser via the Canvas API. Trust us with your confidential logos and private photos.",
    badgeEfficiency: "Efficiency",
    featEffTitle: "Store-Specific Presets",
    featEffDesc: "We instantly reflect the latest standards for Google Play and App Store. Get professional results from 1024px graphics to 180px iOS icons with one click.",
    badgeNoLimits: "No Limits",
    featNoLimitTitle: "Pure Ad-Free Tool",
    featNoLimitDesc: "No popup ads or payment prompts to break your workflow. Smart Resizer is 100% free for the community, maintaining a minimal footprint.",
    roadmapTitle: "🚀 Future Roadmap (2024-2025)",
    rm1Title: "Phase 1: Core Engine (Completed)",
    rm1Desc: "High-speed canvas rendering engine and basic store presets implemented.",
    rm2Title: "Phase 2: Batch Processing (In Progress)",
    rm2Desc: "Developing a feature to drag & drop dozens of images for automatic conversion to various sizes at once.",
    rm3Title: "Phase 3: AI Smart Upscaling (Coming Soon)",
    rm3Desc: "Integrating AI filters to minimize quality loss when converting low-res images to high-res.",
    contactInfo: "Smart Resizer grows through user feedback."
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
