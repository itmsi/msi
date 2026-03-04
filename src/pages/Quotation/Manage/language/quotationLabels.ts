import type { TranslationMap } from '@/components/lang/useLanguage';

export const quotationLabels: TranslationMap = {
    // Page header
    createQuotation: {
        id: 'Buat Quotation',
        en: 'Create Quotation',
        zh: '创建报价单',
    },
    editQuotation: {
        id: 'Edit Quotation',
        en: 'Edit Quotation',
        zh: '编辑报价单',
    },
    loadingQuotationData: {
        id: 'Memuat data quotation...',
        en: 'Loading quotation data...',
        zh: '正在加载报价单数据...',
    },

    // Section: Quotation Detail
    quotationDetail: {
        id: 'Detail Quotation',
        en: 'Quotation Detail',
        zh: '报价单详情',
    },
    quotationNumber: {
        id: 'Nomor Quotation',
        en: 'Quotation Number',
        zh: '报价单编号',
    },
    quotationDate: {
        id: 'Tanggal Quotation',
        en: 'Quotation Date',
        zh: '报价日期',
    },
    quotationValidUntil: {
        id: 'Berlaku Sampai',
        en: 'Quotation Valid Until',
        zh: '报价有效期至',
    },
    quotationFor: {
        id: 'Quotation Untuk',
        en: 'Quotation For',
        zh: '报价对象',
    },
    customer: {
        id: 'Customer',
        en: 'Customer',
        zh: '客户',
    },
    leasing: {
        id: 'Leasing',
        en: 'Leasing',
        zh: '租赁',
    },

    // Select fields
    selectCustomer: {
        id: 'Pilih Customer',
        en: 'Select Customer',
        zh: '选择客户',
    },
    selectSales: {
        id: 'Pilih Sales',
        en: 'Select Sales',
        zh: '选择销售人员',
    },
    selectIsland: {
        id: 'Pilih Pulau',
        en: 'Select Island',
        zh: '选择岛屿',
    },
    star: {
        id: 'Star',
        en: 'Star',
        zh: '星级',
    },

    // Section: Beneficiary Details
    beneficiaryDetails: {
        id: 'Detail Penerima',
        en: 'Beneficiary Details',
        zh: '收款信息',
    },
    selectBank: {
        id: 'Pilih Bank',
        en: 'Select Bank',
        zh: '选择银行',
    },
    beneficiaryName: {
        id: 'Nama Penerima',
        en: 'Beneficiary Name',
        zh: '收款人姓名',
    },
    beneficiaryBank: {
        id: 'Bank Penerima',
        en: 'Beneficiary Bank',
        zh: '收款银行',
    },
    beneficiaryAccount: {
        id: 'Rekening Penerima',
        en: 'Beneficiary Account',
        zh: '收款账号',
    },

    // Section: Products
    products: {
        id: 'Produk',
        en: 'Products',
        zh: '产品',
    },
    selectIslandFirst: {
        id: 'Silahkan pilih pulau terlebih dahulu untuk menambahkan produk',
        en: 'Please select an island first to add products',
        zh: '请先选择岛屿以添加产品',
    },
    addProduct: {
        id: 'Tambah Produk',
        en: 'Add Product',
        zh: '添加产品',
    },
    noProductsYet: {
        id: 'Belum ada produk ditambahkan',
        en: 'No products added yet',
        zh: '尚未添加产品',
    },

    // Section: Terms & Conditions
    termsConditions: {
        id: 'Syarat & Ketentuan',
        en: 'Terms & Conditions',
        zh: '条款与条件',
    },
    termCondition: {
        id: 'Syarat Ketentuan',
        en: 'Term Condition',
        zh: '条款条件',
    },
    termContent: {
        id: 'Isi Ketentuan',
        en: 'Term Content',
        zh: '条款内容',
    },
    termContentLoading: {
        id: 'Isi Ketentuan (Memuat...)',
        en: 'Term Content (Loading...)',
        zh: '条款内容 (加载中...)',
    },

    // Section: Totals
    subtotal: {
        id: 'Subtotal',
        en: 'Subtotal',
        zh: '小计',
    },
    ppn: {
        id: 'PPN',
        en: 'PPN',
        zh: 'PPN (增值税)',
    },
    deliveryFee: {
        id: 'Biaya Pengiriman',
        en: 'Delivery Fee',
        zh: '运费',
    },
    otherFee: {
        id: 'Biaya Lainnya',
        en: 'Other Fee',
        zh: '其他费用',
    },
    adjustmentType: {
        id: 'Tipe Penyesuaian',
        en: 'Adjustment Type',
        zh: '调整类型',
    },
    noAdjustment: {
        id: 'Tanpa Penyesuaian',
        en: 'No Adjustment',
        zh: '无调整',
    },
    plus: {
        id: 'Tambah (+)',
        en: 'Plus (+)',
        zh: '加 (+)',
    },
    minus: {
        id: 'Kurang (-)',
        en: 'Minus (-)',
        zh: '减 (-)',
    },
    grandTotalBefore: {
        id: 'Grand Total (Sebelum Penyesuaian)',
        en: 'Grand Total (Before Adjustment)',
        zh: '总计 (调整前)',
    },
    grandTotal: {
        id: 'Grand Total',
        en: 'Grand Total',
        zh: '总计',
    },
    downPayment: {
        id: 'Uang Muka',
        en: 'Down Payment',
        zh: '首付款',
    },
    remainingPayment: {
        id: 'Sisa Pembayaran',
        en: 'Remaining Payment',
        zh: '余额',
    },

    // Section: Shipping T&C
    shippingTC: {
        id: 'Pengiriman S&K',
        en: 'Shipping T&C',
        zh: '运输条款',
    },
    shippingTerm: {
        id: 'Syarat Pengiriman',
        en: 'Shipping Term',
        zh: '运输条件',
    },
    franco: {
        id: 'Franco',
        en: 'Franco',
        zh: '到付方式',
    },
    leadTime: {
        id: 'Waktu Pengerjaan',
        en: 'Lead Time',
        zh: '交货时间',
    },

    // Section: Additional Pages
    additionalPages: {
        id: 'Halaman Tambahan',
        en: 'Additional Pages',
        zh: '附加页面',
    },
    includeAftersalesPage: {
        id: 'Sertakan Halaman Aftersales',
        en: 'Include Aftersales Page',
        zh: '包含售后页面',
    },
    includeMsfPage: {
        id: 'Sertakan Halaman MSF',
        en: 'Include MSF Page',
        zh: '包含MSF页面',
    },

    // Actions
    cancel: {
        id: 'Batal',
        en: 'Cancel',
        zh: '取消',
    },
    submitQuotation: {
        id: 'Submit Quotation',
        en: 'Submit Quotation',
        zh: '提交报价单',
    },
    submitting: {
        id: 'Mengirim...',
        en: 'Submitting...',
        zh: '提交中...',
    },
    updateQuotation: {
        id: 'Update Quotation',
        en: 'Update Quotation',
        zh: '更新报价单',
    },
    updating: {
        id: 'Mengupdate...',
        en: 'Updating...',
        zh: '更新中...',
    },

    // Quick Select
    quickSelect: {
        id: 'Pilih Cepat:',
        en: 'Quick Select:',
        zh: '快速选择:',
    },
    plus1Day: {
        id: '+1 Hari',
        en: '+1 Day',
        zh: '+1天',
    },
    plus7Days: {
        id: '+7 Hari',
        en: '+7 Days',
        zh: '+7天',
    },
    plus14Days: {
        id: '+14 Hari',
        en: '+14 Days',
        zh: '+14天',
    },
    plus30Days: {
        id: '+30 Hari',
        en: '+30 Days',
        zh: '+30天',
    },

    // Placeholders
    placeholderStar: {
        id: 'Masukkan nilai star contoh 0',
        en: 'Enter star value example 0',
        zh: '输入星级值 例如 0',
    },
    placeholderShippingTerm: {
        id: 'Masukkan syarat pengiriman...',
        en: 'Enter shipping term...',
        zh: '输入运输条件...',
    },
    placeholderFranco: {
        id: 'Masukkan franco...',
        en: 'Enter franco...',
        zh: '输入到付方式...',
    },
    placeholderLeadTime: {
        id: 'Masukkan waktu pengerjaan...',
        en: 'Enter lead time...',
        zh: '输入交货时间...',
    },
    autoFilledWhenBankSelected: {
        id: 'Otomatis terisi saat bank dipilih',
        en: 'Auto filled when bank selected',
        zh: '选择银行后自动填充',
    },
    selectTermCondition: {
        id: 'Pilih syarat ketentuan atau mulai mengetik...',
        en: 'Select a term condition or start typing...',
        zh: '选择条款条件或开始输入...',
    },
    selected: {
        id: 'Dipilih',
        en: 'Selected',
        zh: '已选择',
    },

    // ProductDetailOffcanvas labels
    close: {
        id: 'Tutup',
        en: 'Close',
        zh: '关闭',
    },
    productDataNotFound: {
        id: 'Data produk tidak ditemukan',
        en: 'Product data not found',
        zh: '未找到产品数据',
    },
    specifications: {
        id: 'Spesifikasi',
        en: 'Specifications',
        zh: '规格',
    },
    accessories: {
        id: 'Accessories',
        en: 'Accessories',
        zh: '配件',
    },
    clickToEnlarge: {
        id: 'Klik untuk memperbesar',
        en: 'Click to enlarge',
        zh: '点击放大',
    },
    imageNotValid: {
        id: 'Gambar tidak valid',
        en: 'Image not valid',
        zh: '图片无效',
    },
    noImage: {
        id: 'Tidak ada gambar',
        en: 'No image',
        zh: '无图片',
    },
    basicInformation: {
        id: 'Informasi Dasar',
        en: 'Basic Information',
        zh: '基本信息',
    },
    productName: {
        id: 'Nama Produk',
        en: 'Product Name',
        zh: '产品名称',
    },
    uniqueCode: {
        id: 'Kode Unique',
        en: 'Unique Code',
        zh: '唯一编码',
    },
    segment: {
        id: 'Segment',
        en: 'Segment',
        zh: '细分市场',
    },
    msiModel: {
        id: 'MSI Model',
        en: 'MSI Model',
        zh: 'MSI 型号',
    },
    msiProduct: {
        id: 'MSI Product',
        en: 'MSI Product',
        zh: 'MSI 产品',
    },
    wheelNo: {
        id: 'Wheel No',
        en: 'Wheel No',
        zh: '轮数',
    },
    volume: {
        id: 'Volume',
        en: 'Volume',
        zh: '体积',
    },
    horsePower: {
        id: 'Horse Power',
        en: 'Horse Power',
        zh: '马力',
    },
    priceInformation: {
        id: 'Informasi Harga',
        en: 'Price Information',
        zh: '价格信息',
    },
    marketPrice: {
        id: 'Harga Pasar',
        en: 'Market Price',
        zh: '市场价格',
    },
    priceStar1: {
        id: 'Harga Star 1',
        en: 'Star 1 Price',
        zh: '一星级价格',
    },
    priceStar2: {
        id: 'Harga Star 2',
        en: 'Star 2 Price',
        zh: '二星级价格',
    },
    priceStar3: {
        id: 'Harga Star 3',
        en: 'Star 3 Price',
        zh: '三星级价格',
    },
    priceStar4: {
        id: 'Harga Star 4',
        en: 'Star 4 Price',
        zh: '四星级价格',
    },
    priceStar5: {
        id: 'Harga Star 5',
        en: 'Star 5 Price',
        zh: '五星级价格',
    },
    selectAccessoryToAdd: {
        id: 'Select accessory to add...',
        en: 'Select accessory to add...',
        zh: '选择要添加的配件...',
    },
    addAccessory: {
        id: 'Add Accessory',
        en: 'Add Accessory',
        zh: '添加配件',
    },
    noAccessoriesAdded: {
        id: 'No accessories added yet',
        en: 'No accessories added yet',
        zh: '尚未添加配件',
    },
    accessoryName: {
        id: 'Accessory Name',
        en: 'Accessory Name',
        zh: '配件名称',
    },
    quantity: {
        id: 'Quantity',
        en: 'Quantity',
        zh: '数量',
    },
    delete: {
        id: 'Delete',
        en: 'Delete',
        zh: '删除',
    },
    enterProductName: {
        id: 'Masukkan nama produk',
        en: 'Enter product name',
        zh: '输入产品名称',
    },
    enterUniqueCode: {
        id: 'Masukkan kode unique',
        en: 'Enter unique code',
        zh: '输入唯一编码',
    },
    enterSegment: {
        id: 'Masukkan segment',
        en: 'Enter segment',
        zh: '输入细分市场',
    },
    enterMsiModel: {
        id: 'Masukkan MSI model',
        en: 'Enter MSI model',
        zh: '输入 MSI 型号',
    },
    enterMsiProduct: {
        id: 'Masukkan MSI product',
        en: 'Enter MSI product',
        zh: '输入 MSI 产品',
    },
    enterWheelNo: {
        id: 'Masukkan wheel no',
        en: 'Enter wheel no',
        zh: '输入轮数',
    },
    enterVolume: {
        id: 'Masukkan volume',
        en: 'Enter volume',
        zh: '输入体积',
    },
    enterHorsePower: {
        id: 'Masukkan horse power',
        en: 'Enter horse power',
        zh: '输入马力',
    },
    enterMarketPrice: {
        id: 'Masukkan harga pasar',
        en: 'Enter market price',
        zh: '输入市场价格',
    },
    pricePlaceholderStar1: {
        id: 'Harga star 1',
        en: 'Star 1 price',
        zh: '一星级价格',
    },
    pricePlaceholderStar2: {
        id: 'Harga star 2',
        en: 'Star 2 price',
        zh: '二星级价格',
    },
    pricePlaceholderStar3: {
        id: 'Harga star 3',
        en: 'Star 3 price',
        zh: '三星级价格',
    },
    pricePlaceholderStar4: {
        id: 'Harga star 4',
        en: 'Star 4 price',
        zh: '四星级价格',
    },
    pricePlaceholderStar5: {
        id: 'Harga star 5',
        en: 'Star 5 price',
        zh: '五星级价格',
    },
    
    // Additional ProductDetailOffcanvas labels
    pleaseSelectAccessory: {
        id: 'Silakan pilih aksesoris',
        en: 'Please select an accessory',
        zh: '请选择配件',
    },
    accessoryAlreadyAdded: {
        id: 'Aksesoris ini sudah ditambahkan',
        en: 'This accessory is already added',
        zh: '此配件已添加',
    },
    accessoryAddedSuccess: {
        id: 'Aksesoris berhasil ditambahkan',
        en: 'Accessory added successfully',
        zh: '配件添加成功',
    },
    accessoryRemovedSuccess: {
        id: 'Aksesoris berhasil dihapus',
        en: 'Accessory removed successfully',
        zh: '配件删除成功',
    },
    noAccessoriesFound: {
        id: 'Tidak ada aksesoris ditemukan',
        en: 'No accessories found',
        zh: '未找到配件',
    },
    loadingAccessories: {
        id: 'Memuat aksesoris...',
        en: 'Loading accessories...',
        zh: '加载配件中...',
    },
    enter: {
        id: 'Masukkan',
        en: 'Enter',
        zh: '输入',
    },
};
