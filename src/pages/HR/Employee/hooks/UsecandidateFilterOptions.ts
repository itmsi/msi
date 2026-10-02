import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { hrGroupService, hrCompanyService, hrDepartmentService, hrJobTitleService } from '../services/hrService';
import type { Group, Company, Department, JobTitle } from '../types/hr';

// Powers the dropdown options in FilterSection — Company -> Department -> Job Title
// cascade the same way CreateCandidateForm's own dropdowns do.
// `enabled` holds the requests back until the advanced filter panel is opened,
// so a page load that never touches the panel stays free of master data calls.
export function useCandidateFilterOptions(companyId: string, departmentId: string, enabled: boolean = true) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loadingGroup, setLoadingGroup] = useState(true);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDept, setLoadingDept] = useState(false);
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [loadingJob, setLoadingJob] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        hrGroupService
            .getList({ page: 1, limit: 100, search: '', sort_by: 'created_at', sort_order: 'desc' })
            .then((result) => setGroups(result.data || []))
            .catch(() => toast.error('Failed to load groups'))
            .finally(() => setLoadingGroup(false));
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;

        hrCompanyService
            .getList(100)
            .then((result) => setCompanies(result.data || []))
            .catch(() => toast.error('Failed to load companies'))
            .finally(() => setLoadingCompany(false));
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return;
        if (!companyId) {
            setDepartments([]);
            return;
        }
        setLoadingDept(true);
        hrDepartmentService
            .getList(companyId, 100)
            .then((result) => setDepartments(result.data || []))
            .catch(() => setDepartments([]))
            .finally(() => setLoadingDept(false));
    }, [companyId, enabled]);

    useEffect(() => {
        if (!enabled) return;
        if (!departmentId) {
            setJobTitles([]);
            return;
        }
        setLoadingJob(true);
        hrJobTitleService
            .getList(departmentId, 100)
            .then((result) => setJobTitles(result.data || []))
            .catch(() => setJobTitles([]))
            .finally(() => setLoadingJob(false));
    }, [departmentId, enabled]);

    return {
        groups,
        loadingGroup,
        companies,
        loadingCompany,
        departments,
        loadingDept,
        jobTitles,
        loadingJob,
    };
}
