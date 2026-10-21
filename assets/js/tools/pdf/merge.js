import { showToast, downloadBlob } from '../../app.js';

let mergeFiles = [];

export function renderMergeTool() {
  mergeFiles = [];
  const container = document.createElement('section');
  container.className = 'space-y-6';

  container.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <a href="#/" class="text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1 flex items-center gap-1 no-underline">
          <i class="fa-solid fa-arrow-left"></i> Back to Tools
        </a>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-code-merge text-brand-600"></i> Merge Multiple PDF Files
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Combine separate PDFs in your specified order into a single unified file.</p>
      </div>
    </div>

    <!-- Dropzone -->
    <div id="mergeDropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900/60 transition cursor-pointer hover:border-brand-500">
      <input type="file" id="mergeFileInput" multiple accept=".pdf" class="hidden">
      <div class="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center text-2xl mx-auto mb-3">
        <i class="fa-solid fa-file-pdf"></i>
      </div>
      <h4 class="text-base font-bold text-slate-900 dark:text-white">Choose PDF files or drop them here</h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Select 2 or more PDF documents to merge</p>
      <button type="button" class="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm">Select Files</button>
    </div>

    <!-- File Queue & Reorder List -->
    <div id="mergeQueueContainer" class="hidden bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white">Documents to Merge (<span id="mergeCount">0</span>)</h4>
        <button id="btnClearMerge" class="text-xs text-rose-500 hover:underline font-semibold">Clear All</button>
      </div>

      <div id="mergeFileList" class="space-y-2"></div>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
        <div class="text-xs text-slate-500">Files will be merged in top-to-bottom sequence.</div>
        <button id="btnExecuteMerge" class="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
          <i class="fa-solid fa-layer-group"></i> Merge and Download PDF
        </button>
      </div>
    </div>
  `;

  // Attach event listeners after DOM injection
  setTimeout(() => {
    const dropzone = container.querySelector('#mergeDropzone');
    const input = container.querySelector('#mergeFileInput');
    const btnClear = container.querySelector('#btnClearMerge');
    const btnExecute = container.querySelector('#btnExecuteMerge');

    dropzone.onclick = () => input.click();

    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dropzone-active'); };
    dropzone.ondragleave = () => dropzone.classList.remove('dropzone-active');
    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('dropzone-active');
      handleFiles(Array.from(e.dataTransfer.files));
    };

    input.onchange = (e) => handleFiles(Array.from(e.target.files));

    btnClear.onclick = () => {
      mergeFiles = [];
      renderQueue(container);
      input.value = '';
    };

    btnExecute.onclick = async () => {
      if (mergeFiles.length < 2) {
        showToast('Please select at least 2 PDF documents to merge', true);
        return;
      }

      btnExecute.disabled = true;
      btnExecute.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Merging in Browser...';

      try {
        const mergedPdf = await window.PDFLib.PDFDocument.create();

        for (const file of mergeFiles) {
          const arrayBuffer = await file.arrayBuffer();
          const doc = await window.PDFLib.PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        downloadBlob(mergedPdfBytes, 'merged_document.pdf', 'application/pdf');
        showToast('Merged successfully!');
      } catch (err) {
        showToast('Error merging PDFs: ' + err.message, true);
      } finally {
        btnExecute.disabled = false;
        btnExecute.innerHTML = '<i class="fa-solid fa-layer-group"></i> Merge and Download PDF';
      }
    };
  }, 0);

  function handleFiles(files) {
    files.forEach(f => {
      if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
        mergeFiles.push(f);
      }
    });
    renderQueue(container);
  }

  function renderQueue(root) {
    const queueCont = root.querySelector('#mergeQueueContainer');
    const list = root.querySelector('#mergeFileList');
    const count = root.querySelector('#mergeCount');

    if (mergeFiles.length === 0) {
      queueCont.classList.add('hidden');
      return;
    }

    queueCont.classList.remove('hidden');
    count.textContent = mergeFiles.length;
    list.innerHTML = '';

    mergeFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs';
      item.innerHTML = `
        <div class="flex items-center gap-3 truncate">
          <span class="w-6 h-6 rounded bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px]">${index + 1}</span>
          <span class="font-medium truncate text-slate-800 dark:text-slate-200">${file.name}</span>
          <span class="text-slate-400 text-[10px]">(${(file.size / 1024).toFixed(1)} KB)</span>
        </div>
        <div class="flex items-center gap-2">
          <button data-action="up" class="p-1 hover:text-brand-600 disabled:opacity-30" ${index === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-up"></i></button>
          <button data-action="down" class="p-1 hover:text-brand-600 disabled:opacity-30" ${index === mergeFiles.length - 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-down"></i></button>
          <button data-action="del" class="p-1 text-rose-500 hover:text-rose-700 ml-2"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;

      item.querySelector('[data-action="up"]')?.addEventListener('click', () => {
        const temp = mergeFiles[index - 1];
        mergeFiles[index - 1] = mergeFiles[index];
        mergeFiles[index] = temp;
        renderQueue(root);
      });

      item.querySelector('[data-action="down"]')?.addEventListener('click', () => {
        const temp = mergeFiles[index + 1];
        mergeFiles[index + 1] = mergeFiles[index];
        mergeFiles[index] = temp;
        renderQueue(root);
      });

      item.querySelector('[data-action="del"]').addEventListener('click', () => {
        mergeFiles.splice(index, 1);
        renderQueue(root);
      });

      list.appendChild(item);
    });
  }

  return container;
}