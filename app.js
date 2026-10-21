/**
 * 進金生能源 6692 ｜ 太陽光電巡檢報告平台 (CF-086) 核心前端控制模組
 */

// 全域狀態
let currentReport = null;
let currentRole = 'engineer'; // 'engineer' | 'manager' | 'client'
let allReports = [];

// DOM 載入後初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 1. 初始化 Lucide 圖標
  if (window.lucide) lucide.createIcons();

  // 2. 載入資料
  await initializeApp();

  // 3. 綁定拖曳上傳監聽
  setupDropzone();
});

async function initializeApp() {
  updateSupabaseStatusPill();

  // 預填 Supabase 設定表單
  if (document.getElementById('sb-settings-url')) {
    document.getElementById('sb-settings-url').value = SupabaseConfig.getUrl();
  }
  if (document.getElementById('sb-settings-key')) {
    document.getElementById('sb-settings-key').value = SupabaseConfig.getKey();
  }

  // 載入報告清單 (優先自 Supabase 雲端即時同步)
  allReports = await window.supabaseService.getReports();
  currentReport = allReports[0] || window.SEED_REPORT;

  // 渲染清單與表單
  renderReportsTable();
  populateFormFromReport();
  renderOfficialReportView();
  updateReviewTab();
  loadSqlSchemaPreview();
}

// 狀態指示燈
function updateSupabaseStatusPill() {
  const isConn = window.supabaseService && window.supabaseService.isConnected;
  const pill = document.getElementById('supabase-status-pill');
  const text = document.getElementById('supabase-status-text');

  if (isConn) {
    pill.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm';
    text.textContent = '🟢 Supabase 雲端已連線 (即時同步)';
  } else {
    pill.className = 'flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition shadow-sm';
    text.textContent = '🟠 本地展示模式 (點擊設定)';
  }
}

// 分頁切換
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-blue-700', 'text-white', 'shadow-sm', 'active');
    btn.classList.add('text-slate-600', 'hover:bg-slate-200');
  });

  const activeContent = document.getElementById(`tab-${tabId}`);
  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeContent) activeContent.classList.remove('hidden');
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-200');
    activeBtn.classList.add('bg-blue-700', 'text-white', 'shadow-sm', 'active');
  }

  if (tabId === 'preview') {
    renderOfficialReportView();
  } else if (tabId === 'review') {
    updateReviewTab();
  }

  if (window.lucide) lucide.createIcons();
}

// 角色切換
function setRole(role) {
  currentRole = role;
  ['engineer', 'manager', 'client'].forEach(r => {
    const btn = document.getElementById(`role-${r}-btn`);
    if (r === role) {
      btn.className = 'px-2.5 py-1 rounded bg-white text-blue-700 shadow-sm font-semibold transition';
    } else {
      btn.className = 'px-2.5 py-1 rounded text-slate-600 hover:text-slate-900 transition';
    }
  });

  if (role === 'client') {
    switchTab('preview');
  }
}

// 渲染報告清單
function renderReportsTable() {
  const tbody = document.getElementById('reports-table-body');
  if (!tbody) return;

  tbody.innerHTML = allReports.map(rep => {
    const statusMap = {
      draft: { text: '草稿', cls: 'badge-draft' },
      submitted: { text: '待主管審核', cls: 'badge-submitted' },
      approved: { text: '已核准', cls: 'badge-approved' },
      dispatched: { text: '已發送業主', cls: 'badge-dispatched' }
    };
    const st = statusMap[rep.status] || { text: rep.status, cls: 'badge-draft' };
    const engineers = Array.isArray(rep.engineers) ? rep.engineers.join('、') : rep.engineers;

    return `
      <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="selectReport('${rep.id}')">
        <td class="px-5 py-3 font-mono font-bold text-blue-900">${rep.report_number}</td>
        <td class="px-5 py-3 font-bold text-slate-800">${rep.site_name}</td>
        <td class="px-5 py-3">${rep.capacity_kwp} kWp</td>
        <td class="px-5 py-3">${rep.inspection_date} (${rep.quarter})</td>
        <td class="px-5 py-3">${engineers}</td>
        <td class="px-5 py-3">
          <span class="text-xs px-2.5 py-0.5 rounded font-bold ${st.cls}">
            ${st.text}
          </span>
        </td>
        <td class="px-5 py-3 text-right space-x-1">
          <button onclick="event.stopPropagation(); selectReport('${rep.id}'); switchTab('preview');" class="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition">
            預覽
          </button>
          <button onclick="event.stopPropagation(); selectReport('${rep.id}'); switchTab('editor');" class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition">
            編輯
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function selectReport(id) {
  const found = allReports.find(r => r.id === id);
  if (found) {
    currentReport = found;
    populateFormFromReport();
    renderOfficialReportView();
    updateReviewTab();
  }
}

// 快速帶入示範語音文字
function loadSamplePrompt() {
  const sample = window.SEED_REPORT.raw_natural_language;
  document.getElementById('ai-prompt-input').value = sample;
}

function clearPromptInput() {
  document.getElementById('ai-prompt-input').value = '';
}

// 觸發 AI 自然語言解析
async function triggerAIParse() {
  const text = document.getElementById('ai-prompt-input').value.trim();
  if (!text) {
    alert('請先輸入工程師現場口述或巡檢筆記內容');
    return;
  }

  const btn = document.getElementById('btn-run-ai-parse');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>AI 深度剖析與表單映射中...</span>`;
  if (window.lucide) lucide.createIcons();

  try {
    const updated = await window.AIInspectionParser.parseNaturalLanguage(text, currentReport);
    currentReport = updated;
    await window.supabaseService.saveReport(currentReport);
    
    // 更新清單與表單
    allReports = await window.supabaseService.getReports();
    renderReportsTable();
    populateFormFromReport();
    renderOfficialReportView();

    alert('🎉 AI 自然語言成功萃取！已精準填入 CF-086 各項環境讀數、建議缺失與電性判定！');
    switchTab('preview');
  } catch (err) {
    console.error('AI 解析失敗:', err);
    alert('AI 解析過程中發生錯誤: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    if (window.lucide) lucide.createIcons();
  }
}

// 設置相片拖曳上傳
function setupDropzone() {
  const dropzone = document.getElementById('photo-dropzone');
  if (!dropzone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('border-blue-500', 'bg-blue-50/50');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-blue-500', 'bg-blue-50/50');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handlePhotoUpload(files);
  }, false);
}

// 處理相片上傳
async function handlePhotoUpload(files) {
  if (!files || files.length === 0) return;

  const thumbsContainer = document.getElementById('uploaded-thumbnails-grid');
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const classification = window.AIInspectionParser.classifyPhoto(file.name);
    
    const uploaded = await window.supabaseService.uploadPhoto(file, classification.category);
    
    // 加至相片目錄
    const newPhoto = {
      id: 'photo-' + Date.now() + '-' + i,
      category: classification.category,
      title: classification.title,
      url: uploaded.url,
      storage: uploaded.storage,
      page: classification.page,
      pos: classification.pos
    };

    if (!currentReport.photos_manifest) currentReport.photos_manifest = [];
    currentReport.photos_manifest.push(newPhoto);

    // 渲染預覽縮圖
    const thumb = document.createElement('div');
    thumb.className = 'relative group rounded-lg overflow-hidden border border-slate-300 bg-white p-1 text-center';
    thumb.innerHTML = `
      <img src="${uploaded.url}" class="w-full h-20 object-cover rounded">
      <p class="text-[10px] font-bold text-slate-700 truncate mt-1">${newPhoto.title}</p>
      <span class="text-[9px] text-blue-600 block">[第${newPhoto.page}頁]</span>
    `;
    thumbsContainer.appendChild(thumb);
  }

  // 儲存更新
  await window.supabaseService.saveReport(currentReport);
}

// 填入表單
function populateFormFromReport() {
  if (!currentReport) return;

  document.getElementById('editor-report-no').textContent = currentReport.report_number;
  document.getElementById('edit-site-name').value = currentReport.site_name || '';
  document.getElementById('edit-capacity-kwp').value = currentReport.capacity_kwp || '';
  document.getElementById('edit-inspection-date').value = currentReport.inspection_date || '';
  document.getElementById('edit-quarter').value = currentReport.quarter || 'Q3';
  document.getElementById('edit-inspection-type').value = currentReport.inspection_type || '定期巡檢-有載';
  document.getElementById('edit-engineers').value = Array.isArray(currentReport.engineers) ? currentReport.engineers.join('、') : currentReport.engineers;
  document.getElementById('edit-contract-term').value = currentReport.contract_term || '';

  // 環境
  const env = currentReport.environmental_data || {};
  document.getElementById('edit-weather').value = env.weather || '晴';
  document.getElementById('edit-radiation').value = env.radiation || 940;
  document.getElementById('edit-ambient-temp').value = env.ambient_temp || 30.9;
  document.getElementById('edit-module-temp').value = env.module_temp || 44.1;

  // 渲染建議事項表單
  renderSuggestionsForm();
  renderChecklistsEditor();
  renderElectricalEditor();
  renderPhotosEditor();
}

function renderSuggestionsForm() {
  const container = document.getElementById('suggestions-form-container');
  if (!container) return;

  const sug = currentReport.suggestions || {};
  const systems = [
    { key: 'pv_system', label: '光電系統 PV System' },
    { key: 'monitoring_system', label: '監控系統 Monitoring System' },
    { key: 'inverter', label: '直/交流轉換器 Inverter' },
    { key: 'ac_box', label: '配電箱 AC/DC Distribution Box' },
    { key: 'high_voltage', label: '高壓系統 High-Voltage System' }
  ];

  container.innerHTML = systems.map(s => {
    const data = sug[s.key] || { status: '正常', desc: '正常', treatment: '' };
    return `
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold text-slate-800">${s.label}</span>
          <select id="sug-${s.key}-status" class="text-xs p-1 border border-slate-300 rounded bg-white">
            <option value="正常" ${data.status === '正常' ? 'selected' : ''}>正常</option>
            <option value="異常，不影響發電" ${data.status === '異常，不影響發電' ? 'selected' : ''}>異常，不影響發電</option>
            <option value="異常" ${data.status === '異常' ? 'selected' : ''}>異常</option>
          </select>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div>
            <span class="text-slate-500 block mb-0.5">本次狀況簡述：</span>
            <input type="text" id="sug-${s.key}-desc" value="${data.desc || ''}" class="w-full p-2 bg-white border border-slate-300 rounded">
          </div>
          <div>
            <span class="text-slate-500 block mb-0.5">處置及做法：</span>
            <input type="text" id="sug-${s.key}-treatment" value="${data.treatment || ''}" class="w-full p-2 bg-white border border-slate-300 rounded">
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 判定該檢查項目是否需要數據量測，並提供帶空格的標準範本
function getMeasurementTemplate(equip = '', item = '') {
  const text = (equip + ' ' + item).toLowerCase();
  
  if (text.includes('日照計錶頭') || (text.includes('日照') && text.includes('錶頭'))) {
    return { hasData: true, template: '日照值:    W/m²', hint: '需填寫日照錶頭數值 (W/m²)', example: '日照值: 940 W/m²' };
  }
  if (text.includes('模組溫度錶頭') || (text.includes('模組溫度') && text.includes('錶頭'))) {
    return { hasData: true, template: '溫度值:    ℃', hint: '需填寫模組溫度讀數 (℃)', example: '溫度值: 44.1 ℃' };
  }
  if (text.includes('大氣溫度錶頭') || (text.includes('大氣溫度') && text.includes('錶頭'))) {
    return { hasData: true, template: '溫度值:    ℃', hint: '需填寫大氣環境溫度讀數 (℃)', example: '溫度值: 30.9 ℃' };
  }
  if (text.includes('監視器數量')) {
    return { hasData: true, template: '1 組', hint: '現場實裝監視器數量', example: '1 組' };
  }
  if (text.includes('熱顯') || text.includes('熱影像')) {
    return { hasData: true, template: '最高溫:    度', hint: '紅外線熱顯像最高溫 (℃)', example: '最高溫: 48.7 度' };
  }
  if (text.includes('電壓記錄')) {
    return { hasData: true, template: '線電壓:    VAC, 相電壓:    VAC', hint: '耐高壓手套量測交流電壓', example: '線電壓: 393 VAC, 相電壓: 227 VAC' };
  }
  if (text.includes('s40') || (text.includes('斷路器') && text.includes('s40'))) {
    return { hasData: true, template: '顯示電壓值:    kV', hint: '高壓 S40 顯示電壓 (kV)', example: '顯示電壓值: 23.2 kV' };
  }
  if (text.includes('油溫') || text.includes('油位')) {
    return { hasData: true, template: '油溫:    ℃, 油位: 正常', hint: '變壓器油溫檢視孔讀數與油位', example: '油溫: 42 ℃, 油位: 正常' };
  }
  if (text.includes('市電電錶') && (text.includes('外觀') || text.includes('鉛封') || text.includes('倍率'))) {
    return { hasData: true, template: '電號: 34-1651-98, 倍率: 800', hint: '台電電號與 CT 倍率記錄', example: '電號: 34-1651-98, 倍率: 800' };
  }
  if (text.includes('市電電錶') && (text.includes('數值') || text.includes('09') || text.includes('109'))) {
    return { hasData: true, template: '09 數值:    , 109 數值:    ', hint: '台電電子電錶 09 與 109 讀數', example: '09 數值: 31.6, 109 數值: 4039.9' };
  }
  if (text.includes('避雷針阻值') || text.includes('接地系統阻值') || text.includes('阻值量測')) {
    return { hasData: true, template: '電阻值:    Ω', hint: '接地電阻計量測值 (< 10Ω)', example: '電阻值: 0.1 Ω' };
  }
  return { hasData: false, template: '', hint: '', example: '' };
}

// 判定欄位切換 (OK綠底、NG紅底、/灰底)
function updateChecklistResult(selectEl, groupKey, idx) {
  selectEl.classList.remove('select-result-ok', 'select-result-ng', 'select-result-na');
  if (selectEl.value === 'OK') {
    selectEl.classList.add('select-result-ok');
  } else if (selectEl.value === 'NG') {
    selectEl.classList.add('select-result-ng');
  } else {
    selectEl.classList.add('select-result-na');
  }
  if (currentReport?.checklists?.[groupKey]?.[idx]) {
    currentReport.checklists[groupKey][idx].result = selectEl.value;
  }
}

// 處理方式與量測值文字輸入
function updateChecklistSolution(groupKey, idx, val) {
  if (currentReport?.checklists?.[groupKey]?.[idx]) {
    currentReport.checklists[groupKey][idx].solution = val;
  }
}

// 帶入空格範本並自動聚焦
function insertTemplateSolution(groupKey, idx, templateStr) {
  const input = document.getElementById(`checklist-sol-${groupKey}-${idx}`);
  if (!input) return;
  input.value = templateStr;
  updateChecklistSolution(groupKey, idx, templateStr);
  input.focus();
  const spaceIdx = templateStr.indexOf('   ');
  if (spaceIdx !== -1) {
    input.setSelectionRange(spaceIdx, spaceIdx + 3);
  }
}

// 一鍵批量設定判定欄 (全設 OK 或 全設 /)
function setAllChecklistResults(groupKey, targetResult) {
  if (!currentReport?.checklists?.[groupKey]) return;
  currentReport.checklists[groupKey].forEach((item, idx) => {
    item.result = targetResult;
    const select = document.getElementById(`checklist-res-${groupKey}-${idx}`);
    if (select) {
      select.value = targetResult;
      select.classList.remove('select-result-ok', 'select-result-ng', 'select-result-na');
      if (targetResult === 'OK') select.classList.add('select-result-ok');
      else if (targetResult === 'NG') select.classList.add('select-result-ng');
      else select.classList.add('select-result-na');
    }
  });
}

function renderChecklistsEditor() {
  const container = document.getElementById('checklists-accordions');
  if (!container) return;

  const lists = [
    { key: 'pv_full', title: '光電系統定期保養記錄 (全檢 100%)', items: currentReport.checklists?.pv_full || [] },
    { key: 'pv_sampling', title: '光電系統定期檢查 (抽檢 C 區)', items: currentReport.checklists?.pv_sampling || [] },
    { key: 'monitoring', title: '監控系統定期保養記錄 (全檢 100%)', items: currentReport.checklists?.monitoring || [] },
    { key: 'inverter', title: '逆變器定期保養記錄 (全檢 100%)', items: currentReport.checklists?.inverter || [] },
    { key: 'distribution_box', title: '配電箱定期保養記錄 (全檢 100%)', items: currentReport.checklists?.distribution_box || [] },
    { key: 'booster_station', title: '升壓站定期保養記錄 (全檢 100%)', items: currentReport.checklists?.booster_station || [] },
    { key: 'facility', title: '案場附屬設施維護保養記錄 (全檢 100%)', items: currentReport.checklists?.facility || [] }
  ];

  container.innerHTML = lists.map(group => {
    return `
      <details class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mb-4" open>
        <summary class="px-4 py-3 font-bold text-xs text-slate-800 bg-slate-100 flex items-center justify-between cursor-pointer select-none border-b border-slate-200">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span class="font-bold text-sm text-slate-900">${group.title}</span>
            <span class="text-xs font-normal text-slate-500">(${group.items.length} 項)</span>
          </div>
          <div class="flex items-center gap-2" onclick="event.stopPropagation()">
            <button type="button" onclick="setAllChecklistResults('${group.key}', 'OK')" class="text-[11px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition shadow-xs">
              <i class="fas fa-check mr-1"></i>全設 OK
            </button>
            <button type="button" onclick="setAllChecklistResults('${group.key}', '/')" class="text-[11px] px-2.5 py-1 bg-slate-500 hover:bg-slate-600 text-white rounded font-bold transition shadow-xs">
              <i class="fas fa-slash mr-1"></i>全設 /
            </button>
          </div>
        </summary>
        <div class="p-3 overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-100 text-slate-700 border-b border-slate-200">
              <tr>
                <th class="p-2 w-1/5">設備名稱</th>
                <th class="p-2 w-1/4">工作內容 / 檢查標準</th>
                <th class="p-2 w-28 text-center">判定結果</th>
                <th class="p-2">處理方式 / 量測值</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${group.items.map((row, idx) => {
                const tplInfo = getMeasurementTemplate(row.equip, row.item);
                const resultClass = row.result === 'OK' ? 'select-result-ok' : (row.result === 'NG' ? 'select-result-ng' : 'select-result-na');
                return `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-2 font-semibold text-slate-800 align-top">${row.equip}</td>
                    <td class="p-2 align-top">
                      <div class="font-medium text-slate-900">${row.item}</div>
                      ${row.standard ? `<div class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${row.standard}</div>` : ''}
                    </td>
                    <td class="p-2 align-top text-center">
                      <select
                        id="checklist-res-${group.key}-${idx}"
                        class="text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer select-checklist-result ${resultClass} shadow-xs"
                        onchange="updateChecklistResult(this, '${group.key}', ${idx})"
                      >
                        <option value="OK" ${row.result === 'OK' ? 'selected' : ''}>OK (合格)</option>
                        <option value="NG" ${row.result === 'NG' ? 'selected' : ''}>NG (不合格)</option>
                        <option value="/" ${row.result === '/' ? 'selected' : ''}>/ (無此項)</option>
                      </select>
                    </td>
                    <td class="p-2 align-top">
                      <div class="space-y-1">
                        <input
                          type="text"
                          id="checklist-sol-${group.key}-${idx}"
                          class="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-slate-800"
                          value="${row.solution || ''}"
                          placeholder="${tplInfo.hasData ? ('範本：' + tplInfo.template) : '請輸入處理方式或量測數值 (正常無可留空)'}"
                          oninput="updateChecklistSolution('${group.key}', ${idx}, this.value)"
                        />
                        ${tplInfo.hasData ? `
                          <div class="flex items-center justify-between text-[11px] bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200">
                            <span class="flex items-center gap-1">
                              <i class="fas fa-ruler-combined text-amber-600"></i>
                              <span>需輸入數據：</span>
                              <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold text-amber-800">${tplInfo.template}</code>
                              <span class="text-amber-700 text-[10px]">(${tplInfo.hint})</span>
                            </span>
                            <button
                              type="button"
                              onclick="insertTemplateSolution('${group.key}', ${idx}, '${tplInfo.template}')"
                              class="text-[10px] px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold transition ml-2 shadow-xs shrink-0 cursor-pointer"
                            >
                              帶入空白範本
                            </button>
                          </div>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </details>
    `;
  }).join('');
}

function renderElectricalEditor() {
  const tbody = document.getElementById('electrical-table-body');
  if (!tbody) return;

  const strings = currentReport.electrical_tests_on_load?.strings || [];
  tbody.innerHTML = strings.map(row => `
    <tr class="hover:bg-slate-50">
      <td class="p-2 font-bold">${row.inv}</td>
      <td class="p-2">${row.string}</td>
      <td class="p-2">${row.rated_power}</td>
      <td class="p-2">${row.qty}</td>
      <td class="p-2">${row.radiation}</td>
      <td class="p-2 font-mono">${row.voltage}</td>
      <td class="p-2 font-mono">${row.current}</td>
      <td class="p-2 font-bold text-emerald-700">${row.ra}</td>
      <td class="p-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">${row.result}</span></td>
    </tr>
  `).join('');
}

function renderPhotosEditor() {
  const grid = document.getElementById('editor-photos-grid');
  if (!grid) return;

  const manifest = currentReport.photos_manifest || [];
  grid.innerHTML = manifest.map(p => `
    <div class="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <img src="${p.url}" class="w-full h-40 object-cover">
      <div class="p-3">
        <p class="text-xs font-bold text-slate-800">${p.title}</p>
        <span class="text-[10px] text-slate-500 block mt-1">報告第 ${p.page} 頁 / 位置 ${p.pos}</span>
      </div>
    </div>
  `).join('');
}

function switchEditorSubTab(subId) {
  document.querySelectorAll('.subtab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.classList.remove('text-blue-700', 'border-blue-700');
    btn.classList.add('text-slate-500', 'border-transparent');
  });

  const content = document.getElementById(`subtab-${subId}`);
  const btn = document.getElementById(`subtab-btn-${subId}`);
  if (content) content.classList.remove('hidden');
  if (btn) {
    btn.classList.remove('text-slate-500', 'border-transparent');
    btn.classList.add('text-blue-700', 'border-blue-700');
  }
}

// 儲存報告
async function saveCurrentReport() {
  if (!currentReport) return;

  currentReport.site_name = document.getElementById('edit-site-name').value;
  currentReport.capacity_kwp = parseFloat(document.getElementById('edit-capacity-kwp').value) || 672.75;
  currentReport.inspection_date = document.getElementById('edit-inspection-date').value;
  currentReport.quarter = document.getElementById('edit-quarter').value;
  currentReport.inspection_type = document.getElementById('edit-inspection-type').value;
  currentReport.engineers = document.getElementById('edit-engineers').value.split(/[、,\s，]+/).filter(Boolean);
  currentReport.contract_term = document.getElementById('edit-contract-term').value;

  const env = currentReport.environmental_data || {};
  env.weather = document.getElementById('edit-weather').value;
  env.radiation = parseFloat(document.getElementById('edit-radiation').value) || 940;
  env.ambient_temp = parseFloat(document.getElementById('edit-ambient-temp').value) || 30.9;
  env.module_temp = parseFloat(document.getElementById('edit-module-temp').value) || 44.1;
  currentReport.environmental_data = env;

  // 儲存建議事項
  const sysKeys = ['pv_system', 'monitoring_system', 'inverter', 'ac_box', 'high_voltage'];
  sysKeys.forEach(k => {
    const stEl = document.getElementById(`sug-${k}-status`);
    const descEl = document.getElementById(`sug-${k}-desc`);
    const treatEl = document.getElementById(`sug-${k}-treatment`);
    if (!currentReport.suggestions) currentReport.suggestions = {};
    currentReport.suggestions[k] = {
      status: stEl ? stEl.value : (currentReport.suggestions[k]?.status || '正常'),
      desc: descEl ? descEl.value : (currentReport.suggestions[k]?.desc || '正常'),
      treatment: treatEl ? treatEl.value : (currentReport.suggestions[k]?.treatment || '')
    };
  });

  // 儲存所有定檢表最新輸入值 (判定結果 + 處理方式/量測值)
  const groupKeys = ['pv_full', 'pv_sampling', 'monitoring', 'inverter', 'distribution_box', 'booster_station', 'facility'];
  groupKeys.forEach(gKey => {
    if (currentReport.checklists && currentReport.checklists[gKey]) {
      currentReport.checklists[gKey].forEach((item, idx) => {
        const resEl = document.getElementById(`checklist-res-${gKey}-${idx}`);
        const solEl = document.getElementById(`checklist-sol-${gKey}-${idx}`);
        if (resEl) item.result = resEl.value;
        if (solEl) item.solution = solEl.value;
      });
    }
  });

  await window.supabaseService.saveReport(currentReport);
  allReports = await window.supabaseService.getReports();
  renderReportsTable();
  renderOfficialReportView();
  alert('✅ 報告及各系統定檢表已儲存同步完成！');
}

// 送審核
async function submitToReview() {
  await saveCurrentReport();
  currentReport.status = 'submitted';
  await window.supabaseService.saveReport(currentReport);
  allReports = await window.supabaseService.getReports();
  renderReportsTable();
  updateReviewTab();
  alert('📤 已成功送交主管審核！');
  switchTab('review');
}

// 主管審核核准
async function approveReport() {
  const comments = document.getElementById('review-comments-input').value;
  await window.supabaseService.updateReportStatus(currentReport.id, 'approved', '維運一課課長', comments);
  currentReport = await window.supabaseService.getReportById(currentReport.id);
  allReports = await window.supabaseService.getReports();
  renderReportsTable();
  updateReviewTab();
  renderOfficialReportView();
  alert('🛡️ 審核已核准！已自動加蓋「115.09.11 維運一課專用章」，可立即派送給業主客戶！');
}

// 主管退回
async function rejectReport() {
  const comments = document.getElementById('review-comments-input').value;
  await window.supabaseService.updateReportStatus(currentReport.id, 'draft', '維運一課課長', comments);
  currentReport = await window.supabaseService.getReportById(currentReport.id);
  allReports = await window.supabaseService.getReports();
  renderReportsTable();
  updateReviewTab();
  alert('⚠️ 報告已退回為草稿，通知工程師補充量測數據。');
}

// 更新審核與派送分頁內容
function updateReviewTab() {
  if (!currentReport) return;

  const badge = document.getElementById('review-current-status-badge');
  const engineersEl = document.getElementById('review-engineers-text');
  const approverEl = document.getElementById('review-approver-text');
  const shareInput = document.getElementById('share-link-input');
  const dispatchText = document.getElementById('dispatch-message-template');

  if (badge) {
    const statusMap = {
      draft: '草稿 (Draft)',
      submitted: '待主管審核 (Pending Review)',
      approved: '已核准 (Approved)',
      dispatched: '已派送業主 (Dispatched)'
    };
    badge.textContent = statusMap[currentReport.status] || currentReport.status;
  }

  if (engineersEl) {
    engineersEl.textContent = Array.isArray(currentReport.engineers) ? currentReport.engineers.join('、') : currentReport.engineers;
  }
  if (approverEl) {
    approverEl.textContent = currentReport.reviewed_by || '維運一課課長';
  }

  // 客戶分享連結
  const origin = window.location.origin + window.location.pathname;
  const link = `${origin}#preview?id=${currentReport.id}`;
  if (shareInput) shareInput.value = link;

  // 派送通知文案
  if (dispatchText) {
    const engStr = Array.isArray(currentReport.engineers) ? currentReport.engineers.join('、') : currentReport.engineers;
    dispatchText.value = `敬啟者 您好：

進金生能源服務股份有限公司已完成【${currentReport.site_name}】${currentReport.quarter} 定期巡檢維運作業。

【巡檢摘要報告】
• 案場名稱：${currentReport.site_name} (${currentReport.capacity_kwp} kWp)
• 巡檢日期：${currentReport.inspection_date}
• 巡檢人員：${engStr}
• 直流電性量測：有載輸出比率 RA 介於 0.83 ~ 0.86，高於合約規範標準，發電效能優良。
• 待追蹤項目：MVCB盤照明Fuse失效、高壓GPT盤礙子劣化建議安排陶瓷更換。

完整的 33 頁 CF-086 巡檢報告與現場高清檢測相片，請點擊下方專屬安全連結查閱與下載 PDF：
${link}

進金生能源服務股份有限公司 維運一課 敬上
TEL: 07-3347879`;
  }
}

function copyShareLink() {
  const input = document.getElementById('share-link-input');
  input.select();
  document.execCommand('copy');
  alert('已複製客戶專屬檢視連結至剪貼簿！');
}

function copyDispatchText() {
  const input = document.getElementById('dispatch-message-template');
  input.select();
  document.execCommand('copy');
  alert('已複製派送通知文案！可直接貼上至 LINE 或 Email 發送給客戶。');
}

// 導出 JSON
function exportReportJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentReport, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `${currentReport.report_number}.json`);
  dlAnchor.click();
}

// ==============================================================================
// 1:1 像素級重現進金生 CF-086 正式紙本報告渲染 (Full 33 Pages Replication)
// ==============================================================================
// 輔助函式：渲染 1:1 官方定檢表單頁
function renderOfficialChecklistPage(pageNum, titleZh, titleEn, checkingRate, rows = [], formVersion = 'CF-086 版次 11', logoUrl = 'assets/acme_logo.jpeg') {
  return `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${logoUrl}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">${pageNum} / ${formVersion}</span>
      </div>

      <div class="text-center font-bold text-xs mb-3">
        ${titleZh} 檢驗比例:${checkingRate}<br>
        <span class="font-normal">${titleEn} Checking % : ${checkingRate}</span>
      </div>

      <table class="cf086-table text-xs">
        <thead>
          <tr>
            <th class="w-1/6">設備名稱<br>Equipment</th>
            <th class="w-1/4">工作內容<br>Items</th>
            <th class="w-5/12">檢查標準<br>Inspection Standard</th>
            <th class="w-16">判定結果<br>Result</th>
            <th>處理方式 / 量測值<br>Solution</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td class="font-semibold">${row.equip}</td>
              <td>${row.item}</td>
              <td class="text-[11px] text-slate-700 leading-snug">${row.standard || ''}</td>
              <td class="text-center font-bold ${row.result === 'OK' ? 'text-emerald-700' : (row.result === 'NG' ? 'text-rose-700 font-extrabold' : 'text-slate-500')}">${row.result}</td>
              <td class="font-mono text-[11px] ${row.solution ? 'text-blue-900 font-semibold' : 'text-slate-400'}">${row.solution || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="text-[11px] text-slate-700 mt-2 flex justify-between">
        <span>判定結果 Result： 合格 Pass : OK</span>
        <span>不合格 Fail : NG</span>
        <span>無此項目 N/A : /</span>
      </div>

      <div class="cf086-footer-info">
        <span>${pageNum}</span>
        <span>${formVersion}</span>
      </div>
    </div>
  `;
}

function renderOfficialReportView() {
  const container = document.getElementById('cf086-report-render-target');
  if (!container || !currentReport) return;

  const rep = currentReport;
  const engStr = Array.isArray(rep.engineers) ? rep.engineers.join('<br>') : rep.engineers;

  let html = '';

  // ---------------------------------------------------------
  // PAGE 1: 封面 Cover
  // ---------------------------------------------------------
  html += `
    <div class="cf086-page flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between border-b-2 border-blue-900 pb-2 mb-8">
          <div class="flex items-center gap-3">
            <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-10 object-contain">
            <span class="text-xs font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
          </div>
          <div class="text-right text-xs font-mono font-bold text-slate-700">
            1 <span class="ml-4">${rep.form_version}</span>
          </div>
        </div>

        <div class="text-center mt-12 space-y-4">
          <h2 class="text-3xl font-black text-slate-900 tracking-wider">太陽能光電系統</h2>
          <p class="text-base text-slate-600 font-serif">Solar photovoltaic system</p>
        </div>

        <div class="text-center mt-14 space-y-2">
          <h3 class="text-2xl font-black text-slate-900 underline decoration-2 underline-offset-8">
            ${rep.site_name}
          </h3>
          <p class="text-lg font-bold text-slate-800 pt-4">${rep.capacity_kwp}kWp 專案</p>
          <p class="text-sm text-slate-600">${rep.capacity_kwp}kWp Project</p>
        </div>

        <div class="text-center mt-16 space-y-3">
          <h4 class="text-xl font-bold text-slate-900">
            巡檢報告 <span class="text-slate-600 font-normal">Regular Inspection Report</span>
          </h4>
          <p class="text-2xl font-black text-slate-900 tracking-widest">
            ${rep.inspection_date ? rep.inspection_date.replace(/-/g, ' 年 ').replace(/ 年 (\d+) 年 /, ' 年 $1 月 ') + ' 日' : '2026 年 9 月 07 日'}
          </p>
        </div>

        <div class="text-center mt-12 space-y-1">
          <p class="text-base font-bold text-slate-800">合約期間 Contract Term</p>
          <p class="text-sm font-semibold underline decoration-slate-400 underline-offset-4">起迄日期 ${rep.contract_term || '114/7/1 ~ 119/6/30'}</p>
        </div>
      </div>

      <!-- 封面底部簽章表格 -->
      <div class="mt-16">
        <table class="w-full border-2 border-black text-xs text-center">
          <tr>
            <td class="w-1/4 p-4 font-bold border-r-2 border-black bg-slate-50">
              巡檢人員<br>Personnel
            </td>
            <td class="w-1/4 p-4 font-bold border-r-2 border-black leading-relaxed">
              ${engStr}
            </td>
            <td class="w-1/4 p-4 font-bold border-r-2 border-black">
              進金生<br>ACME
            </td>
            <td class="w-1/4 p-4 flex flex-col items-center justify-center">
              <img src="${rep.stamp_url || 'assets/acme_stamp.png'}" class="h-28 object-contain">
              <span class="text-blue-900 font-bold text-xs mt-1">TEL: 07-3347879</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="cf086-footer-info">
        <span>1</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 2 & 3: 合約檢查週期 31 項對照表
  // ---------------------------------------------------------
  const p1_items = (rep.contract_periods || []).slice(0, 25);
  const p2_items = (rep.contract_periods || []).slice(25);

  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">2 / ${rep.form_version}</span>
      </div>

      <h3 class="text-center font-bold text-sm mb-3">合約檢查週期 Checking period in Contract</h3>

      <table class="cf086-table text-xs">
        <thead>
          <tr>
            <th rowspan="2" class="w-1/2">檢查項目 Checking Items</th>
            <th colspan="4" class="w-1/3">週期 checking period</th>
            <th rowspan="2" class="w-1/6">備註 Remark</th>
          </tr>
          <tr>
            <th>不定期<br>random</th>
            <th>每季<br>Quarter</th>
            <th>每半年<br>half year</th>
            <th>年檢<br>annual</th>
          </tr>
        </thead>
        <tbody>
          ${p1_items.map(row => `
            <tr>
              <td>${row.no} ${row.item}</td>
              <td class="text-center font-bold">${row.period === '不定期' ? row.mark : ''}</td>
              <td class="text-center font-bold">${row.period === '每季' ? row.mark : ''}</td>
              <td class="text-center font-bold">${row.period === '每半年' ? row.mark : ''}</td>
              <td class="text-center font-bold">${row.period === '年檢' ? row.mark : ''}</td>
              <td class="text-xs">${row.remark || (row.period === '無此項目' ? '/' : '')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="text-[11px] text-slate-700 mt-2 flex justify-between">
        <span>符號定義 Mark： 需要 Required : V</span>
        <span>不需要 Not Required : X</span>
        <span>無此項目 N/A : /</span>
      </div>

      <div class="cf086-footer-info">
        <span>2</span>
        <span>${rep.form_version}</span>
      </div>
    </div>

    <!-- Page 3 -->
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">3 / ${rep.form_version}</span>
      </div>

      <table class="cf086-table text-xs">
        <thead>
          <tr>
            <th rowspan="2" class="w-1/2">檢查項目 Checking Items</th>
            <th colspan="4" class="w-1/3">週期 checking period</th>
            <th rowspan="2" class="w-1/6">備註 Remark</th>
          </tr>
          <tr>
            <th>不定期<br>random</th>
            <th>每季<br>Quarter</th>
            <th>每半年<br>half year</th>
            <th>年檢<br>annual</th>
          </tr>
        </thead>
        <tbody>
          ${p2_items.map(row => `
            <tr>
              <td>${row.no} ${row.item}</td>
              <td class="text-center font-bold">${row.period === '不定期' ? row.mark : (row.mark === '/' ? '/' : '')}</td>
              <td class="text-center font-bold">${row.period === '每季' ? row.mark : ''}</td>
              <td class="text-center font-bold">${row.period === '每半年' ? row.mark : ''}</td>
              <td class="text-center font-bold">${row.period === '年檢' ? row.mark : ''}</td>
              <td class="text-xs">${row.remark || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="text-[11px] text-slate-700 mt-2 flex justify-between">
        <span>符號定義 Mark： 需要 Required : V</span>
        <span>不需要 Not Required : X</span>
        <span>無此項目 N/A : /</span>
      </div>

      <div class="cf086-footer-info">
        <span>3</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 4: 年度維運履歷(日曆年)
  // ---------------------------------------------------------
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">4 / ${rep.form_version}</span>
      </div>

      <h3 class="text-center font-bold text-sm mb-4">年度維運履歷(日曆年) History record of checking schedule(Year)</h3>

      <table class="cf086-table text-xs text-center">
        <thead>
          <tr>
            <th rowspan="2" class="w-2/5">工作項目</th>
            <th rowspan="2" class="w-16">週期</th>
            <th rowspan="2" class="w-14">累積次數</th>
            <th colspan="12">月份</th>
          </tr>
          <tr>
            ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => `<th class="w-6">${m}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${(rep.annual_schedule || []).map(row => `
            <tr>
              <td class="text-left font-medium">${row.no} ${row.item}</td>
              <td>${row.cycle}</td>
              <td class="font-bold">${row.count}</td>
              ${[1,2,3,4,5,6,7,8,9,10,11,12].map(m => `
                <td class="font-bold text-blue-900">${row.months.includes(m) ? 'V' : ''}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="cf086-footer-info">
        <span>4</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 5: 改善、修復性維運照片
  // ---------------------------------------------------------
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">5 / ${rep.form_version}</span>
      </div>

      <h3 class="text-center font-bold text-sm mb-4">改善、修復性維運照片 O&M Pictures</h3>

      <div class="border-2 border-black grid grid-cols-2 divide-x-2 divide-black text-center text-xs">
        <div class="p-8 flex flex-col justify-between h-72">
          <div class="flex items-center justify-center h-full text-slate-500 font-bold">
            本案客戶無清洗需求
          </div>
          <p class="font-bold border-t border-black pt-2">模組清洗前 Before cleaning</p>
        </div>
        <div class="p-8 flex flex-col justify-between h-72">
          <div class="flex items-center justify-center h-full text-slate-500 font-bold">
            本案客戶無清洗需求
          </div>
          <p class="font-bold border-t border-black pt-2">模組清洗後 After cleaning</p>
        </div>
        <div class="p-8 flex flex-col justify-between h-72 border-t-2 border-black">
          <div class="flex items-center justify-center h-full text-slate-400">
            (無改善前缺失)
          </div>
          <p class="font-bold border-t border-black pt-2">改善前 Before improvement</p>
        </div>
        <div class="p-8 flex flex-col justify-between h-72 border-t-2 border-black">
          <div class="flex items-center justify-center h-full text-slate-400">
            (改善中)
          </div>
          <p class="font-bold border-t border-black pt-2">改善中 After improvement</p>
        </div>
      </div>

      <div class="cf086-footer-info">
        <span>5</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 6: 本次巡檢建議/待改善事項 (Chapter 4)
  // ---------------------------------------------------------
  const sug = rep.suggestions || {};
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">6 / ${rep.form_version}</span>
      </div>

      <h3 class="text-center font-bold text-sm mb-4">
        本次巡檢建議/待改善事項<br>
        <span class="font-normal text-xs text-slate-600">Suggestions / To Be Improved</span>
      </h3>

      <table class="cf086-table text-xs">
        <thead>
          <tr>
            <th class="w-1/4">項目<br>Items</th>
            <th class="w-1/3">本次檢查狀況簡述<br>Brief description of inspection</th>
            <th class="w-5/12">處置及做法<br>Treatment</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold">光電系統<br>PV system</td>
            <td>${sug.pv_system?.desc || '正常'}</td>
            <td>${sug.pv_system?.treatment || ''}</td>
          </tr>
          <tr>
            <td class="font-bold">監控系統<br>Monitoring system</td>
            <td>${sug.monitoring_system?.desc || '正常'}</td>
            <td>${sug.monitoring_system?.treatment || ''}</td>
          </tr>
          <tr>
            <td class="font-bold">直/交流轉換器<br>Inverter</td>
            <td>${sug.inverter?.desc || '正常'}</td>
            <td>${sug.inverter?.treatment || ''}</td>
          </tr>
          <tr>
            <td class="font-bold">配電箱<br>AC Distribution Panel</td>
            <td class="text-amber-800 font-semibold">${sug.ac_box?.desc || '異常，不影響發電。'}</td>
            <td>${sug.ac_box?.treatment || '一、MVCB 盤照明 Fuse 失效。'}</td>
          </tr>
          <tr>
            <td class="font-bold">高壓系統<br>High-Voltage system</td>
            <td class="text-rose-800 font-semibold">${sug.high_voltage?.desc || '異常'}</td>
            <td class="leading-relaxed">${sug.high_voltage?.treatment || ''}</td>
          </tr>
        </tbody>
      </table>

      <div class="cf086-footer-info">
        <span>6</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 7: 其他建議事項 (Other Suggestions + Photo)
  // ---------------------------------------------------------
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">7 / ${rep.form_version}</span>
      </div>

      <div class="border-2 border-black p-4 min-h-[850px]">
        <h4 class="font-bold text-xs border-b border-black pb-2 mb-3">其他建議事項 Other Suggestions</h4>
        <p class="text-xs font-semibold text-slate-800 mb-4">${sug.other?.desc || '一、MVCB 盤照明故障，不影響發電。'}</p>
        <div class="flex justify-start">
          <img src="${sug.other?.photo_url || 'assets/mvcb_light_issue.jpeg'}" class="max-w-md rounded border border-slate-300 shadow-sm">
        </div>
      </div>

      <div class="cf086-footer-info">
        <span>7</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 8: 光電系統定期維護保養檢查記錄表 (全檢 100%)
  // ---------------------------------------------------------
  html += renderOfficialChecklistPage(8, '光電系統定期維護保養檢查記錄表', 'PV System Regular Maintenance Inspection Checklist', '全檢 100%', rep.checklists.pv_full || [], rep.form_version, rep.logo_url);

  // ---------------------------------------------------------
  // PAGE 9: 光電系統定期維護保養檢查記錄表 (抽檢 C 區)
  // ---------------------------------------------------------
  html += renderOfficialChecklistPage(9, '光電系統定期維護保養檢查記錄表', 'PV System Regular Maintenance Inspection Checklist', '抽檢 (C 區)', rep.checklists.pv_sampling || [], rep.form_version, rep.logo_url);

  // ---------------------------------------------------------
  // PAGE 11: 螺絲鎖固判定標準 & 抽檢區域 CAD 圖
  // ---------------------------------------------------------
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">11 / ${rep.form_version}</span>
      </div>

      <div class="space-y-3 text-xs mb-4">
        <p class="font-bold text-slate-900">
          1. 鬆脫百分比(%) < 2% : 螺絲鎖固狀況良好(OK)<br>
          <span class="font-normal text-slate-600">Looseness % < 2%: The condition of screw locking is good.</span>
        </p>
        <p class="font-bold text-slate-900">
          2. 鬆脫百分比(%) 2~10% : 全場螺絲全檢<br>
          <span class="font-normal text-slate-600">Looseness % 2~10%: Full inspection for all screws at site.</span>
        </p>
        <p class="font-bold text-slate-900">
          3. 鬆脫百分比(%) > 10% : 全場螺絲全數重新鎖固<br>
          <span class="font-normal text-slate-600">Looseness % > 10%: Re-lock for all screws at site.</span>
        </p>
      </div>

      <div class="text-center my-4">
        <h4 class="text-base font-black text-slate-900">抽檢區域圖</h4>
        <p class="text-xs font-bold text-slate-600">Drawing of Random Inspection</p>
      </div>

      <div class="flex justify-center p-2 border border-slate-300 rounded bg-white">
        <img src="${rep.sampling_info?.drawing_url || 'assets/drawing_area_c.png'}" class="max-h-[680px] object-contain">
      </div>

      <div class="cf086-footer-info">
        <span>11</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 12: 監控系統定期維護保養記錄表 (全檢 100%)
  // ---------------------------------------------------------
  html += renderOfficialChecklistPage(12, '監控系統定期維護保養記錄表', 'Monitoring System Regular Maintenance Inspection Checklist', '全檢 100%', rep.checklists.monitoring || [], rep.form_version, rep.logo_url);

  // ---------------------------------------------------------
  // PAGE 13: 逆變器定期維護保養記錄表 (全檢 100%)
  // ---------------------------------------------------------
  html += renderOfficialChecklistPage(13, '逆變器定期維護保養記錄表', 'Inverter Regular Maintenance Inspection Checklist', '全檢 100%', rep.checklists.inverter || [], rep.form_version, rep.logo_url);

  // ---------------------------------------------------------
  // PAGE 14: 配電箱定期維護保養記錄表 (全檢 100%)
  // ---------------------------------------------------------
  html += renderOfficialChecklistPage(14, '配電箱定期維護保養記錄表', 'Distribution Box Regular Maintenance Inspection Checklist', '全檢 100%', rep.checklists.distribution_box || [], rep.form_version, rep.logo_url);

  // ---------------------------------------------------------
  // PAGE 15: 升壓站定期維護保養記錄表 (全檢 100%)
  // ---------------------------------------------------------
  html += renderOfficialChecklistPage(15, '升壓站定期維護保養記錄表', 'Booster Station Regular Maintenance Inspection Checklist', '全檢 100%', rep.checklists.booster_station || [], rep.form_version, rep.logo_url);

  // ---------------------------------------------------------
  // PAGE 16: 案場附屬設施維護保養記錄表 (全檢 100%)
  // ---------------------------------------------------------
  html += renderOfficialChecklistPage(16, '案場附屬設施維護保養記錄表', 'Facility Regular Maintenance Inspection Checklist', '全檢 100%', rep.checklists.facility || [], rep.form_version, rep.logo_url);

  // ---------------------------------------------------------
  // PAGE 22: 有載直流電性測試標準說明頁
  // ---------------------------------------------------------
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">22 / ${rep.form_version}</span>
      </div>

      <div class="border-2 border-black p-4 text-xs space-y-3">
        <h3 class="text-center font-bold text-sm">直流電性測試記錄表 DC Electrical Property Test Record</h3>
        <div class="grid grid-cols-3 border-y border-black py-2">
          <div>檢測區間: 10:00~12:00</div>
          <div>案場併聯日: 2019/10/21</div>
          <div>案場迄今年數: 6</div>
        </div>
        <div>測試氣候: ■ 晴 □ 多雲時晴 □ 多雲時晴短暫雨 □ 多雲</div>
        <div>試驗目的: 檢查模組串列電性是否異常</div>
        <div>使用儀器: 數位多功能電錶, 勾錶、日照 > 600 W/m²</div>
        <div class="border-t border-black pt-2">
          <p class="font-bold">RA 值 = (組列輸出功率 Pa × 1000W/m²) / (組列額定功率 P × 現場日照強度 Gi)</p>
          <p>1. 絕對值符合標準：1~5 年 RA ≧ 80%, 6~13 年 RA ≧ 75%, 14~20 年 RA ≧ 70%</p>
          <p>2. 相對值符合標準：該單串列 RA 值 / 該 INV 串列 RA 平均值 ≧ 70%</p>
        </div>
      </div>

      <div class="text-center font-bold text-sm my-6 text-emerald-700">
        判定結果 Result : 合格 Pass : OK (第 2~4 季有載檢測)
      </div>

      <div class="cf086-footer-info">
        <span>22</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 23: 有載直流電性數據 INV 1 ~ INV 7
  // ---------------------------------------------------------
  const p23_rows = (rep.electrical_tests_on_load?.strings || []).slice(0, 14);
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">23 / ${rep.form_version}</span>
      </div>

      <table class="cf086-table text-xs text-center">
        <thead>
          <tr>
            <th>箱號 (INV)</th>
            <th>串列編號</th>
            <th>單片功率</th>
            <th>片數</th>
            <th>輸出功率</th>
            <th>日照</th>
            <th>有載電壓</th>
            <th>有載電流</th>
            <th>RA 值</th>
            <th>結果</th>
          </tr>
        </thead>
        <tbody>
          ${p23_rows.map(r => `
            <tr>
              <td class="font-bold">${r.inv}</td>
              <td>${r.string}</td>
              <td>${r.rated_power}</td>
              <td>${r.qty}</td>
              <td class="font-mono">${r.output_power}</td>
              <td>${r.radiation}</td>
              <td class="font-mono">${r.voltage}</td>
              <td class="font-mono">${r.current}</td>
              <td class="font-bold text-emerald-800">${r.ra}</td>
              <td class="font-bold">${r.result}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="cf086-footer-info">
        <span>23</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 32: 巡檢照片 (第 1 頁，6 張照片)
  // ---------------------------------------------------------
  const p32_photos = (rep.photos_manifest || []).filter(p => p.page === 32).slice(0, 6);
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">32 / ${rep.form_version}</span>
      </div>

      <h3 class="text-center font-bold text-sm mb-4">巡檢照片 Regular Inspection Photos</h3>

      <div class="grid grid-cols-2 gap-4">
        ${p32_photos.map(p => `
          <div class="border-2 border-black p-1 text-center">
            <img src="${p.url}" class="w-full h-56 object-cover">
            <p class="font-bold text-xs mt-2 border-t border-black pt-1">${p.title}</p>
          </div>
        `).join('')}
      </div>

      <div class="cf086-footer-info">
        <span>32</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  // ---------------------------------------------------------
  // PAGE 33: 巡檢照片 (第 2 頁，6 張照片含熱顯像)
  // ---------------------------------------------------------
  const p33_photos = (rep.photos_manifest || []).filter(p => p.page === 33).slice(0, 6);
  html += `
    <div class="cf086-page">
      <div class="cf086-header-logo">
        <div class="flex items-center gap-2">
          <img src="${rep.logo_url || 'assets/acme_logo.jpeg'}" class="h-6">
          <span class="text-[11px] font-bold text-orange-600">進金生能源服務股份有限公司 ACMEPOINT ENERGY SERVICES CO., LTD.</span>
        </div>
        <span class="text-xs font-mono">33 / ${rep.form_version}</span>
      </div>

      <h3 class="text-center font-bold text-sm mb-4">巡檢照片 Regular Inspection Photos</h3>

      <div class="grid grid-cols-2 gap-4">
        ${p33_photos.map(p => `
          <div class="border-2 border-black p-1 text-center">
            <img src="${p.url}" class="w-full h-56 object-cover">
            <p class="font-bold text-xs mt-2 border-t border-black pt-1">${p.title}</p>
          </div>
        `).join('')}
      </div>

      <div class="cf086-footer-info">
        <span>33</span>
        <span>${rep.form_version}</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// 載入 SQL 預覽
async function loadSqlSchemaPreview() {
  const sqlArea = document.getElementById('schema-sql-display');
  if (!sqlArea) return;
  try {
    const res = await fetch('supabase-schema.sql');
    if (res.ok) {
      sqlArea.value = await res.text();
    }
  } catch (e) {
    sqlArea.value = '-- 請直接開啟專案目錄下的 supabase-schema.sql 檢視完整 DDL';
  }
}

function copySqlScript() {
  const sqlArea = document.getElementById('schema-sql-display');
  sqlArea.select();
  document.execCommand('copy');
  alert('已複製完整 Supabase PostgreSQL DDL 腳本！請前往 Supabase Console 的 SQL Editor 執行。');
}

// Supabase 設定 Modal
function openConfigModal() {
  switchTab('settings');
}

async function testAndSaveSupabaseConfig() {
  const url = document.getElementById('sb-settings-url').value.trim();
  const key = document.getElementById('sb-settings-key').value.trim();

  if (!url || !key) {
    alert('請填寫 Supabase Project URL 與 Anon Public Key');
    return;
  }

  try {
    await window.supabaseService.testConnection(url, key);
    SupabaseConfig.saveConfig(url, key);
    window.supabaseService.initClient();
    updateSupabaseStatusPill();
    alert('🎉 Supabase 連線成功！已儲存連線憑證。');
  } catch (err) {
    alert('連線失敗: ' + err.message);
  }
}

function clearSupabaseConfig() {
  if (confirm('確定要清除 Supabase 設定並切回本地展示模式？')) {
    SupabaseConfig.clearConfig();
    window.supabaseService.initClient();
    updateSupabaseStatusPill();
  }
}

// 重新載入示範報告
function resetToSampleReport() {
  currentReport = JSON.parse(JSON.stringify(window.SEED_REPORT));
  window.supabaseService.saveReportLocal(currentReport);
  populateFormFromReport();
  renderOfficialReportView();
  updateReviewTab();
  alert('已重新重置為「東和家樂福一、二期 2026/09/07 Q3」標準巡檢報告！');
}
