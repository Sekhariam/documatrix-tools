import { showToast } from '../../app.js';

const ACTION_VERBS = new Set([
  'spearheaded', 'orchestrated', 'architected', 'developed', 'engineered', 
  'optimized', 'streamlined', 'implemented', 'designed', 'accelerated', 
  'reduced', 'increased', 'mentored', 'analyzed', 'automated', 'deployed'
]);

const ATS_STOPWORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','has','he','in','is','it',
  'of','on','that','the','to','was','were','will','with','this','they','have','had'
]);

export function renderAtsTool() {
  const container = document.createElement('section');
  container.className = 'space-y-6';

  container.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <a href="#/" class="text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1 flex items-center gap-1 no-underline">
          <i class="fa-solid fa-arrow-left"></i> Back to Tools
        </a>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i class="fa-solid fa-bullseye text-brand-600"></i> ATS Resume Keyword Matcher & Parser
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Analyze your resume against any company job description to maximize screening pass rates.</p>
      </div>
      <button id="btnLoadSampleAts" class="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-semibold transition">
        Load Sample
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-2">
        <div class="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
          <span><i class="fa-solid fa-user-tie text-emerald-500 mr-1"></i> Candidate Resume Text</span>
          <span id="atsResumeWords" class="text-slate-400 font-normal">0 words</span>
        </div>
        <textarea id="atsResumeText" placeholder="Paste your clean resume text here (Education, Experience, Skills)..." class="w-full h-64 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-xs font-sans resize-y"></textarea>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
          <span><i class="fa-solid fa-briefcase text-indigo-500 mr-1"></i> Target Job Description</span>
          <span id="atsJdWords" class="text-slate-400 font-normal">0 words</span>
        </div>
        <textarea id="atsJdText" placeholder="Paste the target job description requirements, responsibilities, and qualifications..." class="w-full h-64 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-xs font-sans resize-y"></textarea>
      </div>
    </div>

    <!-- Dashboard Results -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">ATS Match Score</span>
        <div id="atsScoreValue" class="text-3xl font-extrabold text-brand-600 mt-1">0%</div>
        <p id="atsScoreLabel" class="text-[11px] text-slate-400 mt-0.5">Paste texts to calculate</p>
      </div>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matched Skills</span>
        <div id="atsMatchCount" class="text-3xl font-extrabold text-emerald-600 mt-1">0</div>
        <p class="text-[11px] text-slate-400 mt-0.5">Aligned credentials</p>
      </div>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Missing Critical Terms</span>
        <div id="atsMissingCount" class="text-3xl font-extrabold text-rose-600 mt-1">0</div>
        <p class="text-[11px] text-slate-400 mt-0.5">Terms to integrate</p>
      </div>
      <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Verbs Found</span>
        <div id="atsActionVerbsCount" class="text-3xl font-extrabold text-indigo-600 mt-1">0</div>
        <p class="text-[11px] text-slate-400 mt-0.5">Measurable impact</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Matched Qualifications</h4>
        <div id="atsMatchedList" class="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
          <span class="text-xs text-slate-400 italic">None detected</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-bold uppercase tracking-wider text-rose-600 mb-2">Missing High-Impact Keywords</h4>
        <div id="atsMissingList" class="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
          <span class="text-xs text-slate-400 italic">None detected</span>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const resumeEl = container.querySelector('#atsResumeText');
    const jdEl = container.querySelector('#atsJdText');
    const btnSample = container.querySelector('#btnLoadSampleAts');

    resumeEl.oninput = () => audit();
    jdEl.oninput = () => audit();

    btnSample.onclick = () => {
      resumeEl.value = `Jane Doe\nSoftware Engineer | jane.doe@domain.com\n\nPROFESSIONAL SUMMARY\nResults-oriented software developer with 3+ years experience building scalable applications using React, Node.js, and TypeScript. Spearheaded microservice containerization using Docker and AWS.\n\nTECHNICAL SKILLS\nLanguages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3\nFrameworks: React, Node.js, Express, Tailwind CSS\nTools & Cloud: Git, Docker, Kubernetes, AWS, PostgreSQL, MongoDB, REST APIs\n\nEXPERIENCE\nSoftware Developer — Enterprise Systems (2022 - Present)\n- Architected REST APIs serving 150,000+ daily active users with 99.98% uptime.\n- Optimized database indexing in PostgreSQL, reducing query latency by 42%.\n- Automated CI/CD deployment pipelines using GitHub Actions and Docker.`;
      
      jdEl.value = `Position: Full Stack Engineer\nLocation: Remote\n\nResponsibilities:\n- Build and maintain modern web applications using React, TypeScript, and Node.js.\n- Implement robust backend REST APIs connected to PostgreSQL or MongoDB databases.\n- Deploy services using Docker containerization and AWS infrastructure.\n- Collaborate with engineering leads to optimize performance, caching, and CI/CD pipelines.\n\nQualifications:\n- 2+ years experience in React, TypeScript, and Node.js.\n- Strong proficiency in SQL, Git version control, and cloud computing.`;

      audit();
      showToast('Loaded sample ATS profile!');
    };

    function audit() {
      const resume = resumeEl.value;
      const jd = jdEl.value;

      const resumeWords = resume.trim() ? resume.trim().split(/\s+/).length : 0;
      const jdWords = jd.trim() ? jd.trim().split(/\s+/).length : 0;

      container.querySelector('#atsResumeWords').textContent = `${resumeWords} words`;
      container.querySelector('#atsJdWords').textContent = `${jdWords} words`;

      if (!resume.trim() || !jd.trim()) {
        container.querySelector('#atsScoreValue').textContent = '0%';
        container.querySelector('#atsScoreLabel').textContent = 'Paste texts to calculate';
        container.querySelector('#atsMatchCount').textContent = '0';
        container.querySelector('#atsMissingCount').textContent = '0';
        container.querySelector('#atsActionVerbsCount').textContent = '0';
        container.querySelector('#atsMatchedList').innerHTML = '<span class="text-xs text-slate-400 italic">None detected</span>';
        container.querySelector('#atsMissingList').innerHTML = '<span class="text-xs text-slate-400 italic">None detected</span>';
        return;
      }

      const extractTokens = (str) => {
        return str.toLowerCase()
          .replace(/[^\w\s+#.-]/g, ' ')
          .split(/\s+/)
          .filter(t => t.length > 2 && !ATS_STOPWORDS.has(t));
      };

      const resumeTokens = new Set(extractTokens(resume));
      const jdTokens = extractTokens(jd);

      const jdFreq = {};
      jdTokens.forEach(t => jdFreq[t] = (jdFreq[t] || 0) + 1);

      const targetKeywords = Object.keys(jdFreq).filter(k => jdFreq[k] >= 2 || k.length >= 6);

      const matched = [];
      const missing = [];

      targetKeywords.forEach(k => {
        if (resumeTokens.has(k) || resume.toLowerCase().includes(k)) {
          matched.push(k);
        } else {
          missing.push(k);
        }
      });

      let verbsFound = 0;
      resumeTokens.forEach(tok => {
        if (ACTION_VERBS.has(tok)) verbsFound++;
      });

      const totalTarget = matched.length + missing.length;
      const score = totalTarget === 0 ? 0 : Math.round((matched.length / totalTarget) * 100);

      container.querySelector('#atsScoreValue').textContent = `${score}%`;
      container.querySelector('#atsMatchCount').textContent = matched.length;
      container.querySelector('#atsMissingCount').textContent = missing.length;
      container.querySelector('#atsActionVerbsCount').textContent = verbsFound;

      const label = container.querySelector('#atsScoreLabel');
      if (score >= 75) {
        label.textContent = 'High Candidate Alignment';
        label.className = 'text-[11px] text-emerald-500 font-bold mt-0.5';
      } else if (score >= 45) {
        label.textContent = 'Moderate Match (Optimize)';
        label.className = 'text-[11px] text-amber-500 font-bold mt-0.5';
      } else {
        label.textContent = 'High Risk of Rejection';
        label.className = 'text-[11px] text-rose-500 font-bold mt-0.5';
      }

      container.querySelector('#atsMatchedList').innerHTML = matched.length 
        ? matched.map(m => `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs">${m}</span>`).join('')
        : '<span class="text-xs text-slate-400 italic">None</span>';

      container.querySelector('#atsMissingList').innerHTML = missing.length 
        ? missing.map(m => `<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 text-xs">${m}</span>`).join('')
        : '<span class="text-xs text-slate-400 italic">None</span>';
    }
  }, 0);

  return container;
}