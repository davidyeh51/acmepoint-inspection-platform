/**
 * 進金生能源 6692 ｜ 太陽光電巡檢報告標準種子資料
 * 來源：東和家樂福20260907巡檢報告(Q3)C區有載.pdf (CF-086 版次 11)
 */

window.SEED_REPORT = {
  id: "seed-report-20260907-dhef",
  report_number: "CF086-20260907-DHEF",
  form_version: "CF-086 版次 11",
  site_name: "東和家樂福一、二期",
  capacity_kwp: 672.75,
  contract_term: "114/7/1 ~ 119/6/30",
  inspection_date: "2026-09-07",
  quarter: "Q3",
  inspection_type: "定期巡檢-有載",
  engineers: ["姜興中", "洪稜凱", "黃昱超"],
  department: "維運一課",
  phone: "07-3347879",
  status: "approved",
  reviewed_by: "維運一課課長",
  reviewed_at: "2026-09-11T10:00:00+08:00",
  stamp_text: "115.09.11 維運一課專用章",
  stamp_url: "assets/acme_stamp.png",
  logo_url: "assets/acme_logo.jpeg",

  // 1. 環境量測
  environmental_data: {
    weather: "晴",
    test_interval: "10:00~12:00",
    radiation: 940, // 氣象箱錶頭
    ambient_temp: 30.9, // 大氣溫度
    module_temp: 44.1, // 模組貼片溫度
    electrical_test_radiation: 963 // 電性量測時日照強度 (W/m2)
  },

  // 2. 抽檢區與螺絲鎖固
  sampling_info: {
    sampled_area: "C 區",
    screw_looseness_pct: 0.0,
    looseness_level: "良好 (OK) - 鬆脫率 < 2%",
    thermal_max_temp: 46.9,
    drawing_url: "assets/drawing_area_c.png"
  },

  // 3. 本次巡檢建議/待改善事項 (Chapter 4)
  suggestions: {
    pv_system: {
      status: "正常",
      desc: "正常",
      treatment: ""
    },
    monitoring_system: {
      status: "正常",
      desc: "正常",
      treatment: ""
    },
    inverter: {
      status: "正常",
      desc: "正常",
      treatment: ""
    },
    ac_box: {
      status: "異常，不影響發電",
      desc: "異常，不影響發電。",
      treatment: "一、MVCB 盤照明 Fuse 失效。"
    },
    high_voltage: {
      status: "異常",
      desc: "異常",
      treatment: "因環境因素，該案高壓設備容易受潮放電。2025 年高保檢測發現設備絕緣異常，更換 DS、PT、CT、MCVCB 等設備。本次巡檢發現 GPT 盤內礙子已有劣化跡象，建議更換陶瓷較耐用。"
    },
    other: {
      desc: "一、MVCB 盤照明故障，不影響發電。",
      photo_url: "assets/mvcb_light_issue.jpeg"
    }
  },

  // 4. 合約檢查週期 31 項對照表 (Chapter 1)
  contract_periods: [
    { no: 1, item: "太陽能板 PV Modules", period: "每季", mark: "V", remark: "" },
    { no: 2, item: "支架/浮台 Brackets and Floating Platoon", period: "每季", mark: "V", remark: "" },
    { no: 3, item: "線槽 Cable Tray", period: "每季", mark: "V", remark: "" },
    { no: 4, item: "氣象箱 Weather Station", period: "每季", mark: "V", remark: "" },
    { no: 5, item: "監控箱 Monitoring Station", period: "每季", mark: "V", remark: "" },
    { no: 6, item: "監視系統 Monitoring System", period: "每季", mark: "V", remark: "" },
    { no: 7, item: "直/交流轉換器 Inverter", period: "每季", mark: "V", remark: "" },
    { no: 8, item: "直流配電箱 DC Distribution Case", period: "每季", mark: "V", remark: "" },
    { no: 9, item: "交流配電箱 AC Distribution Case", period: "每季", mark: "V", remark: "" },
    { no: 10, item: "高壓箱盤體 High-Voltage Station", period: "每季", mark: "V", remark: "" },
    { no: 11, item: "變壓器 Transformer", period: "每季", mark: "V", remark: "" },
    { no: 12, item: "給水系統 Water Supply System", period: "每季", mark: "V", remark: "" },
    { no: 13, item: "安全步道檢查 Safety Trail", period: "無此項目", mark: "/", remark: "" },
    { no: 14, item: "上下設備檢查 Equipment", period: "每季", mark: "V", remark: "" },
    { no: 15, item: "護欄圍籬 Fence", period: "每季", mark: "V", remark: "" },
    { no: 16, item: "安全母索 Safety Main Rope", period: "無此項目", mark: "/", remark: "" },
    { no: 17, item: "滅火器檢查/保養 Fire Equipment", period: "每季", mark: "V", remark: "" },
    { no: 18, item: "避雷針阻值量測 Resistance of Lightning Rod", period: "每季", mark: "V", remark: "" },
    { no: 19, item: "接地系統阻值量測 Resistance of Grounding System", period: "每季", mark: "V", remark: "" },
    { no: 20, item: "有載電壓量測 Voltage measurement of on-load (100%)", period: "每季", mark: "V", remark: "" },
    { no: 21, item: "有載電流量測 Circuit measurement of on-load (100%)", period: "每季", mark: "V", remark: "" },
    { no: 22, item: "開路電壓量測 Voltage measurement of open circuit (100%)", period: "年檢", mark: "V", remark: "" },
    { no: 23, item: "絕緣阻抗量測 Measurement of insulation resistance (100%)", period: "年檢", mark: "V", remark: "" },
    { no: 24, item: "高壓保養 High-Voltage equipment maintenance", period: "年檢", mark: "V", remark: "" },
    { no: 25, item: "模組清洗 PV module cleaning", period: "無此項目", mark: "/", remark: "本案客戶無清洗需求" },
    { no: 26, item: "災後巡檢 Inspection after Disaster", period: "無此項目", mark: "/", remark: "" },
    { no: 27, item: "災前巡檢 Inspection before Disaster", period: "無此項目", mark: "/", remark: "" },
    { no: 28, item: "展示看板 Display panel", period: "無此項目", mark: "/", remark: "" },
    { no: 29, item: "電網異常檢查 Electronic Internet", period: "每季", mark: "V", remark: "" },
    { no: 30, item: "除草/清除水生植物 Vegetation control", period: "無此項目", mark: "/", remark: "" },
    { no: 31, item: "案場託管告警 Alert / Alarm management", period: "無此項目", mark: "/", remark: "" }
  ],

  // 5. 年度維運履歷記錄表 (Chapter 2)
  annual_schedule: [
    { no: 1, item: "模組清洗 PV Module Cleaning", cycle: "NA", count: 0, months: [] },
    { no: 2, item: "高壓保養 High-Voltage Maintenance", cycle: "NA", count: 1, months: [9] },
    { no: 3, item: "例行巡檢 Regular Inspection", cycle: "90 天", count: 3, months: [3, 6, 9] },
    { no: 4, item: "浮台錨錠檢查 Floating and Mooring Anchor", cycle: "不定期", count: 0, months: [] },
    { no: 5, item: "模組更換(片數) PV Module Replacement", cycle: "不定期", count: 0, months: [] },
    { no: 6, item: "INV 更換 Inverter Replacement", cycle: "不定期", count: 0, months: [] },
    { no: 7, item: "除草/清除水生植物 Vegetation control", cycle: "不定期", count: 0, months: [] },
    { no: 8, item: "監控異常檢查 Monitoring abnormalities inspection", cycle: "不定期", count: 0, months: [] },
    { no: 9, item: "電網異常檢查 Electrical abnormalities inspection", cycle: "不定期", count: 0, months: [] },
    { no: 10, item: "展示看板 Display panel", cycle: "不定期", count: 0, months: [] }
  ],

  // 6. 各子系統定檢檢驗項目
  checklists: {
    // 6.1 光電系統 (全檢)
    pv_full: [
      { equip: "太陽能板 PV modules", item: "模組受光面清潔度檢查", standard: "目測無髒污 Visual check - clean and not dirty", result: "OK", solution: "" },
      { equip: "太陽能板 PV modules", item: "模組玻璃外觀檢查", standard: "目視玻璃無炸裂現象 Visual check - no crack", result: "OK", solution: "" },
      { equip: "太陽能板 PV modules", item: "模組鋁框是否變形", standard: "目視鋁框無變形 Visual check - no deformation", result: "OK", solution: "" },
      { equip: "太陽能板 PV modules", item: "壓塊螺絲鎖固檢查", standard: "目視螺絲牙數有 3 牙以上或滑動標記無位移/封膠良好", result: "OK", solution: "" },
      { equip: "線槽 Cable Tray", item: "線槽有無腐蝕生鏽", standard: "目視外觀無腐蝕 Visual check - no corrosion", result: "OK", solution: "" },
      { equip: "線槽 Cable Tray", item: "檢查線槽蓋板是否脫離/遺失", standard: "蓋板無脫離/遺失 No lift off or missing", result: "OK", solution: "" },
      { equip: "線槽 Cable Tray", item: "牢固度檢查", standard: "綁固材料無鬆脫或鏽蝕 Strap material is fixed", result: "OK", solution: "" },
      { equip: "線槽 Cable Tray", item: "接合處密封檢查", standard: "接合處密封 Connection point is sealing well", result: "OK", solution: "" },
      { equip: "浮台及錨錠", item: "浮台是否破損", standard: "外觀無破損凹陷無進水下沉 Visual check", result: "/", solution: "" },
      { equip: "浮台及錨錠", item: "線管/線橋綁固檢查", standard: "線管/線橋綁固無鬆弛綁固線材無遺失或鏽蝕", result: "/", solution: "" },
      { equip: "浮台及錨錠", item: "錨錠繩索是否鬆弛", standard: "綁固良好無脫落 Fixed without looseness", result: "/", solution: "" }
    ],
    // 6.2 光電系統 (抽檢 C 區)
    pv_sampling: [
      { equip: "太陽能板 PV Module", item: "模組接地線檢查 (區域圖 10%)", standard: "1. 固定無鬆脫 2. 不同串列模組導通電阻值 100Ω 以下", result: "OK", solution: "" },
      { equip: "太陽能板 PV Module", item: "模組背板是否破損 (區域圖 10%)", standard: "良好無破損 Well without damage", result: "OK", solution: "" },
      { equip: "太陽能板 PV Module", item: "上壓片螺絲鎖固檢查 (區域圖 10%)", standard: "1. 螺絲封膠良好 2. 螺絲牙數有 3 牙以上滑動標記無位移 3. 工具檢查無鬆脫", result: "OK", solution: "" },
      { equip: "太陽能板 PV Module", item: "模組下鎖螺絲鎖固檢查 (區域圖 10%)", standard: "1. 螺絲封膠良好 2. 螺絲牙數有 3 牙以上滑動標記無位移 3. 工具檢查無鬆脫", result: "OK", solution: "" },
      { equip: "太陽能板 PV Module", item: "邊壓片螺絲鎖固檢查 (區域圖 10%)", standard: "1. 螺絲封膠良好 2. 螺絲牙數有 3 牙以上滑動標記無位移 3. 工具檢查無鬆脫", result: "OK", solution: "" },
      { equip: "太陽能板 PV Module", item: "模組熱顯檢查 (區域圖 70% ; 日照>600 W/m2)", standard: "1. 單片模組高、低溫差異不應超過 10℃ 2. 非因髒污影響任一處不應超過 85℃", result: "OK", solution: "最高溫: 46.9 度" },
      { equip: "支架/浮台 Bracket", item: "牢固度檢查 (區域圖 10%) 架高型/平鋪型/水面型", standard: "目視螺絲封膠良好、牙數有 3 牙以上、工具檢查無鬆脫", result: "OK", solution: "" }
    ],
    // 6.3 監控系統
    monitoring: [
      { equip: "氣象環境蒐集箱 Weather Station", item: "整體外觀檢查", standard: "箱體外觀無腐蝕，鎖固點良好，箱體是否牢固", result: "OK", solution: "" },
      { equip: "氣象環境蒐集箱 Weather Station", item: "日照計錶頭：外觀/七段顯示器/通訊", standard: "日照值 under sunshine: 940 W/m2，全遮蔽值: 0 W/m2", result: "OK", solution: "日照值: 940 W/m2" },
      { equip: "氣象環境蒐集箱 Weather Station", item: "模組溫度錶頭：外觀/七段顯示器/通訊", standard: "溫度值 Temp: 44.1 ℃", result: "OK", solution: "溫度值: 44.1 ℃" },
      { equip: "氣象環境蒐集箱 Weather Station", item: "大氣溫度錶頭：外觀/七段顯示器/通訊", standard: "溫度值 Temp: 30.9 ℃", result: "OK", solution: "溫度值: 30.9 ℃" },
      { equip: "氣象環境蒐集箱 Weather Station", item: "日照計表面清潔度檢查", standard: "表面無髒污外觀無損傷，線路、接頭無異常劣化", result: "OK", solution: "" },
      { equip: "氣象環境蒐集箱 Weather Station", item: "PV 模組溫度感測元件牢固度檢查", standard: "感測元件牢固度檢查，線路、接頭無異常劣化", result: "OK", solution: "" },
      { equip: "氣象環境蒐集箱 Weather Station", item: "大氣溫度感測元件牢固度檢查", standard: "感測元件牢固度檢查，線路、接頭無異常劣化", result: "OK", solution: "" },
      { equip: "氣象環境蒐集箱 Weather Station", item: "風速計感測元件牢固度檢查", standard: "感測元件牢固度檢查，線路、接頭無異常劣化", result: "/", solution: "" },
      { equip: "監控箱 Monitoring Case", item: "整體外觀檢查", standard: "箱體外觀無腐蝕，鎖固點良好，箱體牢固", result: "OK", solution: "" },
      { equip: "監控箱 Monitoring Case", item: "監控軟體及其他設備是否正常運作", standard: "各設備電源燈正常亮起，遠端檢視軟體正常", result: "OK", solution: "" },
      { equip: "監控箱 Monitoring Case", item: "散熱風扇檢查/清潔", standard: "風扇清潔，運轉無異音", result: "OK", solution: "" },
      { equip: "監控箱 Monitoring Case", item: "監控盤內檢查", standard: "粉塵髒汙清潔，無異物入侵", result: "OK", solution: "" },
      { equip: "監控箱 Monitoring Case", item: "各訊號/電源線接線端子是否異常", standard: "固定良好，導線無鬆脫，斷裂", result: "OK", solution: "" },
      { equip: "監視系統 CCTV System", item: "監視器檢查/保養", standard: "固定良好，導線無鬆脫，斷裂", result: "OK", solution: "" },
      { equip: "監視系統 CCTV System", item: "監視器數量", standard: "檢點數量應 1 組，數量 Quantity in real: 1 組", result: "OK", solution: "1 組" }
    ],
    // 6.4 逆變器
    inverter: [
      { equip: "直/交流轉換器 Inverter", item: "外部檢查", standard: "鎖固點良好無腐蝕無異常液體情況無異物入侵跡象", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "機殼是否有關緊", standard: "關緊穩固無鬆脫 Closed tightly", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "有無異音", standard: "無異音 No abnormal sound", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "顯示看板是否正常", standard: "外觀無破損/液體/其他異常", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "資訊檢查", standard: "操作檢查無錯誤訊息/無告警訊息", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "燈號是否正常", standard: "正常 Normal", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "散熱系統檢查", standard: "散熱葉片清潔，風扇清潔，風扇正常運作", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "熱顯溫度檢查", standard: "箱體相對溫度無異常，線路無異常積熱 (MC4 OOS 75℃, OOC 70~75℃)", result: "OK", solution: "最高溫: 48.7 度" },
      { equip: "直/交流轉換器 Inverter", item: "線路檢查", standard: "通訊線路/AC線路/DC線路外觀無受損變形，接點穩固無鬆脫", result: "OK", solution: "" },
      { equip: "直/交流轉換器 Inverter", item: "操作電源開關動作是否正常", standard: "OFF/ON 切換結束後在正常位置", result: "OK", solution: "" }
    ],
    // 6.5 配電箱
    distribution_box: [
      { equip: "直流配電箱 DC Box", item: "箱體表面檢查", standard: "箱體外觀無腐蝕且鎖固點良好", result: "OK", solution: "" },
      { equip: "直流配電箱 DC Box", item: "金屬軟管連接線槽外觀檢查", standard: "連接良好無鬆脫且密封良好", result: "OK", solution: "" },
      { equip: "直流配電箱 DC Box", item: "箱體內部是否完整", standard: "無積水且元件無短缺無外物入侵跡象", result: "OK", solution: "" },
      { equip: "直流配電箱 DC Box", item: "電纜有無損傷", standard: "目視電纜無破損 No damage by visual check", result: "OK", solution: "" },
      { equip: "直流配電箱 DC Box", item: "檢查元件是否異常 (DS、SPD)", standard: "外觀無損傷，SPD 檢視無異常", result: "OK", solution: "" },
      { equip: "直流配電箱 DC Box", item: "使用熱影像檢查", standard: "保險絲盒 OOS 75℃, 直流開關 OOS 65℃, SPD OOS 80℃", result: "OK", solution: "最高溫: 48.3 度" },
      { equip: "交流配電盤 AC Box", item: "斷電檢查：接線端子是否鬆弛", standard: "斷電後用力檢查端子是否鬆脫", result: "/", solution: "" },
      { equip: "交流配電盤 AC Box", item: "斷電檢查：保險絲座鬆脫檢查", standard: "斷電後拉出保險絲後檢查簧片是否鬆弛", result: "/", solution: "" },
      { equip: "交流配電盤 AC Box", item: "箱體表面檢查", standard: "箱體外觀無腐蝕鎖固點良好", result: "OK", solution: "" },
      { equip: "交流配電盤 AC Box", item: "箱體內部是否完整", standard: "有無水漬/異味/異物元件無短缺", result: "OK", solution: "" },
      { equip: "交流配電盤 AC Box", item: "電纜/銅排外觀檢查", standard: "目視電纜/銅排無損傷", result: "OK", solution: "" },
      { equip: "交流配電盤 AC Box", item: "斷路器接點螺絲檢查", standard: "接點螺絲記號檢查無位移外觀無損傷", result: "OK", solution: "" },
      { equip: "交流配電盤 AC Box", item: "使用熱影像檢查", standard: "各接點溫差不超過 10℃，溫度 OOS 75℃, OOC 65~75℃", result: "OK", solution: "最高溫: 58.8 度" },
      { equip: "交流配電盤 AC Box", item: "電壓記錄", standard: "使用耐高壓手套量測電壓", result: "OK", solution: "線電壓: 393 VAC, 相電壓: 227 VAC" }
    ],
    // 6.6 升壓站
    booster_station: [
      { equip: "高壓斷路器箱盤體檢查", item: "外箱表面檢查", standard: "箱體外觀無腐蝕鎖固點良好有無外物入侵跡象", result: "OK", solution: "" },
      { equip: "高壓斷路器箱盤體檢查", item: "VCB 開關檢查", standard: "燈號正常 Indicators are normal", result: "OK", solution: "" },
      { equip: "高壓斷路器箱盤體檢查", item: "UPS 功能檢查", standard: "燈號正常 Indicators are normal", result: "OK", solution: "" },
      { equip: "高壓斷路器箱盤體檢查", item: "S40 功能檢查", standard: "電壓檢視 Voltage check", result: "OK", solution: "顯示電壓值: 23.2 kV" },
      { equip: "高壓斷路器箱盤體檢查", item: "ACB 空氣斷路器檢查", standard: "無外物入侵跡象 No foreign body intrusion", result: "OK", solution: "" },
      { equip: "高壓斷路器箱盤體檢查", item: "VCB 斷路器檢查", standard: "無外物入侵跡象 No foreign body intrusion", result: "OK", solution: "" },
      { equip: "高壓斷路器箱盤體檢查", item: "LBS 熔斷開關檢查", standard: "無外物入侵跡象 No foreign body intrusion", result: "OK", solution: "" },
      { equip: "變壓器 Transformer", item: "油溫/油位記錄", standard: "由檢視孔檢視均在合格範圍內", result: "OK", solution: "油溫: 42 ℃, 油位: 正常" },
      { equip: "變壓器 Transformer", item: "變壓器外觀", standard: "外觀無腐蝕 No corrosion", result: "OK", solution: "" },
      { equip: "變壓器 Transformer", item: "外殼接地線檢查", standard: "鎖固點良好無破損", result: "OK", solution: "" },
      { equip: "市電電錶 Utility Meter", item: "箱體外觀檢查", standard: "鉛封無受破壞 No damage of the lead sealant", result: "OK", solution: "電號: 34-1651-98, 倍率: 800" },
      { equip: "市電電錶 Utility Meter", item: "數值記錄", standard: "09/109 數值記錄", result: "OK", solution: "09 數值: 31.6, 109 數值: 4039.9" }
    ],
    // 6.7 附屬設施 & 接地阻值
    facility: [
      { equip: "給水系統 Water Supply", item: "馬達檢查", standard: "馬達本體固定良好開關功能正常運作正常", result: "OK", solution: "" },
      { equip: "給水系統 Water Supply", item: "管路檢查", standard: "水路出水正常水路管無劣化漏水", result: "OK", solution: "" },
      { equip: "給水系統 Water Supply", item: "電量錶功能是否正常", standard: "錶頭外觀無破裂開水檢查電量錶轉動", result: "/", solution: "" },
      { equip: "給水系統 Water Supply", item: "水量計量錶功能是否正常", standard: "錶頭外觀無破裂開水檢查計量錶轉動", result: "OK", solution: "" },
      { equip: "雜項設備", item: "安全步道檢查", standard: "檢查有牢固不晃動踏板區有超過 30 公分", result: "/", solution: "" },
      { equip: "雜項設備", item: "上下設備檢查", standard: "檢查有牢固不晃動護欄良好無腐蝕 5.5米以上有休息區", result: "/", solution: "" },
      { equip: "雜項設備", item: "護欄圍籬 Fence", standard: "目視檢查牢固不晃動無損傷高度 90cm 以上間桿 30cm 內", result: "/", solution: "" },
      { equip: "雜項設備", item: "安全母索 Safety Rope", standard: "鋼索正常無損傷鎖固環正常數量 3 個", result: "/", solution: "" },
      { equip: "雜項設備", item: "避雷針檢查", standard: "與基座固定牢固鋼索正常無損傷鋼索固環正常", result: "/", solution: "" },
      { equip: "雜項設備", item: "避雷針阻值量測", standard: "< 10 Ω", result: "OK", solution: "電阻值: 0.1 Ω" },
      { equip: "雜項設備", item: "滅火器檢查/保養", standard: "皮管無破裂按壓片無損傷檢查在校期內壓力錶在合格區", result: "OK", solution: "" },
      { equip: "雜項設備", item: "接地測試箱檢查", standard: "箱體固定良好接地導線無鬆脫斷裂箱體內無異物", result: "OK", solution: "" },
      { equip: "接地系統 Grounding", item: "接地系統阻值量測", standard: "< 10 Ω", result: "OK", solution: "電阻值: 0.1 Ω" },
      { equip: "雜項設備", item: "植披檢查", standard: "無因植物生長造成遮陰", result: "/", solution: "" },
      { equip: "雜項設備", item: "危石與坍滑檢查", standard: "檢查是否有鬆方落石或坍滑情況", result: "/", solution: "" },
      { equip: "水面型水位檢查", item: "水面型水位檢查", standard: "檢查水位是否已達清淤標準", result: "/", solution: "" }
    ]
  },

  // 7. 有載直流電性量測 (INV-1 ~ INV-20，完整 40 個 MPPT 迴路)
  electrical_tests_on_load: {
    title: "直流電性測試記錄表 (第 2~4 季有載檢測)",
    test_interval: "10:00~12:00",
    grid_date: "2019/10/21",
    years_of_site: 6,
    weather: "晴",
    equipment: "數位多功能電錶, 勾錶、日照 > 600 W/m2",
    radiation_w_m2: 963,
    relative_standard_ratio: "70%",
    criteria_absolute: "1~5 年 RA≧80%, 6~13 年 RA≧75%, 14~20 年 RA≧70%",
    criteria_relative: "該單串列 RA 值 / 該 INV 串列 RA 平均值 ≧ 70%",
    overall_result: "合格 Pass : OK",
    inv_summary: [
      { inv: "INV-1", avg_ra: 0.85, rel_std: 0.60 },
      { inv: "INV-2", avg_ra: 0.86, rel_std: 0.60 },
      { inv: "INV-3", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-4", avg_ra: 0.86, rel_std: 0.60 },
      { inv: "INV-5", avg_ra: 0.86, rel_std: 0.60 },
      { inv: "INV-6", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-7", avg_ra: 0.85, rel_std: 0.60 },
      { inv: "INV-8", avg_ra: 0.86, rel_std: 0.60 },
      { inv: "INV-9", avg_ra: 0.83, rel_std: 0.58 },
      { inv: "INV-10", avg_ra: 0.83, rel_std: 0.58 },
      { inv: "INV-11", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-12", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-13", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-14", avg_ra: 0.84, rel_std: 0.58 },
      { inv: "INV-15", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-16", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-17", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-18", avg_ra: 0.85, rel_std: 0.59 },
      { inv: "INV-19", avg_ra: 0.84, rel_std: 0.59 },
      { inv: "INV-20", avg_ra: 0.84, rel_std: 0.58 }
    ],
    // 40 筆明細
    strings: [
      { inv: "INV-1", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16826, radiation: 963, voltage: 590.4, current: 28.5, ra: 0.85, result: "OK" },
      { inv: "INV-1", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11147, radiation: 963, voltage: 590.4, current: 18.9, ra: 0.85, result: "OK" },
      { inv: "INV-2", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16891, radiation: 963, voltage: 591.2, current: 28.6, ra: 0.86, result: "OK" },
      { inv: "INV-2", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11274, radiation: 963, voltage: 590.9, current: 19.1, ra: 0.86, result: "OK" },
      { inv: "INV-3", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16640, radiation: 963, voltage: 581.4, current: 28.6, ra: 0.84, result: "OK" },
      { inv: "INV-3", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11043, radiation: 963, voltage: 579.1, current: 19.1, ra: 0.84, result: "OK" },
      { inv: "INV-4", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16915, radiation: 963, voltage: 590.8, current: 28.6, ra: 0.86, result: "OK" },
      { inv: "INV-4", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11289, radiation: 963, voltage: 588.9, current: 19.2, ra: 0.86, result: "OK" },
      { inv: "INV-5", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16986, radiation: 963, voltage: 595.8, current: 28.5, ra: 0.86, result: "OK" },
      { inv: "INV-5", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11153, radiation: 963, voltage: 583.6, current: 19.1, ra: 0.85, result: "OK" },
      { inv: "INV-6", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16586, radiation: 963, voltage: 577.7, current: 28.7, ra: 0.84, result: "OK" },
      { inv: "INV-6", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11036, radiation: 963, voltage: 577.5, current: 19.1, ra: 0.84, result: "OK" },
      { inv: "INV-7", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16803, radiation: 963, voltage: 618.2, current: 27.2, ra: 0.85, result: "OK" },
      { inv: "INV-7", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11222, radiation: 963, voltage: 601.4, current: 18.7, ra: 0.85, result: "OK" },
      { inv: "INV-8", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16956, radiation: 963, voltage: 590.8, current: 28.7, ra: 0.86, result: "OK" },
      { inv: "INV-8", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10739, radiation: 963, voltage: 566.7, current: 19.0, ra: 0.86, result: "OK" },
      { inv: "INV-9", string: "MPPT1", rated_power: 325, qty: 60, output_power: 15717, radiation: 963, voltage: 554.4, current: 28.4, ra: 0.84, result: "OK" },
      { inv: "INV-9", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10414, radiation: 963, voltage: 562.3, current: 18.5, ra: 0.83, result: "OK" },
      { inv: "INV-10", string: "MPPT1", rated_power: 325, qty: 60, output_power: 15693, radiation: 963, voltage: 551.4, current: 28.5, ra: 0.84, result: "OK" },
      { inv: "INV-10", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10435, radiation: 963, voltage: 559.5, current: 18.7, ra: 0.83, result: "OK" },
      { inv: "INV-11", string: "MPPT1", rated_power: 325, qty: 60, output_power: 15803, radiation: 963, voltage: 559.0, current: 28.3, ra: 0.84, result: "OK" },
      { inv: "INV-11", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10496, radiation: 963, voltage: 561.0, current: 18.7, ra: 0.84, result: "OK" },
      { inv: "INV-12", string: "MPPT1", rated_power: 325, qty: 60, output_power: 15785, radiation: 963, voltage: 567.6, current: 27.8, ra: 0.84, result: "OK" },
      { inv: "INV-12", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10470, radiation: 963, voltage: 564.7, current: 18.5, ra: 0.84, result: "OK" },
      { inv: "INV-13", string: "MPPT1", rated_power: 325, qty: 60, output_power: 15713, radiation: 963, voltage: 557.0, current: 28.2, ra: 0.84, result: "OK" },
      { inv: "INV-13", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10526, radiation: 963, voltage: 561.7, current: 18.7, ra: 0.84, result: "OK" },
      { inv: "INV-14", string: "MPPT1", rated_power: 325, qty: 60, output_power: 15706, radiation: 963, voltage: 566.2, current: 27.7, ra: 0.84, result: "OK" },
      { inv: "INV-14", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10444, radiation: 963, voltage: 557.6, current: 18.7, ra: 0.83, result: "OK" },
      { inv: "INV-15", string: "MPPT1", rated_power: 325, qty: 60, output_power: 15919, radiation: 963, voltage: 563.9, current: 28.2, ra: 0.85, result: "OK" },
      { inv: "INV-15", string: "MPPT2", rated_power: 325, qty: 40, output_power: 10415, radiation: 963, voltage: 549.6, current: 19.0, ra: 0.83, result: "OK" },
      { inv: "INV-16", string: "MPPT1", rated_power: 325, qty: 66, output_power: 17294, radiation: 963, voltage: 622.3, current: 27.8, ra: 0.84, result: "OK" },
      { inv: "INV-16", string: "MPPT2", rated_power: 325, qty: 44, output_power: 11645, radiation: 963, voltage: 621.4, current: 18.7, ra: 0.85, result: "OK" },
      { inv: "INV-17", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16536, radiation: 963, voltage: 586.4, current: 28.2, ra: 0.84, result: "OK" },
      { inv: "INV-17", string: "MPPT2", rated_power: 325, qty: 44, output_power: 11579, radiation: 963, voltage: 618.2, current: 18.7, ra: 0.84, result: "OK" },
      { inv: "INV-18", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16809, radiation: 963, voltage: 607.7, current: 27.7, ra: 0.85, result: "OK" },
      { inv: "INV-18", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11072, radiation: 963, voltage: 609.0, current: 18.2, ra: 0.84, result: "OK" },
      { inv: "INV-19", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16595, radiation: 963, voltage: 612.6, current: 27.1, ra: 0.84, result: "OK" },
      { inv: "INV-19", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11087, radiation: 963, voltage: 586.0, current: 18.9, ra: 0.84, result: "OK" },
      { inv: "INV-20", string: "MPPT1", rated_power: 325, qty: 63, output_power: 16431, radiation: 963, voltage: 608.1, current: 27.0, ra: 0.83, result: "OK" },
      { inv: "INV-20", string: "MPPT2", rated_power: 325, qty: 42, output_power: 11031, radiation: 963, voltage: 588.0, current: 18.8, ra: 0.84, result: "OK" }
    ]
  },

  // 8. 巡檢相片目錄 (完整 12 張巡檢相片 + 建議故障相片)
  photos_manifest: [
    { id: "p1", category: "module", title: "模組受光面 外觀檢查", url: "assets/photo_module_surface.jpeg", page: 32, pos: 1 },
    { id: "p2", category: "structure", title: "模組中壓塊 螺絲抽檢", url: "assets/photo_screws_check.jpeg", page: 32, pos: 2 },
    { id: "p3", category: "monitoring", title: "日照計 表面清潔", url: "assets/photo_pyranometer.jpeg", page: 32, pos: 3 },
    { id: "p4", category: "water", title: "清洗水路 馬達水壓測試", url: "assets/photo_cleaning_pump.jpeg", page: 32, pos: 4 },
    { id: "p5", category: "temp", title: "模組溫度貼片 貼合度檢查", url: "assets/photo_temp_sensor.jpeg", page: 32, pos: 5 },
    { id: "p6", category: "transformer", title: "變壓器油溫油位檢查", url: "assets/photo_transformer_oil.jpeg", page: 32, pos: 6 },
    { id: "p7", category: "thermal", title: "模組受光面 熱顯溫度檢查 (43.9℃)", url: "assets/photo_thermal_module.jpeg", page: 33, pos: 1 },
    { id: "p8", category: "ac_box", title: "AC BOX 螺絲線標檢查", url: "assets/photo_ac_box_labels.jpeg", page: 33, pos: 2 },
    { id: "p9", category: "thermal", title: "DC BOX 熱顯溫度檢查 (42.9℃)", url: "assets/photo_thermal_dc_box.jpeg", page: 33, pos: 3 },
    { id: "p10", category: "thermal", title: "INV MC4 接頭 熱顯溫度檢查 (39.3℃)", url: "assets/photo_thermal_mc4.jpeg", page: 33, pos: 4 },
    { id: "p11", category: "electrical", title: "DC BOX 迴路有載電流量測", url: "assets/photo_dc_box_current.jpeg", page: 33, pos: 5 },
    { id: "p12", category: "cctv", title: "Ipcam 畫面檢查", url: "assets/photo_ipcam_view.jpeg", page: 33, pos: 6 },
    { id: "p13", category: "issue", title: "MVCB 盤照明 Fuse 失效", url: "assets/mvcb_light_issue.jpeg", page: 7, pos: 1 }
  ],

  // 9. 自然語言示範文本
  raw_natural_language: `今天前往東和家樂福一、二期 (672.75kWp) 進行 2026 年度 Q3 定期巡檢，參與工程師：姜興中、洪稜凱、黃昱超。
現場天氣晴朗，環境日照強度 940 W/m2，氣象站大氣溫度 30.9 度，模組表面溫度貼片量測為 44.1 度，遮蔽測試歸零正常。
光電板整體受光面乾淨無破損，線槽與接地導線正常。依合約執行抽檢 C 區模組螺絲鎖固，抽檢比例 10% 螺絲均有標記無鬆脫，鬆脫率 0%，判定良好。模組紅外線熱顯像抽檢 70% 區域，單片溫差在標準以內，熱顯最高溫 46.9 度。
逆變器 INV-1 到 INV-20 共 20 台運轉均正常，散熱風扇轉動順暢無異音，熱顯像最高溫 48.7 度。
配電箱部分：DC 配電箱各開關正常，熱顯最高 48.3 度；AC 配電箱量測線電壓 393 VAC、相電壓 227 VAC，熱顯最高 58.8 度。
★ 異常與建議改善事項：
1. 配電箱：MVCB 盤照明 Fuse 失效導致盤內照明故障，但不影響正常發電。
2. 高壓系統：該案場高壓設備因環境易受潮放電，2025年高保曾更換 DS、PT、CT、MCVCB；本次巡檢發現 GPT 盤內礙子已有劣化跡象，建議後續更換為陶瓷耐用型。
升壓站檢查：變壓器油溫 42 度、油位指示正常，S40 顯示電壓 23.2 kV。台電市電電錶 (電號 34-1651-98，倍率 800) 抄表 09: 31.6、109: 4039.9。避雷針接地電阻量測 0.1 歐姆，接地箱電阻 0.1 歐姆。
直流電性有載檢測：在現場日照 963 W/m2 下量測全場 40 組 MPPT 迴路，輸出 RA 值落在 0.83 ~ 0.86 之間（超過合約第6年標準 0.75），全部判定合格 Pass！`
};
