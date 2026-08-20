import type { Candidate } from './types/hr';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
import DatePicker from '@/components/form/date-picker';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import PageMeta from '@/components/common/PageMeta';
import PageHeader from '@/components/common/PageHeader';
import useGoBack from '@/hooks/useGoBack';
import FormSection from './components/FormSection';
import CascadeFieldGroup from './components/CascadeFieldGroup';
import FieldError from './components/FieldError';
import { useCandidateForm } from './hooks/UsecandidateForm';
import { PermissionGate } from '@/components/common/PermissionComponents';

interface CreateCandidateFormProps {
    initialData?: Candidate | null;
    onSave: (data?: Candidate) => void;
    onCancel: () => void;
}

const CreateCandidateForm = ({ initialData, onSave, onCancel }: CreateCandidateFormProps) => {
    const goBack = useGoBack();

    const {
        isEdit,
        validated,
        submitting,
        errors,
        form,
        groups,
        loadingGroup,
        selectedGroupName,
        companies,
        loadingCompany,
        selectedCompanyName,
        departments,
        loadingDept,
        selectedDeptName,
        jobTitles,
        loadingJob,
        selectedTitleName,
        handleChange,
        handlePhoneChange,
        handlePhotoChange,
        handleResumeChange,
        handleGenderChange,
        handleMaritalStatusChange,
        handleGroupChange,
        handleCompanyChange,
        handleDepartmentChange,
        handleTitleChange,
        handleDateBirthChange,
        handlePtkDateChange,
        handleOfferingLetterChange,
        handleSubmit,
    } = useCandidateForm({ initialData, onSave });

    return (<>
        <PageMeta
            title="Create Candidate - HR"
            description="Create new candidate entry"
            image="/motor-sights-international.png"
        />

        <div className="mx-auto">
            {/* Header */}
            <PageHeader
                title={`${!isEdit ? 'Create Candidate' : 'Edit Candidate'}`}
                backPath={() => goBack('/hr/candidates')}
            />

            <form
                noValidate
                onSubmit={handleSubmit}
                className={`space-y-10 ${validated ? 'was-validated' : ''
                    }`}
            >

                <div className="space-y-10 p-6 bg-white rounded-xl border border-gray-200">
                    {/* Informasi Pribadi */}
                    <FormSection title="Informasi Pribadi">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Name <span className="text-error-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="candidate_name"
                                    value={form.candidate_name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="required-field"
                                    error={!!errors.candidate_name}
                                    hint={errors.candidate_name}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Email <span className="text-error-500">*</span>
                                </label>
                                <Input
                                    type="email"
                                    name="candidate_email"
                                    value={form.candidate_email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className="required-field"
                                    error={!!errors.candidate_email}
                                    hint={errors.candidate_email}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Phone Number <span className="text-error-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="candidate_phone"
                                    value={form.candidate_phone}
                                    onChange={handlePhoneChange}
                                    maxLength={13}
                                    placeholder="08xxxxxxxxxx"
                                    className="required-field"
                                    error={!!errors.candidate_phone}
                                    hint={errors.candidate_phone}
                                />
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">Date of Birth</label>
                                <DatePicker
                                    id="candidate_date_birth"
                                    placeholder="Select date of birth"
                                    defaultDate={form.candidate_date_birth || undefined}
                                    isStatic={true}
                                    dateFormat="d M Y"
                                    onChange={handleDateBirthChange}
                                />
                            </div>

                            {/* Religion */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">Religion</label>
                                <Input
                                    type="text"
                                    name="candidate_religion"
                                    value={form.candidate_religion}
                                    onChange={handleChange}
                                    placeholder="Enter religion"
                                />
                            </div>
                        </div>

                        {/* Short fields — always 4 across */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">Gender</label>
                                <CustomSelect
                                    name="candidate_gender"
                                    value={form.candidate_gender ? { value: form.candidate_gender, label: form.candidate_gender } : null}
                                    onChange={handleGenderChange}
                                    options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
                                    placeholder="-- Choose --"
                                    isSearchable={false}
                                    isClearable
                                />
                            </div>

                            {/* Marital Status */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">Marital Status</label>
                                <CustomSelect
                                    name="candidate_marital_status"
                                    value={form.candidate_marital_status ? { value: form.candidate_marital_status, label: form.candidate_marital_status } : null}
                                    onChange={handleMaritalStatusChange}
                                    options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }]}
                                    placeholder="-- Choose --"
                                    isSearchable={false}
                                    isClearable
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Age <span className="text-error-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    name="candidate_age"
                                    value={form.candidate_age}
                                    onChange={handleChange}
                                    placeholder="Enter age"
                                    className="required-field"
                                    error={!!errors.candidate_age}
                                    hint={errors.candidate_age}
                                />
                            </div>

                            {/* Nationality */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">Nationality</label>
                                <Input
                                    type="text"
                                    name="candidate_nationality"
                                    value={form.candidate_nationality}
                                    onChange={handleChange}
                                    placeholder="Enter nationality"
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Informasi Pekerjaan */}
                    <FormSection title="Informasi Pekerjaan">
                        <CascadeFieldGroup>
                            {/* Group */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Group <span className="text-error-500">*</span>
                                </label>
                                <CustomSelect
                                    name="group_id"
                                    value={selectedGroupName ? { value: form.group_id, label: selectedGroupName } : null}
                                    onChange={handleGroupChange}
                                    options={[...groups].sort((a, b) => a.group_name.localeCompare(b.group_name)).map((g) => ({ value: g.group_id, label: g.group_name }))}
                                    placeholder={loadingGroup ? 'Loading groups...' : '-- Choose Group --'}
                                    disabled={loadingGroup}
                                    error={errors.group_id}
                                    className='bg-white rounded-xl'
                                    isSearchable
                                    isClearable
                                />
                                <FieldError message={errors.group_id} />
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Company <span className="text-error-500">*</span>
                                </label>
                                <CustomSelect
                                    name="candidate_company"
                                    value={selectedCompanyName ? { value: selectedCompanyName, label: selectedCompanyName } : null}
                                    onChange={handleCompanyChange}
                                    options={[...companies].sort((a, b) => a.company_name.localeCompare(b.company_name)).map((c) => ({ value: c.company_name, label: c.company_name }))}
                                    placeholder={!selectedGroupName ? 'Select group first' : loadingCompany ? 'Loading companies...' : '-- Choose Company --'}
                                    disabled={loadingCompany || !selectedGroupName}
                                    error={errors.company_id}
                                    className='bg-white rounded-xl'
                                    isSearchable
                                    isClearable
                                />
                                <FieldError message={errors.company_id} />
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Department <span className="text-error-500">*</span>
                                </label>
                                <CustomSelect
                                    name="candidate_department"
                                    value={selectedDeptName ? { value: selectedDeptName, label: selectedDeptName } : null}
                                    onChange={handleDepartmentChange}
                                    options={[...departments].sort((a, b) => (a.department_name || '').localeCompare(b.department_name || '')).map((d) => ({ value: d.department_name, label: d.department_name }))}
                                    placeholder={!selectedCompanyName ? 'Select a company first' : loadingDept ? 'Loading departments...' : '-- Choose Department --'}
                                    disabled={loadingDept || !selectedCompanyName}
                                    error={errors.department_id}
                                    className='bg-white rounded-xl'
                                    isSearchable
                                    isClearable
                                />
                                <FieldError message={errors.department_id} />
                            </div>

                            {/* Position / Job Title */}
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">
                                    Position <span className="text-error-500">*</span>
                                </label>
                                <CustomSelect
                                    name="candidate_title"
                                    value={selectedTitleName ? { value: selectedTitleName, label: selectedTitleName } : null}
                                    onChange={handleTitleChange}
                                    options={[...jobTitles].sort((a, b) => (a.title_name || '').localeCompare(b.title_name || '')).map((j) => ({ value: j.title_name, label: j.title_name }))}
                                    placeholder={!selectedDeptName ? 'Select a department first' : loadingJob ? 'Loading positions...' : '-- Choose Position --'}
                                    disabled={loadingJob || !selectedDeptName}
                                    error={errors.title_id}
                                    className='bg-white rounded-xl'
                                    isSearchable
                                    isClearable
                                />
                                <FieldError message={errors.title_id} />
                            </div>
                        </CascadeFieldGroup>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">PTK Date</label>
                                <DatePicker
                                    id="ptk_date"
                                    placeholder="Select PTK date"
                                    defaultDate={form.ptk_date || undefined}
                                    isStatic={true}
                                    dateFormat="d M Y"
                                    onChange={handlePtkDateChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">Offering Letter Date</label>
                                <DatePicker
                                    id="offering_letter"
                                    placeholder="Select offering letter date"
                                    defaultDate={form.offering_letter || undefined}
                                    isStatic={true}
                                    dateFormat="d M Y"
                                    onChange={handleOfferingLetterChange}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Alamat */}
                    <FormSection title="Alamat">
                        <div>
                            <label className="block text-sm font-primary text-gray-700 mb-1">Address</label>
                            <TextArea
                                name="candidate_address"
                                value={form.candidate_address}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Enter address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">City</label>
                                <Input
                                    type="text"
                                    name="candidate_city"
                                    value={form.candidate_city}
                                    onChange={handleChange}
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">State</label>
                                <Input
                                    type="text"
                                    name="candidate_state"
                                    value={form.candidate_state}
                                    onChange={handleChange}
                                    placeholder="State"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-primary text-gray-700 mb-1">Country</label>
                                <Input
                                    type="text"
                                    name="candidate_country"
                                    value={form.candidate_country}
                                    onChange={handleChange}
                                    placeholder="Country"
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Catatan & Dokumen */}
                    <FormSection title="Catatan & Dokumen">
                        <div>
                            <label className="block text-sm font-primary text-gray-700 mb-1">Remark</label>
                            <TextArea
                                name="remark"
                                value={form.remark}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Enter remark"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Photo Upload */}
                            <FileUpload
                                id="candidate_foto"
                                name="candidate_foto"
                                label="Photo"
                                accept="image/jpeg,image/jpg,image/png"
                                icon="image"
                                acceptedFormats={['jpg', 'jpeg', 'png']}
                                maxSize={2}
                                currentFile={form.candidate_foto instanceof File ? form.candidate_foto : null}
                                existingImageUrl={
                                    typeof form.candidate_foto === 'string' && form.candidate_foto.startsWith('http')
                                        ? `${form.candidate_foto}/download`
                                        : null
                                }
                                existingFiles={
                                    initialData?.candidate_foto_path
                                        ? [{ file_id: 'candidate_foto', file_url: initialData.candidate_foto_path, file_name: initialData.candidate_foto_path.split('/').pop() }]
                                        : undefined
                                }
                                onFileChange={handlePhotoChange}
                                hasDownloadButton
                                description="Format: JPG, JPEG, PNG - Max 2MB"
                            />

                            {/* Resume Upload */}
                            <FileUpload
                                id="candidate_resume"
                                name="candidate_resume"
                                label="Resume (PDF)"
                                accept=".pdf,application/pdf"
                                icon="upload"
                                acceptedFormats={['pdf']}
                                maxSize={2}
                                currentFile={form.candidate_resume instanceof File ? form.candidate_resume : null}
                                existingImageUrl={
                                    typeof form.candidate_resume === 'string' && form.candidate_resume.startsWith('http')
                                        ? `${form.candidate_resume}/download`
                                        : null
                                }
                                existingFiles={
                                    initialData?.candidate_resume_path
                                        ? [{ file_id: 'candidate_resume', file_url: initialData.candidate_resume_path, file_name: initialData.candidate_resume_path.split('/').pop() }]
                                        : undefined
                                }
                                onFileChange={handleResumeChange}
                                hasDownloadButton
                                description="Format: PDF - Max 2MB"
                            />
                        </div>
                    </FormSection>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={onCancel}
                        className="px-6 rounded-full"
                    >
                        Cancel
                    </Button>

                    <PermissionGate permission={["create", "update"]}>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="px-6 flex items-center gap-2 rounded-full"
                        >
                            {submitting ? 'Saving...' : isEdit ? 'Update Candidate' : 'Create Candidate'}
                        </Button>
                    </PermissionGate>
                </div>

            </form>
        </div>
    </>);
};

export default CreateCandidateForm;
