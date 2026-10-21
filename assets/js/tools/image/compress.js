import { showToast, downloadBlob } from '../../app.js';

let currentCompressFile = null;
let compressedBlob = null;

export function renderCompressTool() {
  currentCompressFile = null;
  compressedBlob = null;

  const container = document.createElement('section');
  container.className = 'space-y-6';

  container.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <a href="#/" class="text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1 flex items-center gap-1 no-underline">
          <i class="fa-solid fa-arrow-left"></i> Back to Tools
        </a>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-file-zipper text-emerald-600"></i> Document & Image Compressor
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Reduce document file sizes for portals with strict upload limits (e.g., under 100KB or 500KB).</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-4">
        <div id="compressDropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900/60 transition cursor-pointer hover:border-emerald-500">
          <input type="file" id="compressInput" accept="image/jpeg,image/png,image/webp" class="hidden">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
            <i class="fa-solid fa-down-left-and-up-right-to-center"></i>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Upload image or document page</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports JPG, PNG, WebP (Ideal for marksheets, ID cards, photo signatures)</p>
        </div>

        <!-- Controls -->
        <div id="compressControls" class="hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <div class="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Compression Quality</span>
              <span id="compressQualityLabel">75%</span>
            </div>
            <input type="range" id="compressQuality" min="10" max="95" value="75" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600">
            <div class="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Smallest File</span>
              <span>Balanced</span>
              <span>Crisp Clarity</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Max Resolution Width (px)</label>
            <select id="compressMaxDim" class="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="original">Maintain Original Dimensions</option>
              <option value="1920">Full HD (1920px width)</option>
              <option value="1280" selected>Standard Document (1280px width)</option>
              <option value="800">Compact Signature / Thumbnail (800px width)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Output Inspection & Preview -->
      <div class="lg:col-span-5">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between h-full">
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3">Compression Inspection</h4>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <span class="text-[10px] uppercase font-bold text-slate-400">Original Size</span>
                <div id="origSize" class="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">--</div>
              </div>
              <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                <span class="text-[10px] uppercase font-bold text-emerald-600">Compressed Size</span>
                <div id="newSize" class="text-base font-bold text-emerald-600 mt-0.5">--</div>
              </div>
            </div>

            <!-- Preview Frame -->
            <div class="w-full h-44 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
              <img id="compressPreview" class="max-h-full max-w-full object-contain hidden" alt="Compressed Preview">
              <span id="compressPlaceholderText" class="text-xs text-slate-400 italic">No image loaded yet</span>
            </div>
          </div>

          <button id="btnDownloadCompressed" disabled class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4">
            <i class="fa-solid fa-download"></i> Download Compressed File
          </button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const dropzone = container.querySelector('#compressDropzone');
    const input = container.querySelector('#compressInput');
    const qualityInput = container.querySelector('#compressQuality');
    const qualityLabel = container.querySelector('#compressQualityLabel');
    const maxDimSelect = container.querySelector('#compressMaxDim');
    const btnDownload = container.querySelector('#btnDownloadCompressed');

    dropzone.onclick = () => input.click();

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      currentCompressFile = file;
      container.querySelector('#origSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
      container.querySelector('#compressControls').classList.remove('hidden');
      runRecompress();
    };

    qualityInput.oninput = (e) => {
      qualityLabel.textContent = e.target.value + '%';
      runRecompress();
    };

    maxDimSelect.onchange = () => runRecompress();

    btnDownload.onclick = () => {
      if (!compressedBlob || !currentCompressFile) return;
      downloadBlob(compressedBlob, 'compressed_' + currentCompressFile.name.replace(/\.[^/.]+$/, "") + '.jpg', 'image/jpeg');
      showToast('Compressed file downloaded!');
    };

    function runRecompress() {
      if (!currentCompressFile) return;

      const quality = parseInt(qualityInput.value) / 100;
      const maxDim = maxDimSelect.value;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (maxDim !== 'original') {
            const max = parseInt(maxDim);
            if (width > max) {
              height = Math.round((height * max) / width);
              width = max;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            compressedBlob = blob;
            container.querySelector('#newSize').textContent = (blob.size / 1024).toFixed(1) + ' KB';
            
            const preview = container.querySelector('#compressPreview');
            preview.src = URL.createObjectURL(blob);
            preview.classList.remove('hidden');
            container.querySelector('#compressPlaceholderText').classList.add('hidden');

            btnDownload.disabled = false;
          }, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(currentCompressFile);
    }
  }, 0);

  return container;
}