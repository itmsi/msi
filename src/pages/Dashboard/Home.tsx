
import PageMeta from "@/components/common/PageMeta";
import { useLanguage } from "@/components/lang/useLanguage";
import { homeTranslations } from "./translations";
import { useProfile } from "@/hooks/useProfile";

export default function Home() {
    const { langField } = useLanguage(homeTranslations);
    const {
        profile,
    } = useProfile(true);
    return (
        <>
            <PageMeta
                title={langField('page_title')}
                description={langField('page_description')}
                image="/motor-sights-international.png"
            />
            <h1 className="hidden">{profile?.employee_name || ''}</h1>
            <div className="flex flex-col justify-center items-center h-[70vh] gap-6">
                {/* <div className="flex items-center gap-2">
                    <img
                        // src="/motor-sights-international-logo.png" 
                        src="/logo-transparent.png"
                        alt="Motor Sights International"
                        className="h-32 object-contain"
                    />
                    <div className="text-sm text-black">
                        <h1 className="text-4xl font-primary-bold text-[#0253a5] text-shadow-[-2px_4px_1px_#a8a5a4]">MSI <span className="font-main-italic">GO</span></h1>
                        <p className="text-lg font-primary-medium">Leading In Service Innovation</p>
                    </div>
                </div> */}
                <img
                    src="/motor-sights-international-logo.png"
                    alt="Motor Sights International"
                    className="h-32 object-contain"
                />

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-primary-bold text-gray-800">
                        {langField('welcome_title')}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {langField('dashboard_subtitle')}
                    </p>
                </div>
            </div>
        </>
    );
}
