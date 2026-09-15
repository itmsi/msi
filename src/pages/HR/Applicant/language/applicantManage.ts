import { TranslationMap } from '@/components/lang/useLanguage';

export const applicantManage: TranslationMap = {
    // Header & Title
    applicantForms: {
        id: 'Formulir Pelamar',
        en: 'Applicant Forms',
        zh: '申请表'
    },
    applicantFormsDescription: {
        id: 'Pantau formulir pelamar yang masuk sebelum membuka detailnya',
        en: 'Monitor incoming applicant forms before viewing their details',
        zh: '在查看详情前监控收到的申请表'
    },
    inviteApplicant: {
        id: 'Undang Pelamar',
        en: 'Invite Applicant',
        zh: '邀请申请人'
    },

    // Search & Filters
    searchPlaceholder: {
        id: 'Cari nama, email, posisi, atau kota... (tekan Enter)',
        en: 'Search name, email, position, or city... (press Enter)',
        zh: '搜索姓名、邮箱、职位或城市...（按回车键）'
    },
    searchDefaultPlaceholder: {
        id: 'Cari... (tekan Enter)',
        en: 'Search... (press Enter)',
        zh: '搜索...（按回车键）'
    },
    filter: {
        id: 'Filter',
        en: 'Filter',
        zh: '筛选'
    },
    orderBy: {
        id: 'Urutkan',
        en: 'Sort by',
        zh: '排序方式'
    },
    newest: {
        id: 'Terbaru',
        en: 'Newest',
        zh: '最新'
    },
    oldest: {
        id: 'Terlama',
        en: 'Oldest',
        zh: '最早'
    },
    formStatus: {
        id: 'Status Formulir',
        en: 'Form Status',
        zh: '表单状态'
    },
    allStatus: {
        id: 'Semua Status',
        en: 'All Status',
        zh: '全部状态'
    },
    completed: {
        id: 'Selesai',
        en: 'Completed',
        zh: '已完成'
    },
    notCompleted: {
        id: 'Belum Selesai',
        en: 'Not Completed',
        zh: '未完成'
    },
    clearAll: {
        id: 'Hapus Semua',
        en: 'Clear All',
        zh: '清除全部'
    },

    // Status Values
    statusCompleted: {
        id: 'Selesai',
        en: 'Completed',
        zh: '已完成'
    },
    statusPending: {
        id: 'Menunggu Pengisian Formulir',
        en: 'Pending Form Completion',
        zh: '待填写表单'
    },
    statusExpired: {
        id: 'Kadaluarsa',
        en: 'Expired',
        zh: '已过期'
    },

    // Table Columns
    fullName: {
        id: 'Nama Lengkap',
        en: 'Full Name',
        zh: '姓名'
    },
    positionAppliedFor: {
        id: 'Posisi Dilamar',
        en: 'Position Applied For',
        zh: '应聘职位'
    },
    city: {
        id: 'Kota',
        en: 'City',
        zh: '城市'
    },
    availableToWork: {
        id: 'Tanggal Siap Bekerja',
        en: 'Available Start Date',
        zh: '可入职日期'
    },
    contact: {
        id: 'Kontak',
        en: 'Contact',
        zh: '联系方式'
    },
    invitedAt: {
        id: 'Tanggal Diundang',
        en: 'Invitation Date',
        zh: '邀请日期'
    },
    completedAt: {
        id: 'Tanggal Selesai',
        en: 'Completion Date',
        zh: '完成日期'
    },

    // Actions
    copyLink: {
        id: 'Salin Link',
        en: 'Copy Link',
        zh: '复制链接'
    },
    cancel: {
        id: 'Batal',
        en: 'Cancel',
        zh: '取消'
    },

    // Invite Applicant Modal
    inviteDescription: {
        id: 'Kirim undangan pengisian formulir ke pelamar',
        en: 'Send a form invitation to the applicant',
        zh: '向申请人发送表单填写邀请'
    },
    email: {
        id: 'Email',
        en: 'Email',
        zh: '电子邮箱'
    },
    mobileNumber: {
        id: 'No. HP',
        en: 'Mobile Number',
        zh: '手机号码'
    },
    fullNamePlaceholder: {
        id: 'Contoh: John Doe',
        en: 'e.g. John Doe',
        zh: '例如：John Doe'
    },
    emailPlaceholder: {
        id: 'Contoh: john.doe@example.com',
        en: 'e.g. john.doe@example.com',
        zh: '例如：john.doe@example.com'
    },
    mobileNumberPlaceholder: {
        id: 'Contoh: 081234567890',
        en: 'e.g. 081234567890',
        zh: '例如：081234567890'
    },
    sending: {
        id: 'Mengirim...',
        en: 'Sending...',
        zh: '正在发送...'
    },
    sendInvitation: {
        id: 'Kirim Undangan',
        en: 'Send Invitation',
        zh: '发送邀请'
    },

    // Validation Messages
    fullNameRequired: {
        id: 'Nama lengkap wajib diisi',
        en: 'Full name is required',
        zh: '姓名为必填项'
    },
    emailRequired: {
        id: 'Email wajib diisi',
        en: 'Email is required',
        zh: '邮箱为必填项'
    },
    emailInvalid: {
        id: 'Format email tidak valid',
        en: 'Invalid email format',
        zh: '邮箱格式无效'
    },
    mobileNumberRequired: {
        id: 'No. HP wajib diisi',
        en: 'Mobile number is required',
        zh: '手机号码为必填项'
    },

    // Toast Messages
    fetchFailed: {
        id: 'Gagal memuat data pelamar',
        en: 'Failed to fetch applicant data',
        zh: '获取申请人数据失败'
    },
    linkNotAvailable: {
        id: 'Link formulir tidak tersedia',
        en: 'Form link is not available',
        zh: '表单链接不可用'
    },
    linkCopied: {
        id: 'Link formulir disalin',
        en: 'Form link copied',
        zh: '表单链接已复制'
    },
    linkCopyFailed: {
        id: 'Gagal menyalin link formulir',
        en: 'Failed to copy form link',
        zh: '复制表单链接失败'
    },
    invitationUnsuccessful: {
        id: 'Undangan pelamar tidak berhasil dibuat',
        en: 'Failed to create applicant invitation',
        zh: '创建申请人邀请失败'
    },
    invitationSuccess: {
        id: 'Undangan pelamar berhasil dibuat',
        en: 'Applicant invitation created successfully',
        zh: '申请人邀请创建成功'
    },
    invitationFailed: {
        id: 'Gagal membuat undangan pelamar',
        en: 'Failed to create applicant invitation',
        zh: '创建申请人邀请失败'
    }
};
