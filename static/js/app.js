// ===================================================================
// AgroAI - Plant Disease Classification Frontend Logic
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const browseBtn = document.getElementById('browseBtn');
  const uploadTabBtn = document.getElementById('uploadTabBtn');
  const cameraTabBtn = document.getElementById('cameraTabBtn');
  const uploadArea = document.getElementById('uploadArea');
  const cameraArea = document.getElementById('cameraArea');
  const cameraVideo = document.getElementById('cameraVideo');
  const captureBtn = document.getElementById('captureBtn');
  const stopCameraBtn = document.getElementById('stopCameraBtn');

  // Results
  const placeholderState = document.getElementById('placeholderState');
  const resultContent = document.getElementById('resultContent');
  const loadingState = document.getElementById('loadingState');
  const resultThumb = document.getElementById('resultThumb');
  const resultPlant = document.getElementById('resultPlant');
  const resultDisease = document.getElementById('resultDisease');
  const resultPathogen = document.getElementById('resultPathogen');
  const resultSeverity = document.getElementById('resultSeverity');
  const confidenceVal = document.getElementById('confidenceVal');
  const progressBarFill = document.getElementById('progressBarFill');

  const textSymptoms = document.getElementById('textSymptoms');
  const textCauses = document.getElementById('textCauses');
  const textTreatment = document.getElementById('textTreatment');
  const textPrevention = document.getElementById('textPrevention');

  const featuresStrip = document.getElementById('featuresStrip');
  const candidatesList = document.getElementById('candidatesList');

  // Encyclopedia
  const encyclopediaGrid = document.getElementById('encyclopediaGrid');
  const searchInput = document.getElementById('searchInput');
  const filterChips = document.getElementById('filterChips');

  // Modal
  const diseaseModal = document.getElementById('diseaseModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalPlant = document.getElementById('modalPlant');
  const modalPathogen = document.getElementById('modalPathogen');
  const modalSymptoms = document.getElementById('modalSymptoms');
  const modalCauses = document.getElementById('modalCauses');
  const modalTreatment = document.getElementById('modalTreatment');
  const modalPrevention = document.getElementById('modalPrevention');

  // Theme
  const themeToggle = document.getElementById('themeToggle');

  let mediaStream = null;
  let allDiseases = [];
  let currentFilter = 'all';

  // -----------------------------------------------------------------
  // Theme Toggle
  // -----------------------------------------------------------------
  const savedTheme = localStorage.getItem('agroai_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('agroai_theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }

  // -----------------------------------------------------------------
  // Tabs Navigation (Upload vs Camera)
  // -----------------------------------------------------------------
  uploadTabBtn.addEventListener('click', () => {
    uploadTabBtn.classList.add('active');
    cameraTabBtn.classList.remove('active');
    uploadArea.style.display = 'flex';
    cameraArea.style.display = 'none';
    stopCamera();
  });

  cameraTabBtn.addEventListener('click', async () => {
    cameraTabBtn.classList.add('active');
    uploadTabBtn.classList.remove('active');
    uploadArea.style.display = 'none';
    cameraArea.style.display = 'flex';
    startCamera();
  });

  // -----------------------------------------------------------------
  // File Upload Handlers
  // -----------------------------------------------------------------
  const mobileCameraBtn = document.getElementById('mobileCameraBtn');
  const mobileCameraInput = document.getElementById('mobileCameraInput');

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  if (mobileCameraBtn && mobileCameraInput) {
    mobileCameraBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileCameraInput.click();
    });

    mobileCameraInput.addEventListener('change', () => {
      if (mobileCameraInput.files.length > 0) {
        handleFile(mobileCameraInput.files[0]);
      }
    });
  }

  dropzone.addEventListener('click', (e) => {
    // Tugmalarga bosilganda qayta ochmaslik
    if (e.target !== browseBtn && e.target !== mobileCameraBtn) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  // -----------------------------------------------------------------
  // Camera Handlers
  // -----------------------------------------------------------------
  async function startCamera() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraVideo.srcObject = mediaStream;
    } catch (err) {
      alert("Kameraga ulanishda xatolik yuz berdi: " + err.message);
      uploadTabBtn.click();
    }
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  }

  stopCameraBtn.addEventListener('click', () => {
    stopCamera();
    uploadTabBtn.click();
  });

  captureBtn.addEventListener('click', () => {
    if (!cameraVideo.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_snapshot.jpg", { type: "image/jpeg" });
        stopCamera();
        uploadTabBtn.click();
        handleFile(file);
      }
    }, 'image/jpeg', 0.92);
  });

  // -----------------------------------------------------------------
  // Quick Sample Cards
  // -----------------------------------------------------------------
  document.querySelectorAll('.sample-card').forEach(card => {
    card.addEventListener('click', async () => {
      const imgPath = card.getAttribute('data-img');
      const filename = card.getAttribute('data-filename');
      try {
        setLoading(true);
        const resp = await fetch(imgPath);
        const blob = await resp.blob();
        const file = new File([blob], filename, { type: 'image/jpeg' });
        handleFile(file);
      } catch (e) {
        alert("Namunani yuklashda xatolik: " + e.message);
        setLoading(false);
      }
    });
  });

  // -----------------------------------------------------------------
  // Prediction Request
  // -----------------------------------------------------------------
  async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert("Iltimos, rasm faylini yuklang (JPG, PNG yoki WEBP).");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      resultThumb.src = e.target.result;
    };
    reader.readAsDataURL(file);

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      });

      const res = await response.json();
      if (!res.success) {
        alert(res.error || "Tahlil jarayonida xatolik yuz berdi.");
        setLoading(false);
        return;
      }

      displayResult(res.data);
    } catch (err) {
      alert("Server bilan aloqa uzildi: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    if (isLoading) {
      placeholderState.style.display = 'none';
      resultContent.style.display = 'none';
      loadingState.style.display = 'block';
    } else {
      loadingState.style.display = 'none';
    }
  }

  function displayResult(data) {
    const best = data.best_prediction;
    resultPlant.textContent = best.plant || "Ösimlik";
    resultDisease.textContent = best.disease || "Kasallik";
    resultPathogen.textContent = best.pathogen ? `Patogen: ${best.pathogen}` : "";

    // Severity tag
    resultSeverity.className = 'severity-tag';
    if (best.is_healthy) {
      resultSeverity.textContent = "Soğlom";
      resultSeverity.classList.add('success');
    } else if (best.severity === "Öta xavfli" || best.severity === "Jiddiy") {
      resultSeverity.textContent = best.severity;
      resultSeverity.classList.add('danger');
    } else {
      resultSeverity.textContent = best.severity || "Örta";
      resultSeverity.classList.add('warning');
    }

    // Confidence
    confidenceVal.textContent = best.confidence + "%";
    setTimeout(() => {
      progressBarFill.style.width = Math.min(100, Math.max(10, best.confidence)) + "%";
    }, 50);

    // Agro info
    textSymptoms.textContent = best.symptoms || "Ma'lumot mavjud emas.";
    textCauses.textContent = best.causes || "Ma'lumot mavjud emas.";
    textTreatment.textContent = best.treatment || "Tavsiyalar mavjud emas.";
    textPrevention.textContent = best.prevention || "Ma'lumot mavjud emas.";

    // Visual Features
    featuresStrip.innerHTML = '';
    if (data.visual_features) {
      const vf = data.visual_features;
      const pills = [
        { label: "Xlorofill (Soğlom)", val: (vf.xlorofill_soğlomlik || vf.xlorofill_soglomlik || 0) + "%" },
        { label: "Nekroz qöñğir doğ", val: (vf.nekroz_qöñğir_doğ || vf.nekroz_qongir_dog || 0) + "%" },
        { label: "Xloroz (Sarğayiş)", val: (vf.xloroz_sarğayiş || vf.xloroz_sargayish || 0) + "%" },
        { label: "Zañg pustulalari", val: (vf.zañg_doğlari || vf.zang_doglari || 0) + "%" },
        { label: "Unsimon ğubor", val: (vf.unsimon_ğubor || vf.unsimon_gubor || 0) + "%" }
      ];
      pills.forEach(p => {
        const span = document.createElement('div');
        span.className = 'feature-pill';
        span.innerHTML = `${p.label}: <span>${p.val}</span>`;
        featuresStrip.appendChild(span);
      });
    }

    // Top candidates
    candidatesList.innerHTML = '';
    if (data.top_candidates && data.top_candidates.length > 1) {
      data.top_candidates.slice(1, 4).forEach(cand => {
        const row = document.createElement('div');
        row.className = 'candidate-row';
        row.innerHTML = `
          <span class="candidate-name">${cand.plant} - ${cand.disease}</span>
          <span class="candidate-score">${cand.confidence}%</span>
        `;
        candidatesList.appendChild(row);
      });
    }

    placeholderState.style.display = 'none';
    resultContent.style.display = 'block';
  }

  // -----------------------------------------------------------------
  // Encyclopedia logic
  // -----------------------------------------------------------------
  async function loadEncyclopedia() {
    try {
      const resp = await fetch('/api/diseases');
      const data = await resp.json();
      allDiseases = data.diseases;

      // Extract unique plants for filter chips
      const plants = Array.from(new Set(allDiseases.map(d => d.plant))).sort();
      plants.forEach(plant => {
        const btn = document.createElement('button');
        btn.className = 'chip-btn';
        btn.textContent = plant;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = plant;
          renderEncyclopedia();
        });
        filterChips.appendChild(btn);
      });

      renderEncyclopedia();
    } catch (e) {
      console.error("Ensiklopediyani yuklashda xatolik:", e);
    }
  }

    // Normalizer function for seamless search in both old and new orthography
    function normalizeUz(str) {
      if (!str) return '';
      return str.toLowerCase()
        .replace(/sh/g, 'ş')
        .replace(/ch/g, 'ç')
        .replace(/o['‘ʻ`]/g, 'ö')
        .replace(/g['‘ʻ`]/g, 'ğ')
        .replace(/ñ/g, 'ng');
    }

    const query = normalizeUz(searchInput.value.trim());
    encyclopediaGrid.innerHTML = '';

    const filtered = allDiseases.filter(d => {
      const matchPlant = currentFilter === 'all' || d.plant === currentFilter;
      if (!query) return matchPlant;

      const pNorm = normalizeUz(d.plant);
      const dNorm = normalizeUz(d.disease);
      const pathNorm = normalizeUz(d.pathogen);
      const sNorm = normalizeUz(d.symptoms);

      return matchPlant && (
        pNorm.includes(query) ||
        dNorm.includes(query) ||
        pathNorm.includes(query) ||
        sNorm.includes(query)
      );
    });

    if (filtered.length === 0) {
      encyclopediaGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px;">Mos keluvçi kasallik topilmadi.</div>`;
      return;
    }

    filtered.forEach(d => {
      const card = document.createElement('div');
      card.className = 'disease-card';
      card.innerHTML = `
        <div class="disease-card-header">
          <span class="plant-badge">${d.plant}</span>
          <span class="severity-tag ${d.is_healthy ? 'success' : (d.severity === 'Öta xavfli' || d.severity === 'Jiddiy' ? 'danger' : 'warning')}">
            ${d.severity}
          </span>
        </div>
        <h4 class="disease-card-title">${d.disease}</h4>
        <div class="disease-card-pathogen">${d.pathogen}</div>
        <p class="disease-card-desc">${d.symptoms}</p>
        <button class="btn-card-details">Batafsil ma'lumot va tavsiyalar &rarr;</button>
      `;

      card.addEventListener('click', () => {
        openModal(d);
      });

      encyclopediaGrid.appendChild(card);
    });
  }

  searchInput.addEventListener('input', renderEncyclopedia);

  document.querySelector('.chip-btn[data-filter="all"]').addEventListener('click', (e) => {
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = 'all';
    renderEncyclopedia();
  });

  // Modal handlers
  function openModal(d) {
    modalTitle.textContent = d.disease;
    modalPlant.textContent = d.plant;
    modalPathogen.textContent = d.pathogen;
    modalSymptoms.textContent = d.symptoms;
    modalCauses.textContent = d.causes;
    modalTreatment.textContent = d.treatment;
    modalPrevention.textContent = d.prevention;
    diseaseModal.style.display = 'flex';
  }

  modalCloseBtn.addEventListener('click', () => {
    diseaseModal.style.display = 'none';
  });

  diseaseModal.addEventListener('click', (e) => {
    if (e.target === diseaseModal) {
      diseaseModal.style.display = 'none';
    }
  });

  // Initialize Encyclopedia
  loadEncyclopedia();
});
