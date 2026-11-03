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

// Model kadang membungkus JSON dengan ```json ... ``` atau kalimat pembuka
const extractJson = (text: string): unknown => {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
        return JSON.parse(text.slice(start, end + 1));
    } catch {
        return null;
    }
};

export const parseAssessment = (raw: string): Assessment | null => {
    if (!raw) return null;
    const data = extractJson(raw);
    if (!isRecord(data)) return null;

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

// Sel tabel Markdown tidak boleh berisi "|" atau baris baru
const cell = (value: string): string => value.replace(/\|/g, '/').replace(/\s*\n+\s*/g, ' ').trim() || '-';

const bullets = (items: string[]): string => items.map(item => `- ${item}`).join('\n');

const STAR_ORDER: Array<[string, string]> = [
    ['situation', 'S'],
    ['task', 'T'],
    ['action', 'A'],
    ['result', 'R'],
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

export const formatAssessmentMarkdown = (raw: string, t: Translate): string => {
    const assessment = parseAssessment(raw);
    if (!assessment) return raw;

    const blocks: string[] = [];

    const headline = [
        assessment.rating && `**${assessment.rating}**`,
        assessment.score !== null && `**${assessment.score.toFixed(2)}** / 5`,
    ].filter(Boolean).join(' · ');
    const relevanceKey = RELEVANCE_LABEL_KEY[assessment.relevance];
    const meta = [
        relevanceKey && `${t('assessmentRelevance')}: ${t(relevanceKey)}`,
        assessment.star && `STAR: ${STAR_ORDER.map(([key, letter]) => `${letter} ${assessment.star?.[key] ? '✓' : '✗'}`).join('  ')}`,
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
