import { useState, useEffect, useCallback } from 'react';
import { BrandUnitForm, RkabForm, BrandUnitErrors, RkabErrors, ContractorForm, ContractorErrors } from '../types/iupmanagement';
import { IupService } from '../services/iupManagementService';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { translateErrorMessages } from '@/helpers/generalHelper';

const emptyBrandUnit: BrandUnitForm = { name: '', qty: 0 };
const emptyRkab: RkabForm = { year: new Date().getFullYear(), currentProduction: 0, targetProduction: 0 };
const emptyContractor: ContractorForm = { name: '' };

export function useIupRkabUnit() {
    const { id } = useParams<{ id: string }>();
    const [brandUnits, setBrandUnits] = useState<BrandUnitForm[]>([{ ...emptyBrandUnit }]);
    const [rkabs, setRkabs] = useState<RkabForm[]>([{ ...emptyRkab }]);
    const [contractors, setContractors] = useState<ContractorForm[]>([{ ...emptyContractor }]);

    const [brandUnitErrors, setBrandUnitErrors] = useState<Record<number, BrandUnitErrors>>({});
    const [rkabErrors, setRkabErrors] = useState<Record<number, RkabErrors>>({});
    const [contractorErrors, setContractorErrors] = useState<Record<number, ContractorErrors>>({});


    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ===== Validation helpers =====
    const validateBrandUnit = (item: BrandUnitForm): BrandUnitErrors => {
        const errs: BrandUnitErrors = {};
        if (!item.name.trim()) errs.name = 'Brand unit is required';
        if (!item.qty || item.qty <= 0) errs.qty = 'Qty is required and must be greater than 0';
        return errs;
    };

    const validateRkab = (item: RkabForm): RkabErrors => {
        const errs: RkabErrors = {};
        if (!item.year) errs.year = 'Year is required';
        // if (item.currentProduction === undefined || item.currentProduction === null || isNaN(item.currentProduction)) {
        //     errs.currentProduction = 'Current production is required';
        // }
        // if (item.targetProduction === undefined || item.targetProduction === null || item.targetProduction <= 0) {
        //     errs.targetProduction = 'Production target is required and must be greater than 0';
        // }
        return errs;
    };
    const validateContractor = (item: ContractorForm): ContractorErrors => {
        const errs: ContractorErrors = {};
        if (!item.name.trim()) errs.name = 'Nama kontraktor wajib diisi';
        return errs;
    };

    const validateAllBrandUnits = (items: BrandUnitForm[]) => {
        const result: Record<number, BrandUnitErrors> = {};
        items.forEach((item, i) => {
            const errs = validateBrandUnit(item);
            if (Object.keys(errs).length) result[i] = errs;
        });
        return result;
    };

    const validateAllRkabs = (items: RkabForm[]) => {
        const result: Record<number, RkabErrors> = {};
        items.forEach((item, i) => {
            const errs = validateRkab(item);
            if (Object.keys(errs).length) result[i] = errs;
        });
        return result;
    };

    const validateAllContractors = (items: ContractorForm[]) => {
        const result: Record<number, ContractorErrors> = {};
        items.forEach((item, i) => {
            const errs = validateContractor(item);
            if (Object.keys(errs).length) result[i] = errs;
        });
        return result;
    }

    // ===== Brand Unit Section =====
    const addBrandUnit = () => {
        const errs = validateAllBrandUnits(brandUnits);
        if (Object.keys(errs).length) {
            setBrandUnitErrors(errs);
            return;
        }
        setBrandUnits(prev => [...prev, { ...emptyBrandUnit }]);
    };

    const removeBrandUnit = (index: number) => {
        setBrandUnits(prev => prev.filter((_, i) => i !== index));
        setBrandUnitErrors(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const updateBrandUnit = (index: number, field: keyof BrandUnitForm, value: string | number) => {
        setBrandUnits(prev =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
        // clear error field yang baru diisi
        setBrandUnitErrors(prev => {
            if (!prev[index]) return prev;
            const next = { ...prev[index], [field]: undefined };
            return { ...prev, [index]: next };
        });
    };

    // ===== RKAB Section =====
    const addRkab = () => {
        const errs = validateAllRkabs(rkabs);
        if (Object.keys(errs).length) {
            setRkabErrors(errs);
            return;
        }
        setRkabs(prev => [...prev, { ...emptyRkab }]);
    };

    const removeRkab = (index: number) => {
        setRkabs(prev => prev.filter((_, i) => i !== index));
        setRkabErrors(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const updateRkab = (index: number, field: keyof RkabForm, value: string | number) => {
        setRkabs(prev =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
        setRkabErrors(prev => {
            if (!prev[index]) return prev;
            const next = { ...prev[index], [field]: undefined };
            return { ...prev, [index]: next };
        });
    };

    // ===== Contractor Section =====
    const addContractor = () => {
        const errs = validateAllContractors(contractors);
        if (Object.keys(errs).length) {
            setContractorErrors(errs);
            return;
        }
        setContractors(prev => [...prev, { ...emptyContractor }]);
    };

    const removeContractor = (index: number) => {
        setContractors(prev => prev.filter((_, i) => i !== index));
        setContractorErrors(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const updateContractor = (index: number, field: keyof ContractorForm, value: string) => {
        setContractors(prev =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
        setContractorErrors(prev => {
            if (!prev[index]) return prev;
            const next = { ...prev[index], [field]: undefined };
            return { ...prev, [index]: next };
        });
    };

    // ===== Reset =====
    const reset = () => {
        setBrandUnits([{ ...emptyBrandUnit }]);
        setRkabs([{ ...emptyRkab }]);
        setContractors([{ ...emptyContractor }]);
        setBrandUnitErrors({});
        setRkabErrors({});
        setContractorErrors({});
        setError(null);
    };

    // ===== Fetch data awal (mode edit) =====
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await IupService.getIupRkabUnit({
                iup_id: id,
                sort_by: 'created_at',
                sort_order: 'desc'
            });

            const mappedBrandUnits: BrandUnitForm[] = res.iup_brand_units.map(u => ({
                name: u.iup_brand_unit_name,
                qty: Number(u.iup_brand_unit_qty),
            }));

            const mappedRkabs: RkabForm[] = res.iup_rkabs.map(r => ({
                year: Number(r.iup_rkab_year),
                currentProduction: Number(r.iup_rkab_current_production),
                targetProduction: Number(r.iup_rkab_target_production),
            }));
            const mappedContractors: ContractorForm[] = res.iup_contractors.map(c => ({
                id: c.iup_contractor_id,
                name: c.iup_contractor_name,
            }));
            setBrandUnits(mappedBrandUnits.length ? mappedBrandUnits : [{ ...emptyBrandUnit }]);
            setRkabs(mappedRkabs.length ? mappedRkabs : [{ ...emptyRkab }]);
            setContractors(mappedContractors.length ? mappedContractors : [{ ...emptyContractor }]);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [id, fetchData]);

    // ===== Submit =====
    const handleSubmit = async () => {
        const buErrs = validateAllBrandUnits(brandUnits);
        const rkabErrs = validateAllRkabs(rkabs);
        const contractorErrs = validateAllContractors(contractors);

        setBrandUnitErrors(buErrs);
        setRkabErrors(rkabErrs);
        setContractorErrors(contractorErrs);

        if (Object.keys(buErrs).length || Object.keys(rkabErrs).length || Object.keys(contractorErrs).length) {
            toast.error('Please complete all required fields.');
            setError('Mohon lengkapi data yang wajib diisi.');
            return false;
        }

        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                iup_id: id || '',
                iup_brand_units: brandUnits.map(bu => ({
                    iup_brand_unit_name: bu.name,
                    iup_brand_unit_qty: bu.qty,
                })),
                iup_rkabs: rkabs.map(r => ({
                    iup_rkab_year: r.year,
                    iup_rkab_current_production: r.currentProduction,
                    iup_rkab_target_production: r.targetProduction,
                })),
                iup_contractors: contractors.map(c => ({
                    iup_contractor_id: c.id,
                    iup_contractor_name: c.name,
                })),
            };
            const response = await  IupService.createUpdateIupRkab(payload);
            
            if (response.success) {
                toast.success('Data updated successfully');
                setLoading(true);
                // navigate('/crm/iup-management');
                fetchData();
            } else {
                toast.error(translateErrorMessages(response.message) || 'Failed to update data');
            }
            setSubmitting(false);
        } catch (err) {
            console.error(err);
            setError('Gagal menyimpan data. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    return {
        // state
        brandUnits,
        rkabs,
        contractors,
        brandUnitErrors,
        rkabErrors,
        contractorErrors,
        loading,
        submitting,
        error,
        // brand unit actions
        addBrandUnit,
        removeBrandUnit,
        updateBrandUnit,
        // rkab actions
        addRkab,
        removeRkab,
        updateRkab,
        // contractor actions
        addContractor,
        removeContractor,
        updateContractor,
        // form actions
        handleSubmit,
        reset,
        fetchData,
    };
}