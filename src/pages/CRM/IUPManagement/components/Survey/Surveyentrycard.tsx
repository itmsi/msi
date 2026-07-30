import React from 'react';
import { LuPhone, LuMapPin, LuExternalLink, LuMic, LuVideo, LuFile } from 'react-icons/lu';
import { IupSurveyItem } from '../../types/iupmanagement';
import { DrivePlayer, DriveImage } from './DriveImage';
import { classifyEntry, TYPE_CONFIG, formatTime, parseLatLng } from './Surveyutils';
import Avatar from '@/components/common/Avatar';
import { MarkdownText } from '@/components/assistant-ui/markdown-text';

interface SurveyEntryCardProps {
    entry: IupSurveyItem;
}

const SurveyEntryCard: React.FC<SurveyEntryCardProps> = ({ entry }) => {
    const type = classifyEntry(entry);
    const cfg = TYPE_CONFIG[type];
    const Icon = cfg.icon;
    const coords = type === 'location' && entry.description ? parseLatLng(entry.description) : null;

    return (
        <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
            <div className="mb-2.5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <Avatar
                        src={null}
                        nama={(entry.user_name || 'no name')}
                        size={34}
                        fontSize={11}
                        alt="Profile Preview"
                    />
                    <div>
                        <div className="text-md font-primary-bold text-slate-900">{entry.user_name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            {entry.user_phone ? (
                                <>
                                    <LuPhone size={11} /> <span>{entry.user_phone}</span>
                                </>
                            ) : (
                                <span className="italic">no phone number</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-secondary font-bold ${cfg.color} ${cfg.bg}`}>
                        <Icon size={11} /> {cfg.label}
                    </span>
                    <span className="text-xs text-slate-400 font-primary">{formatTime(entry.chat_date)}</span>
                </div>
            </div>

            {type === 'empty' && <p className="text-md font-primary-italic text-slate-400">No content recorded for this entry.</p>}

            {type === 'video' && (
                <div>
                    <DrivePlayer
                        url={entry.source_link}
                        height={220}
                        icon={LuVideo}
                        label={entry.file_name || 'Play video'}
                        accentClass="text-rose-600 bg-rose-50"
                    />
                    <div className="my-2 flex items-center gap-1 text-[11px] font-primary-bold tracking-wide text-slate-400">
                        AUTO-GENERATED VIDEO DESCRIPTION
                    </div>
                    <MarkdownText content={entry.description} />
                </div>
            )}

            {type === 'voice' && (
                <div>
                    <DrivePlayer
                        url={entry.source_link}
                        height={190}
                        icon={Icon}
                        label="Play voice note"
                        accentClass="text-amber-600 bg-amber-50"
                    />
                    <div className="my-2 flex items-center gap-1 text-[11px] font-primary-bold tracking-wide text-slate-400">TRANSCRIPT</div>
                    <MarkdownText content={entry.description} />
                </div>
            )}

            {type === 'image' && (
                <div>
                    <DriveImage url={entry.source_link} alt={entry.file_name || `Photo from ${entry.user_name}`} />
                    {entry.description && <MarkdownText content={entry.description} />}
                </div>
            )}

            {type === 'file' && (
                <div>
                    <DrivePlayer
                        url={entry.source_link}
                        height={420}
                        icon={Icon}
                        label={entry.file_name || 'Open document'}
                        accentClass="text-slate-600 bg-slate-100"
                    />
                    {entry.description && <MarkdownText content={entry.description} />}
                </div>
            )}

            {type === 'location' && (
                <div>
                    {coords ? (
                        <a
                            href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-primary-bold text-slate-600 hover:opacity-80"
                        >
                            <LuMapPin size={15} />
                            <span>
                                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                            </span>
                            <span className="ml-auto text-xs opacity-70 font-primary-bold">Open in Maps</span>
                            <LuExternalLink size={12} />
                        </a>
                    ) : (
                        <MarkdownText content={entry.description} />
                    )}
                </div>
            )}

            {type === 'chat' && <MarkdownText content={entry.description} />}

            {/* <AIInsight prompt={entry.summary_prompt_ai} response={entry.summary_response_ai} /> */}
        </div>
    );
};

export default SurveyEntryCard;