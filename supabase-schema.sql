-- ==============================================================================
-- 進金生能源 6692 ｜ 太陽光電巡檢報告智能自動化平台 (CF-086 標準規範)
-- Supabase PostgreSQL 完整資料表結構、RLS 安全政策與 Storage 儲存桶設定腳本
-- ==============================================================================

-- 1. 啟用 UUID 擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. 案場基礎主檔 (sites)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_code VARCHAR(50) UNIQUE NOT NULL,            -- 案場代碼，例如 "DHEF-01"
    name VARCHAR(200) NOT NULL,                       -- 案場名稱，例如 "東和家樂福一、二期"
    capacity_kwp NUMERIC(10, 2) NOT NULL,             -- 裝置容量 (kWp)，例如 672.75
    contract_term VARCHAR(100),                       -- 合約期間，例如 "114/7/1 ~ 119/6/30"
    address TEXT,                                     -- 案場地址
    owner_name VARCHAR(100),                          -- 業主名稱
    contact_phone VARCHAR(50),                        -- 案場聯絡電話
    grid_connection_date DATE,                        -- 併聯日期
    inverter_model VARCHAR(100),                      -- 逆變器型號
    module_model VARCHAR(100),                        -- 模組型號
    module_rated_power NUMERIC(6, 2) DEFAULT 325,     -- 單片模組額定功率 (W)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. 巡檢報告主表 (inspection_reports) - 完整對應進金生 CF-086 版次 11
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inspection_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number VARCHAR(100) UNIQUE NOT NULL,       -- 報告編號，例如 "CF086-20260907-DHEF"
    form_version VARCHAR(50) DEFAULT 'CF-086 版次 11', -- 表單格式版本
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    site_name VARCHAR(200) NOT NULL,                  -- 案場名稱快照
    capacity_kwp NUMERIC(10, 2) NOT NULL,             -- 容量快照
    contract_term VARCHAR(100),                       -- 合約起訖
    inspection_date DATE NOT NULL,                    -- 巡檢日期
    quarter VARCHAR(10) NOT NULL DEFAULT 'Q3',        -- 季別: Q1, Q2, Q3, Q4, 特巡
    inspection_type VARCHAR(50) DEFAULT '定期巡檢-有載', -- 巡檢類型: 定期巡檢-有載, 定期巡檢-無載, 特巡
    
    -- 人員與課別
    engineers TEXT[] NOT NULL DEFAULT '{}',           -- 巡檢人員名單，例如 ['姜興中', '洪稜凱', '黃昱超']
    department VARCHAR(100) DEFAULT '維運一課',       -- 所屬維運課別
    phone VARCHAR(50) DEFAULT '07-3347879',           -- 聯絡電話
    
    -- 審核流程狀態
    status VARCHAR(30) NOT NULL DEFAULT 'draft',      -- draft(草稿), submitted(待審核), approved(已核准), dispatched(已派送)
    reviewed_by VARCHAR(100),                         -- 審核主管
    reviewed_at TIMESTAMPTZ,                          -- 審核時間
    review_comments TEXT,                             -- 審核意見或批示
    stamp_code VARCHAR(100) DEFAULT '115.09.11 維運一課專用章', -- 電子章戳編號
    
    -- 環境量測與抽檢區資訊 (JSONB 靈活擴充)
    environmental_data JSONB NOT NULL DEFAULT '{
        "weather": "晴",
        "radiation": 940,
        "ambient_temp": 30.9,
        "module_temp": 44.1,
        "wind_speed": null
    }'::jsonb,
    
    sampling_info JSONB NOT NULL DEFAULT '{
        "sampled_area": "C 區",
        "screw_looseness_pct": 0,
        "thermal_max_temp": 46.9,
        "drawing_url": "assets/drawing_area_c.png"
    }'::jsonb,
    
    -- 建議與待改善事項 (Chapter 4 & 5)
    suggestions JSONB NOT NULL DEFAULT '{
        "pv_system": { "status": "正常", "desc": "正常", "treatment": "" },
        "monitoring_system": { "status": "正常", "desc": "正常", "treatment": "" },
        "inverter": { "status": "正常", "desc": "正常", "treatment": "" },
        "ac_box": { "status": "異常，不影響發電", "desc": "異常，不影響發電。", "treatment": "一、MVCB 盤照明 Fuse 失效。" },
        "high_voltage": { "status": "異常", "desc": "異常", "treatment": "因環境因素，該案高壓設備容易受潮放電。2025 年高保檢測發現設備絕緣異常，更換 DS、PT、CT、MCVCB 等設備。本次巡檢發現 GPT 盤內礙子已有劣化跡象，建議更換陶瓷較耐用。" },
        "other": { "desc": "一、MVCB 盤照明故障，不影響發電。", "photo_url": "assets/mvcb_light_issue.jpeg" }
    }'::jsonb,
    
    -- 各子系統定檢檢驗項目記錄 (Chapter 2, 6, 8, 9, 10, 11, 12, 13)
    checklists JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- 電性量測數據 (有載 RA 檢測 / 無載 Voc 檢測)
    electrical_tests JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- 巡檢照片目錄清單
    photos_manifest JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- 自然語言原始筆記 (工程師現場語音/隨手輸入的文字留存)
    raw_natural_language TEXT,
    
    -- 產出之 PDF 下載連結 (可直儲 Supabase Storage)
    pdf_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. 現場照片明細表 (inspection_photos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inspection_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES public.inspection_reports(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,                    -- 例如: 'module_surface', 'thermal_image', 'distribution_box', 'issue'
    title VARCHAR(150) NOT NULL,                      -- 標題: '模組受光面 外觀檢查'
    caption TEXT,                                     -- 詳細說明
    image_url TEXT NOT NULL,                          -- 圖片公開 URL (Supabase Storage 或本地快取)
    storage_path TEXT,                                -- Storage 儲存桶路徑
    taken_at TIMESTAMPTZ,                             -- 拍攝時間
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引加速查詢
CREATE INDEX IF NOT EXISTS idx_inspection_reports_site_id ON public.inspection_reports(site_id);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_date ON public.inspection_reports(inspection_date DESC);
CREATE INDEX IF NOT EXISTS idx_inspection_reports_status ON public.inspection_reports(status);
CREATE INDEX IF NOT EXISTS idx_inspection_photos_report_id ON public.inspection_photos(report_id);

-- ==============================================================================
-- 5. 啟用 RLS 行級安全防護 (Row Level Security)
-- ==============================================================================
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_photos ENABLE ROW LEVEL SECURITY;

-- 5.1 sites 資料表 RLS 政策
-- 所有人 (含 anon) 允許讀取案場資料
CREATE POLICY "Allow public read sites"
    ON public.sites FOR SELECT
    USING (true);

-- 僅認證使用者或授權前端允許新增/修改案場
CREATE POLICY "Allow anon and auth insert sites"
    ON public.sites FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow anon and auth update sites"
    ON public.sites FOR UPDATE
    USING (true);

-- 5.2 inspection_reports 資料表 RLS 政策
-- 任何人可檢視報告 (供客戶/工程師查閱)
CREATE POLICY "Allow public read inspection_reports"
    ON public.inspection_reports FOR SELECT
    USING (true);

-- 允許前端建立巡檢報告
CREATE POLICY "Allow insert inspection_reports"
    ON public.inspection_reports FOR INSERT
    WITH CHECK (true);

-- 允許更新巡檢報告 (草稿編輯、審核核准等)
CREATE POLICY "Allow update inspection_reports"
    ON public.inspection_reports FOR UPDATE
    USING (true);

-- 允許刪除巡檢報告 (草稿清除)
CREATE POLICY "Allow delete inspection_reports"
    ON public.inspection_reports FOR DELETE
    USING (true);

-- 5.3 inspection_photos 資料表 RLS 政策
CREATE POLICY "Allow public read inspection_photos"
    ON public.inspection_photos FOR SELECT
    USING (true);

CREATE POLICY "Allow insert inspection_photos"
    ON public.inspection_photos FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow delete inspection_photos"
    ON public.inspection_photos FOR DELETE
    USING (true);

-- ==============================================================================
-- 6. Supabase Storage 儲存桶設定 (Storage Buckets)
-- ==============================================================================
-- 建立相片儲存桶 (inspection-photos) 與 PDF 儲存桶 (inspection-reports-pdf)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('inspection-photos', 'inspection-photos', true),
    ('inspection-reports-pdf', 'inspection-reports-pdf', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage 存取政策
CREATE POLICY "Public Access for Inspection Photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'inspection-photos');

CREATE POLICY "Public Upload for Inspection Photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Public Access for Inspection PDFs"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'inspection-reports-pdf');

CREATE POLICY "Public Upload for Inspection PDFs"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'inspection-reports-pdf');

-- ==============================================================================
-- 7. 寫入種子案場資料 (Seed Data - 東和家樂福一、二期)
-- ==============================================================================
INSERT INTO public.sites (site_code, name, capacity_kwp, contract_term, address, owner_name, contact_phone, grid_connection_date, module_rated_power)
VALUES (
    'DHEF-672',
    '東和家樂福一、二期',
    672.75,
    '114/7/1 ~ 119/6/30',
    '高雄市',
    '東和鋼鐵 / 家樂福',
    '07-3347879',
    '2019-10-21',
    325
)
ON CONFLICT (site_code) DO UPDATE 
SET 
    name = EXCLUDED.name,
    capacity_kwp = EXCLUDED.capacity_kwp,
    contract_term = EXCLUDED.contract_term;

-- 自動更新時間戳 Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_inspection_reports_updated_at ON public.inspection_reports;
CREATE TRIGGER set_inspection_reports_updated_at
    BEFORE UPDATE ON public.inspection_reports
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
