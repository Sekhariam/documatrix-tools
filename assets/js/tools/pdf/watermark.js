import { showToast, downloadBlob } from '../../app.js';

let currentWatermarkFile = null;

export function renderWatermarkTool() {
  currentWatermarkFile = null;
  const container = document.createElement('section');
  container.className = 'space-y-6';

  container.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <a href="#/" class="text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1 flex items-center gap-1 no-underline">
          <i class="fa-solid fa-arrow-left"></i> Back to Tools
        </a>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-stamp text-purple-600"></i> PDF Watermark & Page Numberer
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Add secure confidentiality stamps and bottom-center page numbers to every page of your PDF.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-5 space-y-4">
        <div id="watermarkDropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900/60 transition cursor-pointer hover:border-purple-500">
          <input type="file" id="watermarkInput" accept=".pdf" class="hidden">
          <div class="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-2xl mx-auto mb-3">
            <i class="fa-solid fa-shield"></i>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white" id="watermarkFileName">Choose PDF Document</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Select any PDF to stamp</p>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Watermark Text</label>
            <input type="text" id="wmText" value="CONFIDENTIAL" class="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Opacity (%)</label>
              <input type="number" id="wmOpacity" min="5" max="90" value="25" class="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rotation Angle</label>
              <select id="wmRotation" class="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold">
                <option value="45" selected>Diagonal (45°)</option>
                <option value="0">Horizontal (0°)</option>
                <option value="90">Vertical (90°)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input type="checkbox" id="wmPageNumbers" checked class="w-4 h-4 text-purple-600 rounded">
            <label for="wmPageNumbers" class="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">Add "Page X of Y" numbers at the footer</label>
          </div>

          <button id="btnApplyWatermark" disabled class="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mt-2">
            <i class="fa-solid fa-stamp"></i> Apply & Download PDF
          </button>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-full flex flex-col justify-center items-center text-center p-8">
          <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-2xl mb-3">
            <i class="fa-solid fa-eye"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">Real-Time Canvas Injection</h4>
          <p class="text-xs text-slate-500 max-w-sm mt-1">Watermarks and footer counters are injected directly into the PDF binary streams via vector coordinates, ensuring crisp vector text at any zoom level.</p>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const dropzone = container.querySelector('#watermarkDropzone');
    const input = container.querySelector('#watermarkInput');
    const btnApply = container.querySelector('#btnApplyWatermark');

    dropzone.onclick = () => input.click();

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      currentWatermarkFile = file;
      container.querySelector('#watermarkFileName').textContent = file.name;
      btnApply.disabled = false;
    };

    btnApply.onclick = async () => {
      if (!currentWatermarkFile) return;

      btnApply.disabled = true;
      btnApply.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Stamping Document...';

      try {
        const text = container.querySelector('#wmText').value || 'CONFIDENTIAL';
        const opacity = parseInt(container.querySelector('#wmOpacity').value) / 100;
        const rotation = parseInt(container.querySelector('#wmRotation').value);
        const addPageNumbers = container.querySelector('#wmPageNumbers').checked;

        const arrayBuffer = await currentWatermarkFile.arrayBuffer();
        const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(window.PDFLib.StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);

        const totalPages = pages.length;

        for (let i = 0; i < totalPages; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();

          const fontSize = 48;
          page.drawText(text, {
            x: width / 4,
            y: height / 2,
            size: fontSize,
            font: font,
            color: window.PDFLib.rgb(0.8, 0.1, 0.2),
            opacity: opacity,
            rotate: window.PDFLib.degrees(rotation),
          });

          if (addPageNumbers) {
            const pageStr = `Page ${i + 1} of ${totalPages}`;
            page.drawText(pageStr, {
              x: width / 2 - 30,
              y: 20,
              size: 10,
              font: fontRegular,
              color: window.PDFLib.rgb(0.4, 0.4, 0.4),
            });
          }
        }

        const pdfBytes = await pdfDoc.save();
        downloadBlob(pdfBytes, 'watermarked_' + currentWatermarkFile.name, 'application/pdf');
        showToast('Document stamped & downloaded!');
      } catch (err) {
        showToast('Watermarking error: ' + err.message, true);
      } finally {
        btnApply.disabled = false;
        btnApply.innerHTML = '<i class="fa-solid fa-stamp"></i> Apply & Download PDF';
      }
    };
  }, 0);

  return container;
}