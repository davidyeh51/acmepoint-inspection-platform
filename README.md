# 進金生能源 6692 ｜ 太陽光電巡檢報告智能自動化平台 (CF-086 標準規範)
> **AcmePoint Energy (6692) Solar PV Inspection Report AI Automation Platform**  
> 完整 1:1 複製進金生「CF-086 版次 11」標準定檢報告 ✕ AI 自然語言智慧剖析 ✕ 現場照片直傳分類 ✕ 維運課長審核簽署 ✕ Supabase BaaS 雲端資料庫 ✕ GitHub Pages 前端直發。

🌐 **GitHub Pages 線上預覽入口**：[https://davidyeh51.github.io/acmepoint-inspection-platform/](https://davidyeh51.github.io/acmepoint-inspection-platform/)  
📄 **參考標準文件**：`東和家樂福20260907巡檢報告(Q3)C區有載.pdf` (672.75kWp 專案，共 33 頁)

---

## 🌟 核心特色功能

### 1. 完整複製 1:1 進金生 CF-086 版次 11 巡檢報告格式
- **封面 (P1)**：案場名稱、合約起訖、專案容量、巡檢人員、進金生維運一課專用章戳 (115.09.11)。
- **合約檢查週期 (P2~P3)**：31 項標準定檢項目週期與標記對照。
- **年度維運履歷 (P4)**：1~12 月例行維護、清洗、高壓保養累積次數與甘特矩陣。
- **改善維運照片 (P5)**：清洗前後、改善前後照片排版。
- **建議與待改善事項 (P6~P7)**：五大系統（光電、監控、逆變器、配電箱、高壓系統）狀況簡述、處置做法與現場照片（如 MVCB Fuse 失效、GPT 盤礙子劣化）。
- **各子系統定檢表記錄 (P8~P21)**：
  - 光電系統全檢 (100%) 與抽檢 (C 區 10%、熱顯像 70%)
  - 螺絲鎖固判定標準說明 (<2% 良好, 2~10% 全檢, >10% 全數重鎖) 與 C 區 CAD 抽檢區域圖
  - 氣象蒐集箱、日照計 (940 W/m²)、模組貼片溫 (44.1℃)、大氣溫 (30.9℃)、監視系統 (1組)
  - 逆變器 Inverter (熱顯最高 48.7℃、散熱風扇、開關)
  - 配電箱 (DC BOX 熱顯 48.3℃; AC BOX 熱顯 58.8℃, 線電壓 393V, 相電壓 227V)
  - 升壓站 (VCB、S40 23.2kV、變壓器油溫 42℃、油位正常、電錶 34-1651-98 倍率 800)
  - 附屬設施與接地電阻 (避雷針 0.1Ω, 接地系統 0.1Ω)
- **直流電性測試記錄表 (P22~P31)**：
  - 第 2~4 季有載檢測：完整 40 組 MPPT 迴路 (INV-1 ~ INV-20) 有載電壓、電流、輸出功率與 RA 計算公式 ($RA = \frac{Pa \times 1000}{P \times Gi}$)，自動判定合格 (RA: 0.83 ~ 0.86 ≧ 0.75)。
  - 第 1 季無載檢測模板 (Voc 與絕緣阻抗)。
- **巡檢照片清冊 (P32~P33)**：標準 12 格現場高解析度照片對照。

### 2. 工程師 AI 自然語言口述智慧剖析 (Speech-to-Report)
- 工程師巡檢完畢後，無需翻閱 33 頁表單手動填寫。
- 只需在輸入框內語音輸入或貼上現場白話紀錄，系統內建的**領域專家正規化語意引擎 (Rule-based Semantic Engine)** 或 **Gemini 雲端大模型** 即刻自動抽取出：
  - 案場名稱與容量
  - 季別與巡檢日期
  - 巡檢工程師名單
  - 現場日照、氣溫、模組溫
  - 抽檢區域 (如 C 區)、螺絲鬆脫率與熱顯最高溫
  - 五大系統的異常判定與處置作法
  - 變壓器油溫、油位、高壓 S40 電壓、台電電錶度數
  - 避雷針與接地阻值

### 3. 現場相片批次拖曳直傳與自動分類
- 支援拖曳多張相片至上傳區。
- 系統自動依據檔名或分類規則歸檔至 12 格標準位置（受光面外觀、螺絲鎖固、日照計清潔、水壓測試、溫度貼片、變壓器、熱顯像、DC/AC 箱、Ipcam 監視等）。
- 直連 Supabase Storage 儲存桶 `inspection-photos`，離線時亦支援 Base64 / IndexedDB 快取。

### 4. 主管審核與一鍵客戶派送工作流
- **角色切換**：工程師 (填報) ⇄ 維運課長 (審核核准/加蓋電子章) ⇄ 業主客戶 (唯讀/下載)。
- **主管審核**：填寫批示備忘錄後一鍵核准，自動加蓋「115.09.11 維運一課專用章」。
- **對客派送**：一鍵產生客戶專屬 Email / LINE 正式說明通知文案與安全檢視連結。
- **一鍵列印 / 另存 PDF**：內建 A4 直式列印專用樣式表，避免表格跨頁截斷，完美符合公部門與外商企業報告標準。

---

## 🚀 Supabase BaaS 雲端資料庫設定指南

本專案依據 `github-supabase-web` 標準規範設計，前端為純靜態網頁（零金鑰外洩，僅暴露 Client Anon Key），後端強制啟用 RLS 行級安全防護。

### 步驟 1：建立 Supabase 資料表與儲存桶
1. 前往 [Supabase Console](https://supabase.com/) 登入您的專案。
2. 進入左側選單的 **SQL Editor**。
3. 開啟本專案內的 [`supabase-schema.sql`](./supabase-schema.sql)，複製全文並貼上至 SQL Editor 點擊 **Run**。
   - 此腳本會自動建立 `public.sites`、`public.inspection_reports`、`public.inspection_photos`。
   - 強制啟用 **RLS (Row Level Security)**。
   - 自動建立公開 Storage 儲存桶：`inspection-photos` 與 `inspection-reports-pdf`。
   - 自動寫入東和家樂福一、二期 (672.75kWp) 種子案場主檔。

### 步驟 2：在網頁介面啟用連線
1. 開啟平台網頁。
2. 點擊頂部右上角標籤 **「本地展示模式 (點擊設定)」** 或進入 **「Supabase 設定 & SQL」** 分頁。
3. 貼入您的 Supabase **Project URL** 與 **Anon Public Key**。
4. 點擊 **「儲存並測試連線」**，狀態將轉為 **🟢 Supabase 雲端已連線**！

---

## 💬 工程師 AI 自然語言輸入範本

工程師在現場可直接用語音口述如下文字：

```text
今天前往東和家樂福一、二期 (672.75kWp) 進行 2026 年度 Q3 定期巡檢，參與工程師：姜興中、洪稜凱、黃昱超。
現場天氣晴朗，環境日照強度 940 W/m2，氣象站大氣溫度 30.9 度，模組表面溫度貼片量測為 44.1 度，遮蔽測試歸零正常。
光電板整體受光面乾淨無破損，線槽與接地導線正常。依合約執行抽檢 C 區模組螺絲鎖固，抽檢比例 10% 螺絲均有標記無鬆脫，鬆脫率 0%，判定良好。模組紅外線熱顯像抽檢 70% 區域，單片溫差在標準以內，熱顯最高溫 46.9 度。
逆變器 INV-1 到 INV-20 共 20 台運轉均正常，散熱風扇轉動順暢無異音，熱顯像最高溫 48.7 度。
配電箱部分：DC 配電箱各開關正常，熱顯最高 48.3 度；AC 配電箱量測線電壓 393 VAC、相電壓 227 VAC，熱顯最高 58.8 度。
★ 異常與建議改善事項：
1. 配電箱：MVCB 盤照明 Fuse 失效導致盤內照明故障，但不影響正常發電。
2. 高壓系統：該案場高壓設備因環境易受潮放電，2025年高保曾更換 DS、PT、CT、MCVCB；本次巡檢發現 GPT 盤內礙子已有劣化跡象，建議後續更換為陶瓷耐用型。
升壓站檢查：變壓器油溫 42 度、油位指示正常，S40 顯示電壓 23.2 kV。台電市電電錶 (電號 34-1651-98，倍率 800) 抄表 09: 31.6、109: 4039.9。避雷針接地電阻量測 0.1 歐姆，接地箱電阻 0.1 歐姆。
直流電性有載檢測：在現場日照 963 W/m2 下量測全場 40 組 MPPT 迴路，輸出 RA 值落在 0.83 ~ 0.86 之間，全部判定合格 Pass！
```

點擊 **「⚡ 一鍵 AI 智慧剖析」** 後，系統會在 1 秒內完成 33 頁表單對應！

---

## 📁 專案檔案架構

```
acmepoint-inspection-platform/
├── index.html               # 核心 SPA 單一頁面前端應用
├── styles.css               # A4 列印排版與進金生企業色系樣式
├── app.js                   # 狀態管理、表單同步、審核與列印模組
├── ai-parser.js             # 現場自然語言智慧語意剖析引擎
├── report-data-seed.js      # 東和家樂福 Q3 巡檢報告標準種子資料
├── supabase-client.js       # Supabase BaaS 雲端儲存與離線同步引擎
├── supabase-schema.sql      # Supabase PostgreSQL DDL、RLS 與 Storage 政策腳本
├── assets/                  # 官方抽取之高解析度圖檔與相片
│   ├── acme_logo.jpeg       # 進金生能源服務官方 Logo
│   ├── acme_stamp.png       # 115.09.11 維運一課專用章 (電子印鑑)
│   ├── drawing_area_c.png   # C 區抽檢區域圖 (CAD Layout)
│   ├── mvcb_light_issue.jpeg# MVCB 照明故障現場照片
│   ├── photo_module_surface.jpeg
│   ├── photo_screws_check.jpeg
│   ├── photo_pyranometer.jpeg
│   ├── photo_cleaning_pump.jpeg
│   ├── photo_temp_sensor.jpeg
│   ├── photo_transformer_oil.jpeg
│   ├── photo_thermal_module.jpeg
│   ├── photo_ac_box_labels.jpeg
│   ├── photo_thermal_dc_box.jpeg
│   ├── photo_thermal_mc4.jpeg
│   ├── photo_dc_box_current.jpeg
│   └── photo_ipcam_view.jpeg
└── README.md                # 完整技術架構與操作說明手冊
```

---

## 🛠️ 本地端測試與 GitHub 推播

### 1. 本地啟動預覽 (Python 簡易伺服器)
```bash
cd "G:\我的雲端硬碟\3_大衛工作\2_進金生能源\4.0 功能層級\4.6 運維管理\4.6.7 AI Agent\acmepoint-inspection-platform"
python -m http.server 8080
```
開啟瀏覽器至 `http://localhost:8080` 即可預覽。

### 2. 推播至 GitHub 與啟用 GitHub Pages
```bash
git init
git add .
git commit -m "feat: initial commit for AcmePoint Solar Inspection Platform (CF-086)"
gh repo create davidyeh51/acmepoint-inspection-platform --public --source=. --remote=origin --push
```

在 GitHub 倉庫的 **Settings → Pages** 中，將 Source 設定為 `main` 分支的 `/ (root)`，即可於數秒後在 `https://davidyeh51.github.io/acmepoint-inspection-platform/` 正式上線！
