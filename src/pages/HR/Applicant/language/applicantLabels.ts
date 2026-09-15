import type { TranslationMap } from '@/components/lang/useLanguage';

export const applicantLabels: TranslationMap = {
    // Page header
    applicantFormDetail: {
        id: 'Detail Formulir Pelamar',
        en: 'Applicant Form Detail',
        zh: '申请表详情',
    },
    editApplicantForm: {
        id: 'Edit Formulir Pelamar',
        en: 'Edit Applicant Form',
        zh: '编辑申请表',
    },
    loadingApplicantForm: {
        id: 'Memuat formulir pelamar...',
        en: 'Loading applicant form...',
        zh: '正在加载申请表...',
    },
    applicantFormNotFound: {
        id: 'Formulir pelamar tidak ditemukan',
        en: 'Applicant form not found',
        zh: '未找到申请表',
    },
    backToList: {
        id: 'Kembali ke List',
        en: 'Back to List',
        zh: '返回列表',
    },
    formNotCompletedTitle: {
        id: 'Formulir Belum Selesai',
        en: 'Form Not Completed',
        zh: '表单未完成',
    },
    formNotCompletedDescription: {
        id: 'Pelamar belum menyelesaikan pengisian formulir ini.',
        en: 'The applicant has not completed this form yet.',
        zh: '申请人尚未完成此表单。',
    },

    // Section: Form Information
    formInformation: {
        id: 'Informasi Formulir',
        en: 'Form Information',
        zh: '表单信息',
    },
    statusCompleted: {
        id: 'Selesai',
        en: 'Completed',
        zh: '已完成',
    },
    statusPending: {
        id: 'Menunggu Pengisian',
        en: 'Pending',
        zh: '待填写',
    },
    statusExpired: {
        id: 'Kadaluarsa',
        en: 'Expired',
        zh: '已过期',
    },
    invitedAt: {
        id: 'Tanggal Diundang',
        en: 'Invited At',
        zh: '邀请时间',
    },
    invitedBy: {
        id: 'Diundang Oleh',
        en: 'Invited By',
        zh: '邀请人',
    },
    linkValidUntil: {
        id: 'Link Berlaku Sampai',
        en: 'Link Valid Until',
        zh: '链接有效期至',
    },
    completedAt: {
        id: 'Tanggal Selesai',
        en: 'Completed At',
        zh: '完成时间',
    },

    // Section: Personal Information
    personalInformation: {
        id: 'Data Pribadi',
        en: 'Personal Information',
        zh: '个人信息',
    },
    fullName: {
        id: 'Nama Lengkap',
        en: 'Full Name',
        zh: '全名',
    },
    addressIdCard: {
        id: 'Alamat Sesuai KTP',
        en: 'Address (as per ID Card)',
        zh: '身份证地址',
    },
    nickname: {
        id: 'Nama Panggilan',
        en: 'Nickname',
        zh: '昵称',
    },
    presentAddress: {
        id: 'Alamat Domisili',
        en: 'Present Address',
        zh: '现居地址',
    },
    mobileNumber: {
        id: 'No. HP',
        en: 'Mobile Number',
        zh: '手机号码',
    },
    city: {
        id: 'Kota',
        en: 'City',
        zh: '城市',
    },
    emergencyContact: {
        id: 'Kontak Darurat (Nama, Hubungan, No. HP)',
        en: 'Emergency Contact (Name, Relationship, Number)',
        zh: '紧急联系人（姓名、关系、电话）',
    },
    placeDateOfBirth: {
        id: 'Tempat, Tanggal Lahir',
        en: 'Place, Date of Birth',
        zh: '出生地点及日期',
    },
    email: {
        id: 'Email',
        en: 'Email',
        zh: '电子邮箱',
    },
    bloodType: {
        id: 'Golongan Darah',
        en: 'Blood Type',
        zh: '血型',
    },
    idNumber: {
        id: 'No. KTP',
        en: 'ID Number (KTP)',
        zh: '身份证号码',
    },
    taxIdNumber: {
        id: 'NPWP',
        en: 'Tax ID Number (NPWP)',
        zh: '税号 (NPWP)',
    },
    positionAppliedFor: {
        id: 'Posisi Dilamar',
        en: 'Position Applied For',
        zh: '应聘职位',
    },
    availableToWork: {
        id: 'Tersedia Bekerja',
        en: 'Available to Work',
        zh: '可入职日期',
    },
    maritalStatus: {
        id: 'Status Pernikahan',
        en: 'Marital Status',
        zh: '婚姻状况',
    },
    religion: {
        id: 'Agama',
        en: 'Religion',
        zh: '宗教',
    },
    heightWeight: {
        id: 'Tinggi / Berat Badan',
        en: 'Height / Weight',
        zh: '身高 / 体重',
    },
    tshirtSize: {
        id: 'Ukuran Kaos',
        en: 'T-Shirt Size',
        zh: 'T恤尺码',
    },
    driverLicense: {
        id: 'SIM yang Dimiliki',
        en: "Driver's License",
        zh: '驾驶执照',
    },

    // Section: Formal Education
    formalEducation: {
        id: 'Pendidikan Formal',
        en: 'Formal Education',
        zh: '正规教育',
    },
    university: {
        id: 'Universitas',
        en: 'University',
        zh: '大学',
    },
    highSchool: {
        id: 'SMA/SMK',
        en: 'High School',
        zh: '高中',
    },
    juniorHighSchool: {
        id: 'SMP',
        en: 'Junior High School',
        zh: '初中',
    },
    elementarySchool: {
        id: 'SD',
        en: 'Elementary School',
        zh: '小学',
    },
    universityName: {
        id: 'Nama Universitas',
        en: 'University Name',
        zh: '大学名称',
    },
    highSchoolName: {
        id: 'Nama SMA/SMK',
        en: 'High School Name',
        zh: '高中名称',
    },
    juniorHighSchoolName: {
        id: 'Nama SMP',
        en: 'Junior High School Name',
        zh: '初中名称',
    },
    elementarySchoolName: {
        id: 'Nama SD',
        en: 'Elementary School Name',
        zh: '小学名称',
    },
    schoolName: {
        id: 'Nama Sekolah',
        en: 'School Name',
        zh: '学校名称',
    },
    location: {
        id: 'Lokasi',
        en: 'Location',
        zh: '地点',
    },
    degree: {
        id: 'Gelar / Lulusan',
        en: 'Degree',
        zh: '学历',
    },
    major: {
        id: 'Jurusan',
        en: 'Major',
        zh: '专业',
    },
    graduationYear: {
        id: 'Tahun Lulus',
        en: 'Graduation Year',
        zh: '毕业年份',
    },

    // Section: Informal Education
    informalEducation: {
        id: 'Pendidikan Non-Formal & Kualifikasi Khusus',
        en: 'Informal Education & Special Qualifications',
        zh: '非正规教育及特殊资质',
    },
    training: {
        id: 'Pelatihan',
        en: 'Training',
        zh: '培训',
    },
    typeOfTraining: {
        id: 'Jenis Pelatihan',
        en: 'Type of Training',
        zh: '培训类型',
    },
    institutionName: {
        id: 'Nama Lembaga',
        en: 'Institution Name',
        zh: '机构名称',
    },
    certification: {
        id: 'Sertifikasi',
        en: 'Certification',
        zh: '证书',
    },
    period: {
        id: 'Periode',
        en: 'Period',
        zh: '期间',
    },

    // Section: Family Background
    familyBackground: {
        id: 'Latar Belakang Keluarga',
        en: 'Family Background',
        zh: '家庭背景',
    },
    father: {
        id: 'Ayah',
        en: 'Father',
        zh: '父亲',
    },
    mother: {
        id: 'Ibu',
        en: 'Mother',
        zh: '母亲',
    },
    spouse: {
        id: 'Suami/Istri',
        en: 'Spouse',
        zh: '配偶',
    },
    firstChild: {
        id: 'Anak ke-1',
        en: '1st Child',
        zh: '第一个孩子',
    },
    secondChild: {
        id: 'Anak ke-2',
        en: '2nd Child',
        zh: '第二个孩子',
    },
    thirdChild: {
        id: 'Anak ke-3',
        en: '3rd Child',
        zh: '第三个孩子',
    },
    fourthChild: {
        id: 'Anak ke-4',
        en: '4th Child',
        zh: '第四个孩子',
    },
    fatherName: {
        id: 'Nama Ayah',
        en: "Father's Name",
        zh: '父亲姓名',
    },
    motherName: {
        id: 'Nama Ibu',
        en: "Mother's Name",
        zh: '母亲姓名',
    },
    spouseName: {
        id: 'Nama Suami/Istri',
        en: "Spouse's Name",
        zh: '配偶姓名',
    },
    firstChildName: {
        id: 'Nama Anak ke-1',
        en: "1st Child's Name",
        zh: '第一个孩子姓名',
    },
    secondChildName: {
        id: 'Nama Anak ke-2',
        en: "2nd Child's Name",
        zh: '第二个孩子姓名',
    },
    thirdChildName: {
        id: 'Nama Anak ke-3',
        en: "3rd Child's Name",
        zh: '第三个孩子姓名',
    },
    fourthChildName: {
        id: 'Nama Anak ke-4',
        en: "4th Child's Name",
        zh: '第四个孩子姓名',
    },
    familyMemberName: {
        id: 'Nama Anggota Keluarga',
        en: 'Family Member Name',
        zh: '家庭成员姓名',
    },
    age: {
        id: 'Usia',
        en: 'Age',
        zh: '年龄',
    },
    occupation: {
        id: 'Pekerjaan',
        en: 'Occupation',
        zh: '职业',
    },
    emergencyContactNumber: {
        id: 'No. Kontak Darurat',
        en: 'Emergency Contact Number',
        zh: '紧急联系电话',
    },

    // Section: Working Experience
    workingExperience: {
        id: 'Pengalaman Kerja',
        en: 'Working Experience',
        zh: '工作经历',
    },
    experience: {
        id: 'Pengalaman',
        en: 'Experience',
        zh: '经历',
    },
    companyName: {
        id: 'Nama Perusahaan',
        en: 'Company Name',
        zh: '公司名称',
    },
    startDate: {
        id: 'Mulai',
        en: 'Start Date',
        zh: '开始日期',
    },
    endDate: {
        id: 'Selesai',
        en: 'End Date',
        zh: '结束日期',
    },
    salary: {
        id: 'Gaji',
        en: 'Salary',
        zh: '薪资',
    },
    supervisorName: {
        id: 'Nama Atasan',
        en: 'Supervisor Name',
        zh: '主管姓名',
    },
    reasonForLeaving: {
        id: 'Alasan Keluar',
        en: 'Reason for Leaving',
        zh: '离职原因',
    },

    // Section: References
    references: {
        id: 'Referensi Perusahaan Sebelumnya',
        en: 'References from Previous Company',
        zh: '前公司推荐人',
    },
    reference: {
        id: 'Referensi',
        en: 'Reference',
        zh: '推荐人',
    },
    name: {
        id: 'Nama',
        en: 'Name',
        zh: '姓名',
    },
    positionCompany: {
        id: 'Jabatan / Perusahaan',
        en: 'Position / Company',
        zh: '职位 / 公司',
    },
    phoneNumber: {
        id: 'No. Telepon',
        en: 'Phone Number',
        zh: '电话号码',
    },

    // Section: Additional Questions
    additionalQuestions: {
        id: 'Pertanyaan Tambahan',
        en: 'Additional Questions',
        zh: '附加问题',
    },
    answer: {
        id: 'Jawaban',
        en: 'Answer',
        zh: '回答',
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
    savedAnswer: {
        id: 'Jawaban tersimpan',
        en: 'Saved answer',
        zh: '已保存的回答',
    },
    savedValue: {
        id: 'Nilai tersimpan',
        en: 'Saved value',
        zh: '已保存的值',
    },

    // Actions
    add: {
        id: 'Tambah',
        en: 'Add',
        zh: '添加',
    },
    remove: {
        id: 'Hapus',
        en: 'Remove',
        zh: '删除',
    },
    cancel: {
        id: 'Batal',
        en: 'Cancel',
        zh: '取消',
    },
    saveChanges: {
        id: 'Simpan Perubahan',
        en: 'Save Changes',
        zh: '保存更改',
    },
    saving: {
        id: 'Menyimpan',
        en: 'Saving',
        zh: '正在保存',
    },
    exportPdf: {
        id: 'Export PDF',
        en: 'Export PDF',
        zh: '导出 PDF',
    },
    exportingPdf: {
        id: 'Membuat PDF...',
        en: 'Generating PDF...',
        zh: '正在生成 PDF...',
    },

    // Validation & Toast Messages
    fullNameRequired: {
        id: 'Nama lengkap wajib diisi',
        en: 'Full name is required',
        zh: '全名为必填项',
    },
    emailInvalid: {
        id: 'Format email tidak valid',
        en: 'Invalid email format',
        zh: '邮箱格式无效',
    },
    completeRequiredFields: {
        id: 'Lengkapi field yang wajib diisi',
        en: 'Please complete the required fields',
        zh: '请填写必填字段',
    },
    loadApplicantFormFailed: {
        id: 'Gagal memuat formulir pelamar',
        en: 'Failed to load applicant form',
        zh: '加载申请表失败',
    },
    updateUnsuccessful: {
        id: 'Formulir pelamar tidak berhasil diperbarui',
        en: 'Applicant form was not updated',
        zh: '申请表未能更新',
    },
    updateSuccess: {
        id: 'Formulir pelamar berhasil diperbarui',
        en: 'Applicant form updated successfully',
        zh: '申请表更新成功',
    },
    exportPdfSuccess: {
        id: 'PDF formulir pelamar berhasil diunduh',
        en: 'Applicant form PDF downloaded successfully',
        zh: '申请表 PDF 下载成功',
    },
    exportPdfFailed: {
        id: 'Gagal membuat PDF formulir pelamar',
        en: 'Failed to generate applicant form PDF',
        zh: '生成申请表 PDF 失败',
    },
    updateFailed: {
        id: 'Gagal memperbarui formulir pelamar',
        en: 'Failed to update applicant form',
        zh: '更新申请表失败',
    },
};
