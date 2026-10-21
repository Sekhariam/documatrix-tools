import { showToast, downloadBlob } from '../../app.js';

let img2PdfFiles = [];

export function renderImg2PdfTool() {
  img2PdfFiles = [];
  const container = document.createElement('section');
  container.className = 'space-y-6';

  container.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <a href="#/" class="text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1 flex items-center gap-1 no-underline">
          <i class="fa-solid fa-arrow-left"></i> Back to Tools
        </a>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-images text-amber-600"></i> Batch Image to PDF Converter
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Convert multiple JPG, PNG, or WebP images into a single standardized PDF file.</p>
      </div>
    </div>

    <div id="img2PdfDropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900/60 transition cursor-pointer hover:border-amber-500">
      <input type="file" id="img2PdfInput" multiple accept="image/jpeg,image/png,image/webp" class="hidden">
      <div class="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-3">
        <i class="fa-solid fa-photo-film"></i>
      </div>
      <h4 class="text-base font-bold text-slate-900 dark:text-white">Choose Images to Convert</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Select one or multiple images (order can be rearranged below)</p>
    </div>

    <!-- Image Queue Container -->
    <div id="img2PdfContainer" class="hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white">Selected Images (<span id="img2PdfCount">0</span>)</h4>
        <div class="flex items-center gap-4">
          <select id="imgPageSize" class="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold">
            <option value="a4_fit">A4 Page (Scale to fit)</option>
            <option value="original">Preserve Original Dimensions</option>
          </select>
          <button id="btnResetImg2Pdf" class="text-xs text-rose-500 hover:underline font-semibold">Reset</button>
        </div>
      </div>

      <div id="img2PdfGrid" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3"></div>

      <div class="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
        <button id="btnCompilePdf" class="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2">
          <i class="fa-solid fa-file-export"></i> Compile and Download PDF
        </button>
      </div>
    </div>
  `;

  setTimeout(() => {
    const dropzone = container.querySelector('#img2PdfDropzone');
    const input = container.querySelector('#img2PdfInput');
    const btnReset = container.querySelector('#btnResetImg2Pdf');
    const btnCompile = container.querySelector('#btnCompilePdf');

    dropzone.onclick = () => input.click();

    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      img2PdfFiles = img2PdfFiles.concat(files);
      renderGrid();
    };

    btnReset.onclick = () => {
      img2PdfFiles = [];
      renderGrid();
    };

    btnCompile.onclick = async () => {
      if (img2PdfFiles.length === 0) return showToast('Please select images', true);

      btnCompile.disabled = true;
      btnCompile.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Compiling...';

      try {
        const pdfDoc = await window.PDFLib.PDFDocument.create();

        for (const file of img2PdfFiles) {
          const arrayBuffer = await file.arrayBuffer();
          let img;
          if (file.type === 'image/png') {
            img = await pdfDoc.embedPng(arrayBuffer);
          } else {
            img = await pdfDoc.embedJpg(arrayBuffer);
          }

          const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions
          const { width, height } = page.getSize();

          const margin = 30;
          const maxWidth = width - margin * 2;
          const maxHeight = height - margin * 2;

          let imgWidth = img.width;
          let imgHeight = img.height;

          const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
          imgWidth = imgWidth * ratio;
          imgHeight = imgHeight * ratio;

          page.drawImage(img, {
            x: (width - imgWidth) / 2,
            y: (height - imgHeight) / 2,
            width: imgWidth,
            height: imgHeight,
          });
        }

        const pdfBytes = await pdfDoc.save();
        downloadBlob(pdfBytes, 'converted_images.pdf', 'application/pdf');
        showToast('PDF compiled successfully!');
      } catch (err) {
        showToast('Conversion error: ' + err.message, true);
      } finally {
        btnCompile.disabled = false;
        btnCompile.innerHTML = '<i class="fa-solid fa-file-export"></i> Compile and Download PDF';
      }
    };

    function renderGrid() {
      const cont = container.querySelector('#img2PdfContainer');
      const grid = container.querySelector('#img2PdfGrid');
      const countEl = container.querySelector('#img2PdfCount');

      if (img2PdfFiles.length === 0) {
        cont.classList.add('hidden');
        return;
      }

      cont.classList.remove('hidden');
      countEl.textContent = img2PdfFiles.length;
      grid.innerHTML = '';

      img2PdfFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'relative aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700';
        div.innerHTML = `
          <img src="${URL.createObjectURL(file)}" class="w-full h-full object-cover">
          <div class="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">${index + 1}</div>
          <button data-idx="${index}" class="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]"><i class="fa-solid fa-xmark"></i></button>
        `;

        div.querySelector('button').addEventListener('click', () => {
          img2PdfFiles.splice(index, 1);
          renderGrid();
        });

        grid.appendChild(div);
      });
    }
  }, 0);

  return container;
}