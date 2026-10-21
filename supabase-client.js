/**
 * 進金生能源 6692 ｜ 太陽光電巡檢報告平台
 * Supabase BaaS 雲端串接與本地離線雙向同步引擎
 */

const SupabaseConfig = {
  // 預設從 localStorage 讀取使用者設定之 URL 與 Anon Key
  getUrl() {
    return window.ENV_SUPABASE_URL || localStorage.getItem('SB_INSPECTION_URL') || '';
  },
  getKey() {
    return window.ENV_SUPABASE_ANON_KEY || localStorage.getItem('SB_INSPECTION_ANON_KEY') || '';
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
        console.log('🟢 Supabase Client 已成功初始化');
      } catch (err) {
        console.warn('⚠️ Supabase 初始化失敗:', err);
        this.isConnected = false;
      }
    } else {
      this.isConnected = false;
      console.log('ℹ️ 處於本地展示/離線模式 (未設定 Supabase 連線憑證)');
    }
  }

  // 測試連線
  async testConnection(url, key) {
    if (!window.supabase) throw new Error('Supabase SDK 未載入');
    const testClient = window.supabase.createClient(url, key);
    const { data, error } = await testClient.from('sites').select('id, name').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return true;
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
          return data;
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
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }

    // 預設提供東和家樂福 Q3 種子報告
    return [window.SEED_REPORT];
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
        return data;
      } catch (err) {
        console.warn('從雲端讀取報告失敗:', err);
      }
    }

    const reports = await this.getReports();
    return reports.find(r => r.id === id) || window.SEED_REPORT;
  }

  // 3. 儲存或更新巡檢報告
  async saveReport(reportData) {
    reportData.updated_at = new Date().toISOString();

    // 確保有唯一 ID
    if (!reportData.id) {
      reportData.id = 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    }

    if (this.isConnected && this.client) {
      try {
        const { data, error } = await this.client
          .from('inspection_reports')
          .upsert([reportData], { onConflict: 'report_number' })
          .select()
          .single();
        if (error) throw error;
        console.log('✅ 報告已成功同步至 Supabase 雲端資料庫:', data.id);
        
        // 亦同步快取本地
        this.saveReportLocal(data);
        return data;
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
      report.reviewed_by = reviewerName || '維運課長';
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
window.supabaseService = new SupabaseService();
