import React, { useState, useCallback, useRef } from "react";
import { LuLink2, LuLoaderCircle, LuChevronDown, LuChevronRight, LuSparkles } from "react-icons/lu";
import Button from "@/components/ui/button/Button";
import TextArea from "@/components/form/input/TextArea";
import { MdEdit, MdDeleteOutline } from "react-icons/md";
import moment from "moment";
import { IupZonaSiteItem } from "../../types/iupmanagement";
import { IupService } from "../../services/iupManagementService";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import toast from "react-hot-toast";
import { PermissionGate } from "@/components/common/PermissionComponents";
import { AiSummaryPanel } from "@/components/assistant-ui/Aisummarypanel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ZonecardProps {
    zone: IupZonaSiteItem;
    onEdit: (zone: IupZonaSiteItem) => void;
    onDelete: (zone: IupZonaSiteItem) => void;
    isDeleting?: boolean;
}

const Zonecard: React.FC<ZonecardProps> = ({ 
    zone, 
    onEdit, 
    onDelete, 
    isDeleting = false
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryResponse, setSummaryResponse] = useState<string | null>(zone.summary_response_ai ?? null);
    const [summaryPrompt, setSummaryPrompt] = useState<string>(
        zone.summary_prompt_ai ?? `Buatkan summary dari data zone site berikut:

Nama Zone: ${zone.iup_zona_site_name}
Deskripsi: ${zone.iup_zona_site_description || '(tidak ada deskripsi)'}
File: ${zone.iup_zona_site_file?.length ? zone.iup_zona_site_file.map(f => f.file_link).join(', ') : '(tidak ada file)'}
Tanggal Survey: ${zone.iup_zona_site_date_last_survey || '-'}

Buatlah ringkasan yang informatif tentang zone ini saja.`
    );
    const [sessionId, setSessionId] = useState<string>(zone.session_id ?? '');
    const abortRef = useRef<AbortController | null>(null);
    const hasEverGenerated = !!zone.summary_response_ai;

    const toggleZone = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };
    const isOpen = !!expanded[zone.iup_zona_site_id];

    const handleGenerateSummary = useCallback(async () => {
        if (!summaryPrompt.trim()) {
            toast.error("Prompt summary tidak boleh kosong");
            return;
        }
        setSummaryLoading(true);
        setSummaryResponse("");

        const abortController = new AbortController();
        abortRef.current = abortController;
        const token = localStorage.getItem("auth_token");
        let newSessionId = sessionId;
        let accumulatedText = "";
        let employeeId: string | undefined;
        try {
            const authUser = localStorage.getItem("auth_user");
            if (authUser) {
                const parsed = JSON.parse(authUser);
                employeeId = parsed.employee_id;
            }
        } catch {}

        // Build message dengan data zone sesungguhnya
        const fileList = zone.iup_zona_site_file?.length
            ? zone.iup_zona_site_file.map(f => f.file_link).join('\n')
            : '(tidak ada file)';
        const message = `DATA ZONE SITE:
            Nama Zone: ${zone.iup_zona_site_name}
            Deskripsi: ${zone.iup_zona_site_description || '(tidak ada deskripsi)'}
            Tanggal Survey: ${zone.iup_zona_site_date_last_survey || '-'}
            File Terkait:
            ${fileList}

            INSTRUKSI:
            ${summaryPrompt}

            Buatlah summary yang hanya berdasarkan data zone site di atas, jangan menambahkan informasi dari luar data tersebut.`;

        try {
            const response = await fetch(`${API_BASE_URL}/mosa/ai-assistant/chat/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: sessionId || undefined,
                    system: ["CRM"],
                    userId: employeeId,
                }),
                signal: abortController.signal,
            });

            if (!response.ok || !response.body) throw new Error("Stream request failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (abortController.signal.aborted) break;

                buffer += decoder.decode(value, { stream: true });
                buffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const clean = line.replace(/\r$/, '');
                    if (clean.startsWith("0:")) {
                        let raw = clean.slice(2).trim();
                        if (raw.startsWith('"') && raw.endsWith('"')) {
                            try { raw = JSON.parse(raw); } catch { raw = raw.replace(/^"|"$/g, ""); }
                        }
                        accumulatedText += String(raw);
                        setSummaryResponse(accumulatedText);
                    } else if (clean.startsWith("d:")) {
                        try {
                            const doneData = JSON.parse(clean.slice(2).trim());
                            if (doneData.sessionId) newSessionId = doneData.sessionId;
                        } catch { /* ignore */ }
                        break;
                    } else if (clean.startsWith("3:")) {
                        throw new Error("Stream error from server");
                    }
                }
            }

            abortRef.current = null;
            setSessionId(newSessionId);

            // Save summary back to API when stream completes
            try {
                await IupService.updateIupZonaSite(zone.iup_zona_site_id, {
                    iup_id: zone.iup_id,
                    iup_zona_site_name: zone.iup_zona_site_name,
                    iup_zona_site_description: zone.iup_zona_site_description,
                    iup_zona_site_date_last_survey: moment(zone.iup_zona_site_date_last_survey).format("YYYY-MM-DD"),
                    iup_zona_site_file: zone.iup_zona_site_file.map(f => ({ file_link: f.file_link })),
                    summary_prompt_ai: summaryPrompt,
                    summary_response_ai: accumulatedText,
                    session_id: newSessionId,
                });
            } catch {
                // Non-critical
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                toast.error(error.message || "Gagal membuat summary");
            }
        } finally {
            setSummaryLoading(false);
            abortRef.current = null;
        }
    }, [summaryPrompt, sessionId, zone]);

    return (
        <div className={`${
            isDeleting ? 'border-red-300 bg-red-50' : ''
        }`}>
            <div
                onClick={() => toggleZone(zone.iup_zona_site_id)}
                className={`pointer flex items-center justify-between gap-2 px-5 py-3 ${isOpen ? 'bg-primary hover:bg-primary text-white ' : ''} group hover:bg-primary transition-colors hover:*:text-white cursor-pointer`}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                        <LuChevronDown size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`} />
                    ) : (
                        <LuChevronRight size={20} className={`group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'} shrink-0`}  />
                    )}
                    <div className={`min-w-0 group-hover:text-white ${isOpen ? 'text-white' : 'text-slate-600'}`}>
                        <p className="flex-1 text-sm font-primary-bold">{zone.iup_zona_site_name}</p>
                        <p className="flex-1 text-xs font-secondary">{moment(zone.iup_zona_site_date_last_survey).format("DD MMMM YYYY")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <PermissionGate permission={["create", "update"]}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(zone)}
                            className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-slate-800 text-slate-500 hover:text-slate-200 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                        >
                            <MdEdit size={15} />
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="delete">
                        <Button
                            variant="outline"
                            onClick={() => { if (!isDeleting) onDelete(zone); }}
                            className={`bg-transparent p-1 rounded group-hover:text-white hover:bg-red-500/10 text-slate-500 hover:text-red-400 ${isOpen ? 'text-white' : 'text-slate-600'}`}
                        >
                            {isDeleting ? <LuLoaderCircle size={15} className="animate-spin" /> : <MdDeleteOutline size={15} />}
                        </Button>
                    </PermissionGate>
                </div>
            </div>
            {/* Detail — hanya tampil saat accordion terbuka */}
            {isOpen && (
                <div className="px-10 py-4 space-y-3">
                    {(hasEverGenerated || summaryResponse || summaryLoading) && (
                    <AiSummaryPanel
                        summary={summaryResponse || ''}
                        textPrompt={summaryPrompt}
                        onGenerate={handleGenerateSummary}
                        isGenerating={summaryLoading}
                    />
                    )}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-md text-slate-600">
                        <span className="flex items-center gap-1 text-gray-800 font-primary-bold text-md">
                            {zone.iup_zona_site_name || '-'}
                        </span>
                        {!hasEverGenerated && !summaryResponse && (
                            <Button
                                size="sm"
                                onClick={handleGenerateSummary}
                                disabled={summaryLoading}
                                className="inline-flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
                            >
                                {summaryLoading ? <LuLoaderCircle size={13} className="animate-spin" /> : <LuSparkles size={13} />}
                                {summaryLoading ? 'Generating...' : 'Summary by Mosa AI'}
                            </Button>
                        )}
                    </div>
                    <div className="w-full min-h-25 p-4 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none text-gray-700 reset-content">
                        {zone.iup_zona_site_description && <div dangerouslySetInnerHTML={{ __html: zone.iup_zona_site_description }}></div>}
                    </div>
                    {zone.iup_zona_site_file?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {zone.iup_zona_site_file.map((img, i) => (
                                <a
                                    key={i}
                                    href={img.file_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-1 px-3 py-1 text-xs text-gray-800 border-blue-200 border rounded-md font-medium"
                                >
                                    <LuLink2 size={11} />
                                    File {i + 1}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* ── Prompt & Summary (hanya jika sudah pernah generate) ── */}
                    {(hasEverGenerated || summaryResponse || summaryLoading) && (
                    <div className="border-t border-purple-200 pt-4 mt-4">
                     {(summaryResponse || summaryLoading) && (
                            <div className="mt-3 bg-white border border-purple-100 rounded-lg p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <LuSparkles size={14} className="text-purple-600" />
                                    <span className="text-xs font-semibold text-purple-700">AI Summary</span>
                                </div>
                                <div className="prose prose-sm max-w-none">
                                    <MarkdownText content={summaryResponse || ''} />
                                </div>
                            </div>
                        )}
                        <div className="mb-2">
                            <label className="text-xs font-medium text-purple-700">Prompt Summary</label>
                            <TextArea
                                value={summaryPrompt}
                                onChange={(e) => setSummaryPrompt(e.target.value)}
                                rows={2}
                                placeholder="Masukkan prompt untuk summary..."
                                className="mt-1 border-purple-200 focus:ring-purple-300"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                onClick={handleGenerateSummary}
                                disabled={summaryLoading}
                                className="inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {summaryLoading ? <LuLoaderCircle size={13} className="animate-spin" /> : <LuSparkles size={15} />}
                                {summaryLoading ? 'Generating...' : 'Summary by Mosa AI'}
                            </Button>
                        </div>
                    </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Zonecard;