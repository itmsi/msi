interface StageStyle {
    text: string;
    hoverBg: string;
    border: string;
    background: string;
    bgGradient: string;
}

const createStageStyle = (color: string): StageStyle => ({
    text: `text-[${color}]`,
    hoverBg: `hover:bg-[${color}]`,
    border: `border-[${color}]`,
    background: color,
    bgGradient: `linear-gradient(to top, ${color}1A, ${color}33)`,
});

export const stageStyles: Record<string, StageStyle> = {
    find: createStageStyle('#6B7280'),
    survey: createStageStyle('#4F46E5'),
    pull: createStageStyle('#F59E0B'),
    deal: createStageStyle('#22C55E'),
    hypercare: createStageStyle('#BE185D'),
};
