import { showToast, downloadBlob } from '../../app.js';

export function renderExtractorTool() {
  const container = document.createElement('section');
  container.className = 'space-y-6';

  container.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <a href="#/" class="text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1 flex items-center gap-1 no-underline">
          <i class="fa-solid fa-arrow-left"></i> Back to Tools
        </a>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-file-lines text-indigo-600"></i> PDF & Document Text Extractor
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Extract clean text strings from any PDF or document without formatting artifacts.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-5 space-y-4">
        <div id="extractorDropzone" class="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900/60 transition cursor-pointer hover:border-indigo-500">
          <input type="file" id="extractorInput" accept=".pdf,.txt,.md" class="hidden">
          <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center text-2xl mx-auto mb-3">
            <i class="fa-solid fa-file-arrow-up"></i>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Choose a PDF or Document</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Reads native PDF layers client-side</p>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Metrics Breakdown</h4>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
              <div class="text-lg font-bold text-slate-900 dark:text-white" id="extractedWordCount">0</div>
              <div class="text-[10px] text-slate-400 uppercase">Words</div>
            </div>
            <div class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
              <div class="text-lg font-bold text-slate-900 dark:text-white" id="extractedCharCount">0</div>
              <div class="text-[10px] text-slate-400 uppercase">Characters</div>
            </div>
            <div class="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
              <div class="text-lg font-bold text-indigo-600" id="extractedPageCount">0</div>
              <div class="text-[10px] text-slate-400 uppercase">Pages</div>
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <button id="btnCopyText" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
              <i class="fa-solid fa-copy"></i> Copy to Clipboard
            </button>
            <button id="btnDownloadText" class="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
              <i class="fa-solid fa-download"></i> Save as Plain Text (.txt)
            </button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col h-[520px]">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">Extracted Plaintext Content</h4>
            <span id="extractorStatus" class="text-xs text-slate-400">Waiting for file upload...</span>
          </div>
          <textarea id="extractedTextOutput" readonly placeholder="Parsed document text will appear here automatically..." class="w-full flex-1 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs leading-relaxed outline-none resize-none text-slate-800 dark:text-slate-200"></textarea>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const dropzone = container.querySelector('#extractorDropzone');
    const input = container.querySelector('#extractorInput');
    const output = container.querySelector('#extractedTextOutput');
    const status = container.querySelector('#extractorStatus');
    const btnCopy = container.querySelector('#btnCopyText');
    const btnDownload = container.querySelector('#btnDownloadText');

    if (!dropzone || !input) return;

    dropzone.onclick = () => input.click();

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      status.textContent = 'Parsing text layer...';
      output.value = '';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageStr = textContent.items.map(item => item.str).join(' ');
            fullText += `--- Page ${pageNum} ---\n` + pageStr + '\n\n';
          }

          output.value = fullText.trim();
          status.textContent = 'Extraction complete';
          container.querySelector('#extractedPageCount').textContent = pdf.numPages;
          updateMetrics(fullText);
          showToast('Extracted text successfully!');
        } catch (err) {
          status.textContent = 'Failed to extract text';
          showToast('Error reading PDF: ' + err.message, true);
        }
      } else {
        const text = await file.text();
        output.value = text;
        status.textContent = 'Extraction complete';
        container.querySelector('#extractedPageCount').textContent = 1;
        updateMetrics(text);
      }
    };

    function updateMetrics(text) {
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      container.querySelector('#extractedWordCount').textContent = words;
      container.querySelector('#extractedCharCount').textContent = text.length;
    }

    btnCopy.onclick = () => {
      const text = output.value;
      if (!text) return showToast('No text to copy', true);
      navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    };

    btnDownload.onclick = () => {
      const text = output.value;
      if (!text) return showToast('No text to download', true);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, 'extracted_document.txt', 'text/plain');
      showToast('Text file downloaded!');
    };
  }, 0);

  return container;
}