/**
 * 進金生能源 6692 ｜ 太陽光電巡檢報告平台
 * Supabase BaaS 雲端串接與本地離線雙向同步引擎
 */

// 預設進金生官方團隊 Supabase BaaS 連線配置 (開箱即用，全員免設定)
const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://cowljafosekwvxithwjd.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvd2xqYWZvc2Vrd3Z4aXRod2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NTYzODcsImV4cCI6MjA5NDIzMjM4N30.c8YXP7EXDeTOw-mJEmnYZ_DJeZv6Qt6HVDzEf8J2K_I'
};

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const SupabaseConfig = {
  getUrl() {
    // 支援網址參數自定義帶入: #sb_url=... 或 ?sb_url=...
    try {
      const hashStr = window.location.hash.includes('sb_url') ? window.location.hash.substring(1) : '';
      const searchStr = window.location.search.includes('sb_url') ? window.location.search.substring(1) : '';
      const params = new URLSearchParams(hashStr || searchStr);
      if (params.get('sb_url')) {
        const u = params.get('sb_url').trim();
        localStorage.setItem('SB_INSPECTION_URL', u);
        return u;
      }
    } catch (e) {}

    return localStorage.getItem('SB_INSPECTION_URL') || window.ENV_SUPABASE_URL || DEFAULT_SUPABASE_CONFIG.url;
  },

  getKey() {
    try {
      const hashStr = window.location.hash.includes('sb_key') ? window.location.hash.substring(1) : '';
      const searchStr = window.location.search.includes('sb_key') ? window.location.search.substring(1) : '';
      const params = new URLSearchParams(hashStr || searchStr);
      if (params.get('sb_key')) {
        const k = params.get('sb_key').trim();
        localStorage.setItem('SB_INSPECTION_ANON_KEY', k);
        return k;
      }
    } catch (e) {}

    return localStorage.getItem('SB_INSPECTION_ANON_KEY') || window.ENV_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_CONFIG.anonKey;
  },

  saveConfig(url, key) {
    if (url) localStorage.setItem('SB_INSPECTION_URL', url.trim());
    if (key) localStorage.setItem('SB_INSPECTION_ANON_KEY', key.trim());
  },

  clearConfig() {
    localStorage.removeItem('SB_INSPECTION_URL');
    localStorage.removeItem('SB_INSPECTION_ANON_KEY');
  },

  isConfigured() {
    return Boolean(this.getUrl() && this.getKey());
  }
};

class SupabaseService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initClient();
  }

  initClient() {
    const url = SupabaseConfig.getUrl();
    const key = SupabaseConfig.getKey();
    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isConnected = true;
        console.log('🟢 Supabase Client 已成功初始化 (專案: ' + url + ')');
      } catch (err) {
        console.warn('⚠️ Supabase 初始化失敗:', err);
        this.isConnected = false;
      }
    } else {
      this.isConnected = false;
      console.log('ℹ️ 處於本地展示/離線模式');
    }
  }

  // 測試連線
  async testConnection(url, key) {
    if (!window.supabase) throw new Error('Supabase SDK 未載入');
    const testClient = window.supabase.createClient(url, key);
    const { data, error } = await testClient.from('inspection_reports').select('id, site_name').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return true;
  }

  // 標準化遠端資料與本地範本相容
  normalizeReport(rep) {
    if (!rep) return rep;
    if (rep.checklists) {
      if (rep.checklists.contract_periods && !rep.contract_periods) {
        rep.contract_periods = rep.checklists.contract_periods;
      }
      if (rep.checklists.annual_schedule && !rep.annual_schedule) {
        rep.annual_schedule = rep.checklists.annual_schedule;
      }
    }
    if (rep.electrical_tests && (!rep.electrical_tests_on_load || !rep.electrical_tests_on_load.strings)) {
      rep.electrical_tests_on_load = rep.electrical_tests;
    }
    if (!rep.stamp_url) rep.stamp_url = 'assets/acme_stamp.png';
    if (!rep.logo_url) rep.logo_url = 'assets/acme_logo.jpeg';
    return rep;
  }

  // 1. 取得巡檢報告清單
  async getReports() {
    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client
          .from('inspection_reports')
          .select('*')
          .order('inspection_date', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          return data.map(r => this.normalizeReport(r));
        }
      } catch (err) {
        console.warn('雲端查詢失敗，降級使用本地快取:', err);
      }
    }

    // 降級使用本地存儲或預設種子報告
    const local = localStorage.getItem('ACME_LOCAL_REPORTS');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed.map(r => this.normalizeReport(r));
      } catch (e) {}
    }

    return [this.normalizeReport(window.SEED_REPORT)];
  }

  // 2. 取得單一報告詳情
  async getReportById(id) {
    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client
          .from('inspection_reports')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data) return this.normalizeReport(data);
      } catch (err) {
        console.warn('從雲端讀取報告失敗:', err);
      }
    }

    const reports = await this.getReports();
    return reports.find(r => r.id === id) || this.normalizeReport(window.SEED_REPORT);
  }

  // 3. 儲存或更新巡檢報告
  async saveReport(reportData) {
    reportData.updated_at = new Date().toISOString();

    // 確保有合法 UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!reportData.id || !uuidRegex.test(reportData.id)) {
      reportData.id = generateUUID();
    }

    // 準備 Supabase 欄位資料庫載荷
    const dbPayload = {
      id: reportData.id,
      report_number: reportData.report_number || ('CF086-' + Date.now()),
      form_version: reportData.form_version || 'CF-086 版次 11',
      site_name: reportData.site_name || '未命名案場',
      capacity_kwp: Number(reportData.capacity_kwp) || 0,
      contract_term: reportData.contract_term || '',
      inspection_date: reportData.inspection_date || new Date().toISOString().split('T')[0],
      quarter: reportData.quarter || 'Q3',
      inspection_type: reportData.inspection_type || '定期巡檢-有載',
      engineers: Array.isArray(reportData.engineers) ? reportData.engineers : [reportData.engineers].filter(Boolean),
      department: reportData.department || '維運一課',
      phone: reportData.phone || '07-3347879',
      status: reportData.status || 'draft',
      reviewed_by: reportData.reviewed_by || null,
      reviewed_at: reportData.reviewed_at || null,
      review_comments: reportData.review_comments || null,
      stamp_code: reportData.stamp_code || '115.09.11 維運一課專用章',
      environmental_data: reportData.environmental_data || {},
      sampling_info: reportData.sampling_info || {},
      suggestions: reportData.suggestions || {},
      checklists: {
        contract_periods: reportData.contract_periods || [],
        annual_schedule: reportData.annual_schedule || [],
        ...(reportData.checklists || {})
      },
      electrical_tests: reportData.electrical_tests_on_load || reportData.electrical_tests || {},
      photos_manifest: reportData.photos_manifest || [],
      raw_natural_language: reportData.raw_natural_language || null,
      pdf_url: reportData.pdf_url || null,
      updated_at: reportData.updated_at
    };

    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client
          .from('inspection_reports')
          .upsert([dbPayload], { onConflict: 'report_number' })
          .select()
          .single();
        if (error) throw error;
        console.log('✅ 報告已成功即時同步至 Supabase 雲端資料庫:', data.id);
        
        const normalized = this.normalizeReport(data);
        this.saveReportLocal(normalized);
        return normalized;
      } catch (err) {
        console.error('雲端儲存失敗，轉為本地安全保存:', err);
      }
    }

    // 本地保存
    this.saveReportLocal(reportData);
    return reportData;
  }

  // 本地快取保存
  saveReportLocal(reportData) {
    try {
      const local = localStorage.getItem('ACME_LOCAL_REPORTS');
      let reports = local ? JSON.parse(local) : [window.SEED_REPORT];
      const idx = reports.findIndex(r => r.id === reportData.id || r.report_number === reportData.report_number);
      if (idx >= 0) {
        reports[idx] = reportData;
      } else {
        reports.unshift(reportData);
      }
      localStorage.setItem('ACME_LOCAL_REPORTS', JSON.stringify(reports));
    } catch (e) {
      console.warn('Local save failed:', e);
    }
  }

  // 4. 上傳相片直傳 Supabase Storage Bucket
  async uploadPhoto(file, category = 'module') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${category}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client.storage
          .from('inspection-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        if (error) throw error;

        // 取得公開下載 URL
        const { data: publicUrlData } = this.client.storage
          .from('inspection-photos')
          .getPublicUrl(fileName);

        return {
          url: publicUrlData.publicUrl,
          path: fileName,
          storage: 'supabase'
        };
      } catch (err) {
        console.warn('Storage 雲端上傳失敗，轉為 Base64 本地儲存:', err);
      }
    }

    // 本地 Base64 轉換
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          path: 'local/' + file.name,
          storage: 'local'
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // 5. 更新報告狀態 (工程師送審、主管核准、客戶派送)
  async updateReportStatus(reportId, newStatus, reviewerName = '', notes = '') {
    const report = await this.getReportById(reportId);
    if (!report) return null;

    report.status = newStatus;
    if (newStatus === 'approved') {
      report.reviewed_by = reviewerName || '維運一課課長';
      report.reviewed_at = new Date().toISOString();
      report.stamp_text = `${new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')} 維運一課專用章`;
    }
    if (notes) {
      report.review_comments = notes;
    }

    return await this.saveReport(report);
  }
}

// 掛載至全域單例
window.DEFAULT_SUPABASE_CONFIG = DEFAULT_SUPABASE_CONFIG;
window.supabaseService = new SupabaseService();
