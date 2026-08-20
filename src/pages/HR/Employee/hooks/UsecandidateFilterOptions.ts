import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { hrGroupService, hrCompanyService, hrDepartmentService, hrJobTitleService } from '../services/hrService';
import type { Group, Company, Department, JobTitle } from '../types/hr';

// Powers the dropdown options in FilterSection — Company -> Department -> Job Title
// cascade the same way CreateCandidateForm's own dropdowns do.
export function useCandidateFilterOptions(companyId: string, departmentId: string) {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loadingGroup, setLoadingGroup] = useState(true);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompany, setLoadingCompany] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDept, setLoadingDept] = useState(false);
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
    const [loadingJob, setLoadingJob] = useState(false);

    useEffect(() => {
        hrGroupService
            .getList({ page: 1, limit: 100, search: '', sort_by: 'created_at', sort_order: 'desc' })
            .then((result) => setGroups(result.data || []))
            .catch(() => toast.error('Failed to load groups'))
            .finally(() => setLoadingGroup(false));
    }, []);

    useEffect(() => {
        hrCompanyService
            .getList(100)
            .then((result) => setCompanies(result.data || []))
            .catch(() => toast.error('Failed to load companies'))
            .finally(() => setLoadingCompany(false));
    }, []);

    useEffect(() => {
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
    }, [companyId]);

    useEffect(() => {
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
    }, [departmentId]);

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
