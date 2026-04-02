import type { TranslationMap } from '@/components/lang/useLanguage';

export const roeCalculatorLabels: TranslationMap = {
    // Page titles
    createCalculator: {
        id: 'Buat Kalkulator ROE',
        en: 'Create ROE Calculator',
        zh: '创建ROE计算器',
    },
    editCalculator: {
        id: 'Edit Kalkulator ROE',
        en: 'Edit ROE Calculator',
        zh: '编辑ROE计算器',
    },
    manageCalculators: {
        id: 'Kelola Kalkulator ROE',
        en: 'Manage ROE Calculators',
        zh: '管理ROE计算器',
    },
    
    // Steps
    step1: {
        id: 'Informasi Dasar',
        en: 'Basic Information',
        zh: '基本信息',
    },
    step2: {
        id: 'Data Pembelian Unit',
        en: 'Unit Purchase Data',
        zh: '设备购买数据',
    },
    step3: {
        id: 'Operasional',
        en: 'Operational',
        zh: '运营',
    },
    step4: {
        id: 'Biaya Bulanan',
        en: 'Monthly Costs',
        zh: '月费用',
    },
    step5: {
        id: 'Data Financial',
        en: 'Financial Data',
        zh: '财务数据',
    },

    // Step 1 - Basic Info
    basicInformation: {
        id: 'Informasi Dasar',
        en: 'Basic Information',
        zh: '基本信息',
    },
    basicInfoDescription: {
        id: 'Masukkan informasi dasar untuk kalkulasi ROE/ROA',
        en: 'Enter basic information for ROE/ROA calculation',
        zh: '输入ROE/ROA计算的基本信息',
    },
    iupSelection: {
        id: 'IUP Selection',
        en: 'IUP Selection',
        zh: 'IUP选择',
    },
    contractor: {
        id: 'Contractor',
        en: 'Contractor',
        zh: '承包商',
    },
    commodity: {
        id: 'Komoditas',
        en: 'Commodity',
        zh: '商品',
    },
    selectCommodity: {
        id: 'Select Komoditas',
        en: 'Select Commodity',
        zh: '选择商品',
    },
    status: {
        id: 'Status',
        en: 'Status',
        zh: '状态',
    },
    draft: {
        id: 'Draft',
        en: 'Draft',
        zh: '草稿',
    },
    coalCommodity: {
        id: 'Batu Bara',
        en: 'Coal',
        zh: '煤炭',
    },
    nickelCommodity: {
        id: 'Nikel',
        en: 'Nickel',
        zh: '镍',
    },
    tonnagePerUnit: {
        id: 'Tonase per Unit (ton)',
        en: 'Tonnage per Unit (ton)',
        zh: '每台设备吨位 (吨)',
    },
    haulDistance: {
        id: 'Jarak Haul (km PP)',
        en: 'Haul Distance (km RT)',
        zh: '运输距离 (公里往返)',
    },
    sellingPricePerTon: {
        id: 'Harga Jual per Ton (Rp)',
        en: 'Selling Price per Ton (Rp)',
        zh: '每吨售价 (Rp)',
    },

    // Loading states
    loadingCalculatorData: {
        id: 'Memuat data kalkulator...',
        en: 'Loading calculator data...',
        zh: '正在加载计算器数据...',
    },

    // Buttons
    saveAndNext: {
        id: 'Simpan & Lanjut',
        en: 'Save & Next',
        zh: '保存并继续',
    },
    saveOnly: {
        id: 'Simpan Saja',
        en: 'Save Only',
        zh: '仅保存',
    },
    previous: {
        id: 'Sebelumnya',
        en: 'Previous',
        zh: '上一步',
    },
    next: {
        id: 'Selanjutnya',
        en: 'Next',
        zh: '下一步',
    },
    back: {
        id: 'Kembali',
        en: 'Back',
        zh: '返回',
    },
    create: {
        id: 'Buat',
        en: 'Create',
        zh: '创建',
    },
    edit: {
        id: 'Edit',
        en: 'Edit',
        zh: '编辑',
    },
    delete: {
        id: 'Hapus',
        en: 'Delete',
        zh: '删除',
    },
    download: {
        id: 'Download',
        en: 'Download',
        zh: '下载',
    },
    breakdown: {
        id: 'Breakdown',
        en: 'Breakdown',
        zh: '详细分析',
    },

    // Table columns
    customer: {
        id: 'Customer',
        en: 'Customer',
        zh: '客户',
    },
    revenue: {
        id: 'Revenue',
        en: 'Revenue',
        zh: '收入',
    },
    updatedBy: {
        id: 'Updated By',
        en: 'Updated By',
        zh: '更新者',
    },
    action: {
        id: 'Aksi',
        en: 'Action',
        zh: '操作',
    },

    // Search and filters
    searchCalculator: {
        id: 'Cari kalkulator...',
        en: 'Search calculator...',
        zh: '搜索计算器...',
    },
    search: {
        id: 'Cari',
        en: 'Search',
        zh: '搜索',
    },
    clearFilters: {
        id: 'Bersihkan Filter',
        en: 'Clear Filters',
        zh: '清除筛选',
    },
    sortBy: {
        id: 'Urutkan',
        en: 'Sort by',
        zh: '排序方式',
    },
    filterByCommodity: {
        id: 'Filter Komoditas',
        en: 'Filter by Commodity',
        zh: '按商品筛选',
    },
    allCommodities: {
        id: 'Semua Komoditas',
        en: 'All Commodities',
        zh: '所有商品',
    },

    // Sort options
    newest: {
        id: 'Terbaru',
        en: 'Newest',
        zh: '最新',
    },
    oldest: {
        id: 'Terlama',
        en: 'Oldest',
        zh: '最旧',
    },

    // Confirmation messages
    deleteConfirmTitle: {
        id: 'Konfirmasi Hapus',
        en: 'Delete Confirmation',
        zh: '删除确认',
    },
    deleteConfirmMessage: {
        id: 'Apakah Anda yakin ingin menghapus kalkulator ini?',
        en: 'Are you sure you want to delete this calculator?',
        zh: '您确定要删除此计算器吗？',
    },
    yes: {
        id: 'Ya',
        en: 'Yes',
        zh: '是',
    },
    no: {
        id: 'Tidak',
        en: 'No',
        zh: '否',
    },

    // Messages
    noDataMessage: {
        id: 'Tidak ada data kalkulator ROE yang tersedia.',
        en: 'No ROE calculator data available.',
        zh: '没有可用的ROE计算器数据。',
    },
    // Additional loading text
    savingData: {
        id: 'Menyimpan...',
        en: 'Saving...',
        zh: '正在保存...',
    },

    // Financial terms
    roe: {
        id: 'ROE',
        en: 'ROE',
        zh: 'ROE',
    },
    roa: {
        id: 'ROA',
        en: 'ROA',
        zh: 'ROA',
    },
    monthlyRevenue: {
        id: 'Pendapatan Bulanan',
        en: 'Monthly Revenue',
        zh: '月收入',
    },

    // Step 2 - Unit Purchase
    unitPurchaseData: {
        id: 'Data Pembelian Unit',
        en: 'Unit Purchase Data',
        zh: '设备购买数据',
    },
    unitPurchaseDescription: {
        id: 'Input data pembelian unit dan struktur pembiayaan',
        en: 'Enter unit purchase data and financing structure',
        zh: '输入设备购买数据和融资结构',
    },
    pricePerUnit: {
        id: 'Harga Per Unit (Rp)',
        en: 'Price Per Unit (Rp)',
        zh: '单价 (Rp)',
    },
    unitQuantity: {
        id: 'Jumlah Unit (Qty)',
        en: 'Unit Quantity (Qty)',
        zh: '数量 (Qty)',
    },
    downPaymentPct: {
        id: 'Down Payment (%)',
        en: 'Down Payment (%)',
        zh: '首付 (%)',
    },
    financingTenor: {
        id: 'Tenor Pembiayaan (Bulan)',
        en: 'Financing Tenor (Months)',
        zh: '融资期限 (月)',
    },
    financingTenorYears: {
        id: 'tahun',
        en: 'years',
        zh: '年',
    },
    interestRateFlat: {
        id: 'Interest Rate Flat per Tahun (%)',
        en: 'Interest Rate Flat per Year (%)',
        zh: '年固定利率 (%)',
    },
    depreciationPeriod: {
        id: 'Periode Depresiasi (Bulan)',
        en: 'Depreciation Period (Months)',
        zh: '折旧期 (月)',
    },
    calculating: {
        id: 'Menghitung...',
        en: 'Calculating...',
        zh: '计算中...',
    },
    saveAndCalculate: {
        id: 'Simpan & Hitung',
        en: 'Save & Calculate',
        zh: '保存并计算',
    },
    financialStructure: {
        id: 'Struktur Financial',
        en: 'Financial Structure',
        zh: '财务结构',
    },
    asset: {
        id: 'Aset',
        en: 'Asset',
        zh: '资产',
    },
    equity: {
        id: 'Ekuitas',
        en: 'Equity',
        zh: '权益',
    },
    liability: {
        id: 'Liabilitas',
        en: 'Liability',
        zh: '负债',
    },
    financialStructureNote: {
        id: 'Catatan: ROE dihitung dari Profit/Equity dihitung dari Profit/Asset',
        en: 'Note: ROE calculated from Profit/Equity calculated from Profit/Asset',
        zh: '注: ROE由利润/权益计算，从利润/资产计算',
    },
    monhtlySummaryTitle: {
        id: 'Ringkasan Cicilan Bulanan',
        en: 'Monthly Installment Summary',
        zh: '月分期摘要',
    },
    principalPayment: {
        id: 'Cicilan Pokok',
        en: 'Principal Payment',
        zh: '本金支付',
    },
    monthlyInterest: {
        id: 'Bunga per Bulan',
        en: 'Monthly Interest',
        zh: '月利息',
    },
    totalMonthlyPayment: {
        id: 'Total Cicilan/Bulan',
        en: 'Total Payment/Month',
        zh: '每月总付款',
    },
    expenseImpactTitle: {
        id: 'Impact ke Total Expense',
        en: 'Impact to Total Expense',
        zh: '对总费用的影响',
    },
    depreciationPerMonth: {
        id: 'Penyusutan/Bulan',
        en: 'Depreciation/Month',
        zh: '每月折旧',
    },
    interestExpensePerMonth: {
        id: 'Bunga/Bulan',
        en: 'Interest/Month',
        zh: '每月利息',
    },
    totalFixedCostUnit: {
        id: 'Total Biaya Tetap dari Unit',
        en: 'Total Fixed Cost from Unit',
        zh: '设备总固定成本',
    },
    expenseImpactNote: {
        id: 'Nilai ini otomatis masuk ke Total Expense dan mempengaruhi Laba Bersih, ROE, dan ROA',
        en: 'These values automatically go into Total Expense and affect Net Profit, ROE, and ROA',
        zh: '这些值会自动计入总费用, 并影响净利润、ROE和ROA',
    },
    waitFetchPurchaseData: {
        id: 'Please wait while we fetch your purchase data...',
        en: 'Please wait while we fetch your purchase data...',
        zh: '正在获取您的购买数据，请稍候...',
    },

    // Step 3 - Operational
    operationalParameters: {
        id: 'Parameter Operasional',
        en: 'Operational Parameters',
        zh: '运营参数',
    },
    operationalDescription: {
        id: 'Input parameter operasional untuk menghitung revenue dan performa unit',
        en: 'Input operational parameters to calculate revenue and unit performance',
        zh: '输入运营参数以计算收入和设备性能',
    },
    ritasePerShift: {
        id: 'Ritase per Shift',
        en: 'Trips per Shift',
        zh: '每班运输次数',
    },
    shiftPerDay: {
        id: 'Shift per Hari',
        en: 'Shifts per Day',
        zh: '每天班次',
    },
    workingDaysPerMonth: {
        id: 'Hari Kerja per Bulan',
        en: 'Working Days per Month',
        zh: '每月工作天数',
    },
    physicalAvailability: {
        id: 'Physical Availability (%)',
        en: 'Physical Availability (%)',
        zh: '物理可用性 (%)',
    },
    fuelConsumptionType: {
        id: 'Tipe Konsumsi BBM',
        en: 'Fuel Consumption Type',
        zh: '燃料消耗类型',
    },
    fuelConsumption: {
        id: 'Konsumsi BBM',
        en: 'Fuel Consumption',
        zh: '燃料消耗',
    },
    fuelPrice: {
        id: 'Harga BBM (Rp/L)',
        en: 'Fuel Price (Rp/L)',
        zh: '燃料价格 (Rp/L)',
    },
    selectFuelConsumptionType: {
        id: 'Select Tipe Konsumsi BBM',
        en: 'Select Fuel Consumption Type',
        zh: '选择燃料消耗类型',
    },
    fuelConsumptionPerKm: {
        id: 'L/km (per kilometer)',
        en: 'L/km (per kilometer)',
        zh: 'L/km (每公里)',
    },
    fuelConsumptionPerKmTon: {
        id: 'L/km/ton (per km per ton)',
        en: 'L/km/ton (per km per ton)',
        zh: 'L/km/ton (每公里每吨)',
    },

    // Step 4 - Monthly Costs
    monthlyCosts: {
        id: 'Monthly Costs',
        en: 'Monthly Costs',
        zh: '每月费用',
    },
    monthlyCostsDescription: {
        id: 'Input semua biaya operasional bulanan untuk menghitung total expense',
        en: 'Input all monthly operational costs to calculate total expense',
        zh: '输入所有月度运营成本以计算总费用',
    },
    tyreCostPerUnit: {
        id: 'Biaya Ban per Unit (Rp/bulan)',
        en: 'Tire Cost per Unit (Rp/month)',
        zh: '每台设备轮胎费用 (Rp/月)',
    },
    fuelCostNote: {
        id: 'Biaya bahan bakar per bulan',
        en: 'Fuel cost per month',
        zh: '每月燃料费用',
    },
    maintenanceCostPerUnit: {
        id: 'Biaya Perawatan per Unit (Rp/Bulan)',
        en: 'Maintenance Cost per Unit (Rp/Month)',
        zh: '每台设备维护费用 (Rp/月)',
    },
    maintenanceCostNote: {
        id: 'Biaya perawatan dan service per bulan',
        en: 'Maintenance and service cost per month',
        zh: '每月维护和服务费用',
    },
    operatorSalaryPerUnit: {
        id: 'Gaji Operator per Unit (Rp/Bulan)',
        en: 'Operator Salary per Unit (Rp/Month)',
        zh: '每台设备操作员薪酬 (Rp/月)',
    },
    operatorSalaryNote: {
        id: 'Gaji operator dan helper per bulan',
        en: 'Operator and helper salary per month',
        zh: '每月操作员和助手薪酬',
    },
    depreciationAllUnits: {
        id: 'Depresiasi semua Unit (Rp/Bulan)',
        en: 'Depreciation All Units (Rp/Month)',
        zh: '所有设备折旧 (Rp/月)',
    },
    insuranceCostNote: {
        id: 'Biaya asuransi per bulan',
        en: 'Insurance cost per month',
        zh: '每月保险费用',
    },
    interestAllUnits: {
        id: 'Bunga semua Unit (Rp/bulan)',
        en: 'Interest All Units (Rp/month)',
        zh: '所有设备利息 (Rp/月)',
    },
    interestNote: {
        id: 'Bunga per bulan',
        en: 'Interest per month',
        zh: '每月利息',
    },
    overheadAllUnits: {
        id: 'Overhead/G&A (Semua Unit)',
        en: 'Overhead/G&A (All Units)',
        zh: '管理费/G&A (所有设备)',
    },
    otherCostNote: {
        id: 'Biaya lain-lain per bulan',
        en: 'Other costs per month',
        zh: '每月其他费用',
    },
    monthlyCostDetail: {
        id: 'Detail Biaya Bulanan (Rp)',
        en: 'Monthly Cost Details (Rp)',
        zh: '每月费用明细 (Rp)',
    },
    totalMonthlyExpenditure: {
        id: 'Total Pengeluaran Bulanan',
        en: 'Total Monthly Expenditure',
        zh: '月总支出',
    },
    monthlyCostPercentage: {
        id: 'Detail Biaya Bulanan (%)',
        en: 'Monthly Cost Details (%)',
        zh: '每月费用明细 (%)',
    },

    // Step 5 - Financial Data
    financialSummaryROE: {
        id: 'Financial Summary & ROE/ROA Analysis',
        en: 'Financial Summary & ROE/ROA Analysis',
        zh: '财务摘要和ROE/ROA分析',
    },
    equityModal: {
        id: 'Equity / Modal Sendiri (Rp)',
        en: 'Equity / Own Capital (Rp)',
        zh: '权益/自有资本 (Rp)',
    },
    liabilityDebt: {
        id: 'Liability / Hutang (Rp)',
        en: 'Liability / Debt (Rp)',
        zh: '负债/债务 (Rp)',
    },
    
    // Navigation
    step: {
        id: 'Langkah',
        en: 'Step',
        zh: '步骤',
    },
    of: {
        id: 'dari',
        en: 'of',
        zh: '共',
    },

    attentionTitle: {
        id: 'Perhatian',
        en: 'Attention',
        zh: '注意',
    },

    attentionDisclaimer: {
        id: 'ROE (Return on Equity) dan ROA (Return on Assets) yang ditampilkan dalam aplikasi ini dihitung hanya menggunakan data tingkat unit (pendapatan, biaya, dan aset). Item tingkat perusahaan seperti overhead, kewajiban lainnya, dan biaya operasional tambahan tidak termasuk. Oleh karena itu, angka-angka ini bersifat indikatif dan hanya dimaksudkan untuk analisis kinerja unit, bukan untuk menilai kinerja perusahaan secara keseluruhan.',
        en: 'The ROE (Return on Equity) and ROA (Return on Assets) shown in this application are calculated using unit-level data only (revenue, expenses, and assets). Company-wide items such as overhead, other liabilities, and additional operating expenses are excluded. As a result, these figures are indicative and intended solely for unit performance analysis, not for assessing overall company performance.',
        zh: '此应用程序中显示的 ROE (股本回报率）和 ROA (资产回报率）仅基于单位级数据（收入、费用和资产）计算。公司层面的项目，如管理费用、其他负债以及额外的运营费用未包含在内。因此，这些数值仅具有参考意义，仅用于单位绩效分析，不适用于评估公司整体绩效。',
    },

    // Errors
    fieldRequired: {
        id: 'Field ini wajib diisi',
        en: 'This field is required',
        zh: '此字段为必填项',
    },
    saveError: {
        id: 'Gagal menyimpan data',
        en: 'Failed to save data',
        zh: '保存数据失败',
    },
    loadError: {
        id: 'Gagal memuat data',
        en: 'Failed to load data',
        zh: '加载数据失败',
    },

    // Success messages
    saveSuccess: {
        id: 'Data berhasil disimpan',
        en: 'Data saved successfully',
        zh: '数据保存成功',
    },
    deleteSuccess: {
        id: 'Data berhasil dihapus',
        en: 'Data deleted successfully',
        zh: '数据删除成功',
    },

    // Breakdown page specific
    breakdownTitle: {
        id: 'Breakdown ROE Calculator',
        en: 'Breakdown ROE Calculator',
        zh: 'ROE计算器详细分析',
    },
    keyFinancialMetrics: {
        id: 'Key Financial Metrics',
        en: 'Key Financial Metrics',
        zh: '关键财务指标',
    },
    revenuePerMonth: {
        id: 'Revenue per Bulan',
        en: 'Monthly Revenue',
        zh: '月收入',
    },
    totalExpensePerMonth: {
        id: 'Total Expense per Bulan',
        en: 'Total Monthly Expense',
        zh: '月总支出',
    },
    netProfitPerMonth: {
        id: 'Laba Bersih Bulanan',
        en: 'Monthly Net Profit',
        zh: '月净利润',
    },
    profitMargin: {
        id: 'Profit Margin',
        en: 'Profit Margin',
        zh: '利润率',
    },
    roeRoaAnalysis: {
        id: 'ROE & ROA Analysis',
        en: 'ROE & ROA Analysis',
        zh: 'ROE & ROA分析',
    },
    returnOnEquity: {
        id: 'Return on Equity (ROE)',
        en: 'Return on Equity (ROE)',
        zh: '股本回报率 (ROE)',
    },
    returnOnAssets: {
        id: 'Return on Assets (ROA)',
        en: 'Return on Assets (ROA)',
        zh: '资产收益率 (ROA)',
    },
    formula: {
        id: 'Formula',
        en: 'Formula',
        zh: '公式',
    },
    revenueVsExpenseVsProfit: {
        id: 'Revenue vs Expense vs Profit',
        en: 'Revenue vs Expense vs Profit',
        zh: '收入对比支出对比利润',
    },
    breakdownMonthlyCosts: {
        id: 'Breakdown Biaya Bulanan',
        en: 'Monthly Cost Breakdown',
        zh: '月成本明细',
    },
    operationalMetrics: {
        id: 'Metrik Operasional',
        en: 'Operational Metrics',
        zh: '运营指标',
    },
    tripsPerDay: {
        id: 'Ritase per Hari',
        en: 'Trips per Day',
        zh: '每日行程数',
    },
    tripsPerMonth: {
        id: 'Ritase per Bulan',
        en: 'Trips per Month',
        zh: '每月行程数',
    },
    tonnagePerMonth: {
        id: 'Tonnage per Bulan',
        en: 'Monthly Tonnage',
        zh: '月吨位',
    },
    revenueMultipleUnit: {
        id: 'Revenue Multiple Unit',
        en: 'Revenue Multiple Unit',
        zh: '多单位收入',
    },
    unitQuantityBreakdown: {
        id: 'Jumlah Unit',
        en: 'Unit Quantity',
        zh: '单位数量',
    },
    revenuePerUnit: {
        id: 'Revenue per Unit',
        en: 'Revenue per Unit',
        zh: '单位收入',
    },
    totalRevenue: {
        id: 'Total Revenue',
        en: 'Total Revenue',
        zh: '总收入',
    },
    fuelMetrics: {
        id: 'Metrik BBM',
        en: 'Fuel Metrics',
        zh: '燃油指标',
    },
    fuelPerTrip: {
        id: 'BBM per Ritase (L)',
        en: 'Fuel per Trip (L)',
        zh: '每趟燃油 (升)',
    },
    fuelCostPerTrip: {
        id: 'Biaya BBM per Ritase',
        en: 'Fuel Cost per Trip',
        zh: '每趟燃油成本',
    },
    fuelEfficiency: {
        id: 'Efisiensi L/KM/Ton',
        en: 'Efficiency L/KM/Ton',
        zh: '效率 升/公里/吨',
    },
    monthlyExpenseDetail: {
        id: 'Detail Biaya Bulanan',
        en: 'Monthly Expense Details',
        zh: '月支出明细',
    },
    totalExpense: {
        id: 'Total Expense',
        en: 'Total Expense',
        zh: '总支出',
    },
    compareWithOtherCalculations: {
        id: 'Bandingkan dengan Perhitungan Lain',
        en: 'Compare with Other Calculations',
        zh: '与其他计算比较',
    },
    addComparison: {
        id: 'Tambah Perbandingan',
        en: 'Add Comparison',
        zh: '添加比较',
    },
    addNewComparison: {
        id: 'Add New Comparison',
        en: 'Add New Comparison',
        zh: '添加新比较',
    },
    brand: {
        id: 'Brand',
        en: 'Brand',
        zh: '品牌',
    },
    tripsPerShift: {
        id: 'Ritase per Shift',
        en: 'Trips per Shift',
        zh: '每班行程数',
    },
    unitQuantityQty: {
        id: 'Jumlah Unit (Qty)',
        en: 'Unit Quantity (Qty)',
        zh: '单位数量',
    },
    cancel: {
        id: 'Cancel',
        en: 'Cancel',
        zh: '取消',
    },
    adding: {
        id: 'Adding...',
        en: 'Adding...',
        zh: '添加中...',
    },
    deleteCompetitor: {
        id: 'Delete Competitor',
        en: 'Delete Competitor',
        zh: '删除竞争对手',
    },
    deleteCompetitorConfirm: {
        id: 'Are you sure you want to delete this Competitor? This action cannot be undone.',
        en: 'Are you sure you want to delete this Competitor? This action cannot be undone.',
        zh: '您确定要删除此竞争对手吗？此操作无法撤消。',
    },
    calculatorInfo: {
        id: 'Calculator Info',
        en: 'Calculator Info',
        zh: '计算器信息',
    },
    qty: {
        id: 'Qty',
        en: 'Qty',
        zh: '数量',
    },
    actions: {
        id: 'Actions',
        en: 'Actions',
        zh: '操作',
    },
    ascending: {
        id: 'Ascending',
        en: 'Ascending',
        zh: '升序',
    },
    descending: {
        id: 'Descending',
        en: 'Descending',
        zh: '降序',
    },
    orderBy: {
        id: 'Order by',
        en: 'Order by',
        zh: '排序',
    },
    createdAt: {
        id: 'Created At',
        en: 'Created At',
        zh: '创建时间',
    },
    quantity: {
        id: 'Quantity',
        en: 'Quantity',
        zh: '数量',
    },
    roeDifference: {
        id: 'ROE Difference',
        en: 'ROE Difference',
        zh: 'ROE差异',
    },
    roaPercentage: {
        id: 'ROA Percentage',
        en: 'ROA Percentage',
        zh: 'ROA百分比',
    },
    roeDifferenceTooltip: {
        id: 'ROE Difference',
        en: 'ROE Difference',
        zh: 'ROE差异',
    },
    roaPercentageTooltip: {
        id: 'ROA Percentage',
        en: 'ROA Percentage',
        zh: 'ROA百分比',
    },
    roaDifferenceTooltip: {
        id: 'ROA Difference',
        en: 'ROA Difference',
        zh: 'ROA差异',
    },
    tonase: {
        id: 'Tonase',
        en: 'Tonnage',
        zh: '吨位',
    },

    // Error messages for compare validation
    brandRequired: {
        id: 'Brand is required',
        en: 'Brand is required',
        zh: '品牌为必填项',
    },
    brandMinLength: {
        id: 'Brand must be at least 2 characters',
        en: 'Brand must be at least 2 characters',
        zh: '品牌至少需要2个字符',
    },
    correctValidationErrors: {
        id: 'Please correct the validation errors',
        en: 'Please correct the validation errors',
        zh: '请纠正验证错误',
    },
    calculatorIdRequired: {
        id: 'Calculator ID is required',
        en: 'Calculator ID is required',
        zh: '计算器ID为必填项',
    },
    comparisonAddedSuccess: {
        id: 'Comparison added successfully',
        en: 'Comparison added successfully',
        zh: '比较添加成功',
    },
    failedToAddComparison: {
        id: 'Failed to add comparison',
        en: 'Failed to add comparison',
        zh: '添加比较失败',
    },
    errorOccurredAdding: {
        id: 'An error occurred while adding comparison',
        en: 'An error occurred while adding comparison',
        zh: '添加比较时发生错误',
    },
    failedToDeleteCompetitor: {
        id: 'Failed to delete competitor',
        en: 'Failed to delete competitor',
        zh: '删除竞争对手失败',
    },
    competitorDeletedSuccess: {
        id: 'Competitor deleted successfully',
        en: 'Competitor deleted successfully',
        zh: '竞争对手删除成功',
    },

    // Cost breakdown categories
    costBBM: {
        id: 'BBM',
        en: 'Fuel',
        zh: '燃料',
    },
    costBan: {
        id: 'Ban',
        en: 'Tires',
        zh: '轮胎',
    },
    costSparepart: {
        id: 'Sparepart',
        en: 'Spare Parts',
        zh: '备件',
    },
    costGajiOperator: {
        id: 'Gaji Operator',
        en: 'Operator Salary',
        zh: '操作员薪酬',
    },
    costDepresiasi: {
        id: 'Depresiasi',
        en: 'Depreciation',
        zh: '折旧',
    },
    costBunga: {
        id: 'Bunga',
        en: 'Interest',
        zh: '利息',
    },
    costOverhead: {
        id: 'Overhead',
        en: 'Overhead',
        zh: '管理费用',
    },

    // ROE ROA Descriptions
    roeDescription: {
        id: 'ROE mengukur efisiensi modal sendiri dalam menghasilkan profit',
        en: 'ROE measures the efficiency of equity in generating profit',
        zh: 'ROE衡量股权产生利润的效率',
    },
    roaDescription: {
        id: 'ROA mengukur efisiensi total aset dalam menghasilkan profit',
        en: 'ROA measures the efficiency of total assets in generating profit',
        zh: 'ROA衡量总资产产生利润的效率',
    }
};