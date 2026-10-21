import { renderMergeTool } from './tools/pdf/merge.js';
import { renderCompressTool } from './tools/image/compress.js';
import { renderExtractorTool } from './tools/text/extractor.js';
import { renderImg2PdfTool } from './tools/pdf/img2pdf.js';
import { renderAtsTool } from './tools/career/ats.js';
import { renderWatermarkTool } from './tools/pdf/watermark.js';

// Global Toast Alert Helper
export function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast) return;

  toastMsg.textContent = message;
  if (isError) {
    toastIcon.className = 'fa-solid fa-triangle-exclamation text-rose-500 text-lg';
  } else {
    toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 dark:text-emerald-600 text-lg';
  }

  toast.classList.remove('translate-y-24', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3000);
}

// Global Blob Downloader Helper
export function downloadBlob(bytesOrBlob, filename, mimeType) {
  const blob = bytesOrBlob instanceof Blob ? bytesOrBlob : new Blob([bytesOrBlob], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

// Master Tools Registry
const TOOLS = [
  {
    id: 'merge',
    path: '#/pdf/merge',
    title: 'Merge & Reorder PDF',
    desc: 'Combine multiple PDF files or reorder pages into a single document in seconds.',
    icon: 'fa-code-merge',
    color: 'red',
    render: renderMergeTool
  },
  {
    id: 'compress',
    path: '#/image/compress',
    title: 'Compressor & Resizer',
    desc: 'Reduce JPG, PNG, and PDF document footprints for government portals (UPSC, SSC, college portals).',
    icon: 'fa-file-zipper',
    color: 'emerald',
    render: renderCompressTool
  },
  {
    id: 'extractor',
    path: '#/text/extractor',
    title: 'PDF to Text & Markdown',
    desc: 'Instant client-side document parser. Strip unformatted text, calculate word counts, and export to .txt or .md.',
    icon: 'fa-file-lines',
    color: 'indigo',
    render: renderExtractorTool
  },
  {
    id: 'img2pdf',
    path: '#/pdf/img2pdf',
    title: 'Image to PDF Converter',
    desc: 'Batch convert JPG, PNG, and WebP scans into a single, clean A4/Letter PDF with adjustable margins.',
    icon: 'fa-images',
    color: 'amber',
    render: renderImg2PdfTool
  },
  {
    id: 'ats',
    path: '#/career/ats',
    title: 'ATS Resume Matcher',
    desc: 'Benchmark your resume against any company job description. Get instant percentage match scores and missing keywords.',
    icon: 'fa-bullseye',
    color: 'brand',
    popular: true,
    render: renderAtsTool
  },
  {
    id: 'watermark',
    path: '#/pdf/watermark',
    title: 'Watermark & Page Numbers',
    desc: 'Stamp "CONFIDENTIAL", candidate IDs, or page numbers across all pages without server uploads.',
    icon: 'fa-stamp',
    color: 'purple',
    render: renderWatermarkTool
  }
];

class AppRouter {
  constructor() {
    this.root = document.getElementById('app-root');
    this.modalRoot = document.getElementById('dm-modal-root');

    window.addEventListener('hashchange', () => this.route());
    this.initThemeToggle();
    this.initModals();
  }

  init() {
    this.route();
  }

  initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.onclick = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('dm_theme', isDark ? 'dark' : 'light');
      };
    }
  }

  route() {
    const hash = window.location.hash || '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const matchedTool = TOOLS.find(t => t.path === hash);
    if (matchedTool) {
      document.title = `${matchedTool.title} — DocuMatrix`;
      this.root.innerHTML = '';
      this.root.appendChild(matchedTool.render());
    } else {
      document.title = 'DocuMatrix — 100% Free & Private Online PDF & Career Suite';
      this.renderHome();
    }
  }

  renderHome() {
    this.root.innerHTML = `
      <section class="space-y-10">
        <!-- Hero Banner -->
        <div class="text-center max-w-3xl mx-auto pt-4 pb-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-4 border border-brand-200 dark:border-brand-900/50">
            <i class="fa-solid fa-bolt"></i> 100% Client-Side Engine • Zero Upload Latency
          </div>
          <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Every tool you need to work with <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-rose-500 to-indigo-600">PDFs & Careers</span>
          </h1>
          <p class="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Fast, open-source document utilities running entirely inside your web browser. Files never touch a remote server, making them safe for confidential documents, campus assignments, and job portals.
          </p>
        </div>

        <!-- 6 Original Tool Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          ${TOOLS.map(t => `
            <div onclick="window.location.hash='${t.path}'" class="group bg-white dark:bg-slate-900 rounded-2xl p-6 border ${t.popular ? 'border-2 border-brand-500/40 dark:border-brand-500/30' : 'border-slate-200 dark:border-slate-800'} hover:border-brand-500 dark:hover:border-brand-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden">
              ${t.popular ? `<div class="absolute top-3 right-3 bg-brand-600 text-white text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full">Popular</div>` : ''}
              <div>
                <div class="w-12 h-12 rounded-xl bg-${t.color === 'brand' ? 'brand-100 dark:bg-brand-950/50 text-brand-600' : t.color + '-100 dark:bg-' + t.color + '-950/50 text-' + t.color + '-600'} flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                  <i class="fa-solid ${t.icon}"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">${t.title}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">${t.desc}</p>
              </div>
              <div class="mt-6 flex items-center text-xs font-bold text-${t.color === 'brand' ? 'brand-600 dark:text-brand-400' : t.color + '-600 dark:text-' + t.color + '-400'} gap-1.5">
                Launch Tool <i class="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Feature Comparison Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mx-auto md:mx-0">
                <i class="fa-solid fa-lock"></i>
              </div>
              <h4 class="text-base font-bold">100% Client-Side Privacy</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Unlike other PDF portals that store your documents on remote servers, all conversions execute strictly inside your browser's RAM memory.</p>
            </div>
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-xl mx-auto md:mx-0">
                <i class="fa-solid fa-infinity"></i>
              </div>
              <h4 class="text-base font-bold">No Paywalls or Hidden Limits</h4>
              <p class="text-xs text-slate-400 leading-relaxed">No 3-file daily limits, no premium registrations, and no email subscriptions required to download your modified files.</p>
            </div>
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mx-auto md:mx-0">
                <i class="fa-solid fa-graduation-cap"></i>
              </div>
              <h4 class="text-base font-bold">Engineered for Students & HR</h4>
              <p class="text-xs text-slate-400 leading-relaxed">Optimized presets for exam admit cards, government job applications, university project submissions, and ATS screening.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  initModals() {
    const attachModal = (btnId, title, content) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.onclick = () => this.openModal(title, content);
    };

    const privacyText = `
      <p><strong>100% Client-Side Guarantee:</strong> DocuMatrix operates completely client-side in your local web browser. None of your uploaded files, images, PDFs, or resume documents are ever transmitted to any remote servers, cloud databases, or external APIs.</p>
      <p class="mt-2"><strong>Google AdSense & Cookies:</strong> We prepare ad units compliant with publisher policies. Third-party vendors use cookies to serve ads based on prior visits. You may opt out of personalized advertising by visiting Google Ad Settings.</p>
      <p class="mt-2"><strong>Zero File Retention:</strong> Because we possess no backend file store, your documents vanish from memory as soon as you close or refresh this tab.</p>
    `;

    const termsText = `
      <p>DocuMatrix provides open-source, client-side utility services on an "as is" and "as available" basis without warranties of any kind.</p>
      <p class="mt-2">Users are solely responsible for ensuring they possess the right to watermark, compress, or manipulate their respective documents.</p>
    `;

    const contactText = `
      <p>Need a custom tool, found an edge-case bug, or want to contribute?</p>
      <p class="mt-2">You can connect with the team via GitHub or email support at <code>contact@documatrix.local</code>. We typically reply within 24–48 hours.</p>
    `;

    attachModal('btn-open-privacy', 'Privacy Policy & Data Security', privacyText);
    attachModal('footer-btn-privacy', 'Privacy Policy & Data Security', privacyText);
    attachModal('footer-btn-terms', 'Terms of Service', termsText);
    attachModal('footer-btn-contact', 'Support & Developer Feedback', contactText);
  }

  openModal(title, content) {
    this.modalRoot.innerHTML = `
      <div id="legalModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
          <button id="modalCloseBtn" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-3">${title}</h3>
          <div class="text-xs text-slate-600 dark:text-slate-400 space-y-2 max-h-80 overflow-y-auto leading-relaxed">
            ${content}
          </div>
          <div class="mt-5 text-right">
            <button id="modalOkBtn" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold">Close</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.modalRoot.innerHTML = ''; };
    document.getElementById('modalCloseBtn').onclick = close;
    document.getElementById('modalOkBtn').onclick = close;
  }
}

// Bootstrap router
const app = new AppRouter();
app.init();