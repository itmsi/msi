interface StageStyle {
    text: string;
    hoverBg: string;
    border: string;
    background: string;
    bgGradient: string;
}

// const createStageStyle = (color: string): StageStyle => ({
//     text: `text-[${color}]`,
//     hoverBg: `hover:bg-[${color}]`,
//     border: `border-[${color}]`,
//     background: color,
//     bgGradient: `linear-gradient(to top, ${color}1A, ${color}33)`,
// });

// export const stageStyles: Record<string, StageStyle> = {
//     find: createStageStyle('#6B7280'),
//     survey: createStageStyle('#4F46E5'),
//     pull: createStageStyle('#F59E0B'),
//     deal: createStageStyle('#22C55E'),
//     hypercare: createStageStyle('#BE185D'),
// };

export const stageStyles: Record<string, StageStyle> = {
    find: {
        text: 'text-[#6B7280]',
        hoverBg: 'hover:bg-[#6B7280]',
        border: 'border-[#6B7280]',
        background: '#6B7280',
        bgGradient: 'linear-gradient(to top, #6B72801A, #6B728033)',
    },
    survey: {
        text: 'text-[#4F46E5]',
        hoverBg: 'hover:bg-[#4F46E5]',
        border: 'border-[#4F46E5]',
        background: '#4F46E5',
        bgGradient: 'linear-gradient(to top, #4F46E51A, #4F46E533)',
    },
    pull: {
        text: 'text-[#F59E0B]',
        hoverBg: 'hover:bg-[#F59E0B]',
        border: 'border-[#F59E0B]',
        background: '#F59E0B',
        bgGradient: 'linear-gradient(to top, #F59E0B1A, #F59E0B33)',
    },
    deal: {
        text: 'text-[#22C55E]',
        hoverBg: 'hover:bg-[#22C55E]',
        border: 'border-[#22C55E]',
        background: '#22C55E',
        bgGradient: 'linear-gradient(to top, #22C55E1A, #22C55E33)',
    },
    hypercare: {
        text: 'text-[#BE185D]',
        hoverBg: 'hover:bg-[#BE185D]',
        border: 'border-[#BE185D]',
        background: '#BE185D',
        bgGradient: 'linear-gradient(to top, #BE185D1A, #BE185D33)',
    },
};