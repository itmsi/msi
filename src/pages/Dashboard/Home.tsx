
import PageMeta from "@/components/common/PageMeta";
import { useLanguage } from "@/components/lang/useLanguage";
import { homeTranslations } from "./translations";

export default function Home() {
    const { langField } = useLanguage(homeTranslations);

    return (
        <>
            <PageMeta
                title={langField('page_title')}
                description={langField('page_description')}
                image="/motor-sights-international.png"
            />
            <div className="flex flex-col justify-center items-center h-[70vh] gap-6">
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
