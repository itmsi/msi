import { useCallback, useEffect, useState } from 'react';
import type { Candidate, Company, Department, JobTitle, Group } from '../types/hr';
import {
  candidateService, hrCompanyService, hrDepartmentService, hrJobTitleService, hrGroupService,
} from '../services/hrService';

export function useCandidate() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const result = await candidateService.getList();
      setCandidates(result.data || []);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);

  const refresh = useCallback(() => { fetchCandidates(); }, [fetchCandidates]);

  return { candidates, loading, error, refresh };
}

export function useGroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    hrGroupService.getList()
      .then((result) => { setGroups(result.data || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return { groups, loading, error };
}

export function useCompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    hrCompanyService.getList()
      .then((result) => { setCompanies(result.data || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return { companies, loading, error };
}

export function useDepartmentList(companyId: string | null) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!companyId) { setDepartments([]); return; }
    setLoading(true);
    hrDepartmentService.getList(companyId)
      .then((result) => { setDepartments(result.data || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [companyId]);

  return { departments, loading, error };
}

export function useJobTitleList(departmentId: string | null) {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!departmentId) { setJobTitles([]); return; }
    setLoading(true);
    hrJobTitleService.getList(departmentId)
      .then((result) => { setJobTitles(result.data || []); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [departmentId]);

  return { jobTitles, loading, error };
}
