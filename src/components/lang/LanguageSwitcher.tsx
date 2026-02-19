import { LangCode, SUPPORTED_LANGS } from './useLanguage';

interface LanguageSwitcherProps {
    currentLang: LangCode;
    onChangeLang: (lang: LangCode) => void;
}

/**
 * Tombol switcher bahasa
 * Tinggal passing currentLang dan onChangeLang dari useLanguage().
 */
export default function LanguageSwitcher({ currentLang, onChangeLang }: LanguageSwitcherProps) {
    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            {SUPPORTED_LANGS.map((item) => (
                <button
                    key={item.code}
                    type="button"
                    onClick={() => onChangeLang(item.code)}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                        ${currentLang === item.code
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }
                    `}
                    title={item.label}
                >
                    <span className="text-base leading-none">{item.flag}</span>
                    {/* <span className="hidden sm:inline">{item.label}</span> */}
                </button>
            ))}
        </div>
    );
}
