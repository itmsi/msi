// Hasil penilaian AI (summary_update) berupa JSON. Util ini mengubahnya jadi Markdown yang
// enak dibaca HR. Teks yang bukan JSON penilaian (ringkasan lama / hasil edit manual)
// dikembalikan apa adanya.

type Translate = (key: string) => string;

interface AssessmentDimension {
    name: string;
    score: number | null;
    confidence: string;
    evidence: string[];
    reasoning: string;
}

interface Assessment {
    score: number | null;
    rating: string;
    relevance: string;
    star: Record<string, boolean> | null;
    summaryForHr: string;
    dimensions: AssessmentDimension[];
    strengths: string[];
    developmentAreas: string[];
    redFlags: string[];
    followUpQuestions: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const toText = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : '';

const toStringList = (value: unknown): string[] =>
    Array.isArray(value) ? value.map(toText).filter(Boolean) : [];

const toScore = (value: unknown): number | null => {
    const number = typeof value === 'string' ? Number(value.trim().replace(',', '.')) : value;
    return typeof number === 'number' && Number.isFinite(number) ? number : null;
};

// Mengambil semua objek JSON level atas dari teks. Model kadang membungkus JSON dengan
// ```json ... ```, kalimat pembuka, atau menggabungkan beberapa objek / array (summary all).
const extractJsonObjects = (text: string): Record<string, unknown>[] => {
    const results: Record<string, unknown>[] = [];
    const collect = (value: unknown) => {
        if (Array.isArray(value)) value.forEach(collect);
        else if (isRecord(value)) results.push(value);
    };

    try {
        collect(JSON.parse(text.trim()));
        if (results.length) return results;
    } catch {
        // lanjut ke pemindaian manual
    }

    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (inString) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === '"') inString = false;
        } else if (char === '"') {
            if (depth > 0) inString = true;
        } else if (char === '{') {
            if (depth === 0) start = i;
            depth += 1;
        } else if (char === '}' && depth > 0) {
            depth -= 1;
            if (depth === 0) {
                try {
                    collect(JSON.parse(text.slice(start, i + 1)));
                } catch {
                    // bukan JSON valid, abaikan
                }
            }
        }
    }
    return results;
};

const toAssessment = (data: Record<string, unknown>): Assessment | null => {

    const dimensions = (Array.isArray(data.dimensions) ? data.dimensions : [])
        .filter(isRecord)
        .map(item => ({
            name: toText(item.name),
            score: toScore(item.score),
            confidence: toText(item.confidence),
            evidence: toStringList(item.evidence),
            reasoning: toText(item.reasoning),
        }))
        .filter(item => item.name);

    const score = toScore(data.weighted_score);
    // Bukan JSON penilaian kalau tidak ada skor maupun dimensi
    if (score === null && dimensions.length === 0) return null;

    return {
        score,
        rating: toText(data.rating),
        relevance: toText(data.answer_relevance),
        star: isRecord(data.star_completeness)
            ? Object.fromEntries(Object.entries(data.star_completeness).map(([key, value]) => [key, value === true]))
            : null,
        summaryForHr: toText(data.summary_for_hr),
        dimensions,
        strengths: toStringList(data.strengths),
        developmentAreas: toStringList(data.development_areas),
        redFlags: toStringList(data.red_flags),
        followUpQuestions: toStringList(data.follow_up_questions),
    };
};

export const parseAssessments = (raw: string): Assessment[] => {
    if (!raw) return [];
    return extractJsonObjects(raw)
        .map(toAssessment)
        .filter((item): item is Assessment => item !== null);
};

// Sel tabel Markdown tidak boleh berisi "|" atau baris baru
const cell = (value: string): string => value.replace(/\|/g, '/').replace(/\s*\n+\s*/g, ' ').trim() || '-';

const bullets = (items: string[]): string => items.map(item => `- ${item}`).join('\n');

const STAR_ORDER: Array<[string, string]> = [
    ['situation', 'Situation'],
    ['task', 'Task'],
    ['action', 'Action'],
    ['result', 'Result'],
];

const RELEVANCE_LABEL_KEY: Record<string, string> = {
    relevant: 'assessmentRelevant',
    partially_relevant: 'assessmentPartiallyRelevant',
    off_topic: 'assessmentOffTopic',
};

const CONFIDENCE_LABEL_KEY: Record<string, string> = {
    high: 'assessmentConfidenceHigh',
    medium: 'assessmentConfidenceMedium',
    low: 'assessmentConfidenceLow',
};

const formatAssessment = (assessment: Assessment, t: Translate): string => {
    const blocks: string[] = [];

    const headline = [
        assessment.rating && `**${assessment.rating}**`,
        assessment.score !== null && `**${assessment.score.toFixed(2)}** / 5`,
    ].filter(Boolean).join(' · ');
    const relevanceKey = RELEVANCE_LABEL_KEY[assessment.relevance];
    const meta = [
        relevanceKey && `${t('assessmentRelevance')}: ${t(relevanceKey)}`,
        assessment.star && `STAR: ${STAR_ORDER.map(([key, name]) => `${name} ${assessment.star?.[key] ? '✓' : '✗'}`).join(', ')}`,
    ].filter(Boolean).join(' · ');
    if (headline || meta) blocks.push([headline, meta].filter(Boolean).join('\n\n'));

    if (assessment.summaryForHr) {
        blocks.push(`### ${t('assessmentForHr')}\n${assessment.summaryForHr}`);
    }

    if (assessment.dimensions.length) {
        const rows = assessment.dimensions.map(item => {
            const confidenceKey = CONFIDENCE_LABEL_KEY[item.confidence.toLowerCase()];
            const confidence = confidenceKey ? t(confidenceKey) : item.confidence;
            return `| ${cell(item.name)} | ${item.score ?? '-'} | ${cell(confidence)} | ${cell(item.reasoning)} |`;
        });
        blocks.push([
            `### ${t('assessmentDimensions')}`,
            `| ${t('assessmentDimension')} | ${t('assessmentScoreColumn')} | ${t('assessmentConfidence')} | ${t('assessmentReasoning')} |`,
            '|---|:-:|:-:|---|',
            ...rows,
        ].join('\n'));
    }

    const evidence = assessment.dimensions.filter(item => item.evidence.length);
    if (evidence.length) {
        blocks.push([
            `### ${t('assessmentEvidence')}`,
            ...evidence.map(item => `**${item.name}**\n${bullets(item.evidence)}`),
        ].join('\n\n'));
    }

    if (assessment.strengths.length) {
        blocks.push(`### ${t('assessmentStrengths')}\n${bullets(assessment.strengths)}`);
    }
    if (assessment.developmentAreas.length) {
        blocks.push(`### ${t('assessmentDevelopmentAreas')}\n${bullets(assessment.developmentAreas)}`);
    }
    blocks.push(`### ${t('assessmentRedFlags')}\n${assessment.redFlags.length ? bullets(assessment.redFlags) : t('assessmentNoRedFlags')}`);
    if (assessment.followUpQuestions.length) {
        blocks.push([
            `### ${t('assessmentFollowUp')}`,
            ...assessment.followUpQuestions.map((item, index) => `${index + 1}. ${item}`),
        ].join('\n'));
    }

    return blocks.join('\n\n');
};

// ---- Ringkasan akhir kandidat (summary_all) ----
// Bentuk JSON berbeda dari penilaian per jawaban: skor ada di `scores`, ada rekomendasi,
// kekuatan/kekhawatiran, dan ringkasan eksekutif.

interface CandidateScoreRow {
    name: string;
    score: number | null;
    rating: string;
}

interface CandidatePillar {
    pillar: string;
    score5: number | null;
    score100: number | null;
}

interface CandidatePoint {
    point: string;
    evidence: string[];
    severity: string;
}

interface CandidateSummary {
    incomplete: boolean;
    missing: string[];
    overall5: number | null;
    overall100: number | null;
    perQuestion: CandidateScoreRow[];
    perPillar: CandidatePillar[];
    recommendation: string;
    recommendationReason: string;
    needsHrReview: boolean;
    strengths: CandidatePoint[];
    concerns: CandidatePoint[];
    consistent: boolean | null;
    consistencyNotes: string;
    redFlags: string[];
    jobFit: string;
    cultureFit: string;
    interviewFocus: string[];
    executiveSummary: string;
}

const toPoints = (value: unknown): CandidatePoint[] =>
    (Array.isArray(value) ? value : [])
        .filter(isRecord)
        .map(item => ({
            point: toText(item.point),
            evidence: [...new Set(toStringList(item.evidence_videos))],
            severity: toText(item.severity).toLowerCase(),
        }))
        .filter(item => item.point);

const toCandidateSummary = (data: Record<string, unknown>): CandidateSummary | null => {
    if (!isRecord(data.scores)) return null;
    const executiveSummary = toText(data.executive_summary);
    const recommendation = toText(data.recommendation);
    if (!executiveSummary && !recommendation) return null;

    const scores = data.scores;
    const consistency = isRecord(data.consistency_check) ? data.consistency_check : null;

    return {
        incomplete: toText(data.assessment_status).toLowerCase() === 'incomplete',
        missing: toStringList(data.missing_videos),
        overall5: toScore(scores.overall_score_5),
        overall100: toScore(scores.overall_score_100),
        perQuestion: (Array.isArray(scores.per_video) ? scores.per_video : [])
            .filter(isRecord)
            .map(item => ({
                name: toText(item.question),
                score: toScore(item.weighted_score),
                rating: toText(item.rating),
            })),
        perPillar: (Array.isArray(scores.per_pillar) ? scores.per_pillar : [])
            .filter(isRecord)
            .map(item => ({
                pillar: toText(item.pillar),
                score5: toScore(item.score_5),
                score100: toScore(item.score_100),
            }))
            .filter(item => item.pillar),
        recommendation,
        recommendationReason: toText(data.recommendation_reason),
        needsHrReview: data.needs_hr_review === true,
        strengths: toPoints(data.top_strengths),
        concerns: toPoints(data.key_concerns),
        consistent: consistency && typeof consistency.is_consistent === 'boolean' ? consistency.is_consistent : null,
        consistencyNotes: consistency ? toText(consistency.notes) : '',
        redFlags: (Array.isArray(data.red_flags) ? data.red_flags : [])
            .map(item => {
                if (!isRecord(item)) return toText(item);
                const meta = [toText(item.video), toText(item.type)].filter(Boolean).join(' · ');
                return [toText(item.flag), meta && `(${meta})`].filter(Boolean).join(' ');
            })
            .filter(Boolean),
        jobFit: toText(data.job_fit_summary),
        cultureFit: toText(data.culture_fit_summary),
        interviewFocus: toStringList(data.interview_focus),
        executiveSummary,
    };
};

const SEVERITY_LABEL_KEY: Record<string, string> = {
    high: 'candidateSeverityHigh',
    medium: 'candidateSeverityMedium',
    low: 'candidateSeverityLow',
};

const formatScore = (value: number | null): string => (value === null ? '-' : value.toFixed(2));

const formatPoints = (items: CandidatePoint[], t: Translate, withSeverity: boolean): string =>
    items.map(item => {
        const severityKey = SEVERITY_LABEL_KEY[item.severity];
        const prefix = withSeverity && severityKey ? `**[${t(severityKey)}]** ` : '';
        const evidence = item.evidence.length ? `\n  _${t('candidateEvidence')}: ${item.evidence.join('; ')}_` : '';
        return `- ${prefix}${item.point}${evidence}`;
    }).join('\n');

const formatCandidateSummary = (summary: CandidateSummary, t: Translate): string => {
    const blocks: string[] = [];

    const overall = summary.overall5 === null
        ? ''
        : `**${summary.overall5.toFixed(2)}** / 5${summary.overall100 === null ? '' : ` (${summary.overall100}/100)`}`;
    const headline = [
        summary.recommendation && `**${summary.recommendation}**`,
        overall,
        summary.incomplete && t('candidateIncomplete'),
        summary.needsHrReview && `⚠ ${t('candidateNeedsHrReview')}`,
    ].filter(Boolean).join(' · ');
    if (headline) blocks.push(headline);
    if (summary.missing.length) {
        blocks.push(`${t('candidateMissingVideos')}: ${summary.missing.join('; ')}`);
    }

    if (summary.executiveSummary) {
        blocks.push(`### ${t('candidateExecutiveSummary')}\n${summary.executiveSummary}`);
    }
    if (summary.recommendationReason) {
        blocks.push(`### ${t('candidateRecommendationReason')}\n${summary.recommendationReason}`);
    }

    if (summary.perQuestion.length) {
        blocks.push([
            `### ${t('candidatePerQuestion')}`,
            `| ${t('candidateQuestion')} | ${t('assessmentScoreColumn')} | ${t('candidateRating')} |`,
            '|---|:-:|:-:|',
            ...summary.perQuestion.map(item => `| ${cell(item.name)} | ${formatScore(item.score)} | ${cell(item.rating)} |`),
        ].join('\n'));
    }

    if (summary.perPillar.length) {
        blocks.push([
            `### ${t('candidatePerPillar')}`,
            `| ${t('candidatePillar')} | ${t('assessmentScoreColumn')} | ${t('candidateScore100')} |`,
            '|---|:-:|:-:|',
            ...summary.perPillar.map(item => `| ${cell(item.pillar)} | ${formatScore(item.score5)} | ${item.score100 ?? '-'} |`),
        ].join('\n'));
    }

    if (summary.strengths.length) {
        blocks.push(`### ${t('candidateTopStrengths')}\n${formatPoints(summary.strengths, t, false)}`);
    }
    if (summary.concerns.length) {
        blocks.push(`### ${t('candidateKeyConcerns')}\n${formatPoints(summary.concerns, t, true)}`);
    }

    if (summary.consistent !== null || summary.consistencyNotes) {
        const status = summary.consistent === null
            ? ''
            : `**${t(summary.consistent ? 'candidateConsistent' : 'candidateInconsistent')}**`;
        blocks.push(`### ${t('candidateConsistency')}\n${[status, summary.consistencyNotes].filter(Boolean).join('\n\n')}`);
    }

    blocks.push(`### ${t('assessmentRedFlags')}\n${summary.redFlags.length ? bullets(summary.redFlags) : t('assessmentNoRedFlags')}`);

    if (summary.jobFit) blocks.push(`### ${t('candidateJobFit')}\n${summary.jobFit}`);
    if (summary.cultureFit) blocks.push(`### ${t('candidateCultureFit')}\n${summary.cultureFit}`);
    if (summary.interviewFocus.length) {
        blocks.push([
            `### ${t('candidateInterviewFocus')}`,
            ...summary.interviewFocus.map((item, index) => `${index + 1}. ${item}`),
        ].join('\n'));
    }

    return blocks.join('\n\n');
};

export const formatAssessmentMarkdown = (raw: string, t: Translate): string => {
    // Ringkasan akhir kandidat (summary_all) dicek lebih dulu: bentuknya beda dari penilaian per jawaban
    const candidates = raw ? extractJsonObjects(raw).map(toCandidateSummary).filter((item): item is CandidateSummary => item !== null) : [];
    if (candidates.length) {
        return candidates.map(item => formatCandidateSummary(item, t)).join('\n\n---\n\n');
    }

    const assessments = parseAssessments(raw);
    if (!assessments.length) return raw;
    if (assessments.length === 1) return formatAssessment(assessments[0], t);

    // Beberapa penilaian (summary all): dipisah garis, tanpa nomor audio
    return assessments.map(item => formatAssessment(item, t)).join('\n\n---\n\n');
};
