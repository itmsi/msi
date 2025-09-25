
import PageMeta from "@/components/common/PageMeta";

export default function Home() {
    return (
        <>
        <PageMeta
            title="Motor Sights International - Dashboard"
            description="Motor Sights International - Dashboard"
            image="/motor-sights-international.png"
        />
        <div className="flex justify-center items-center h-[70vh]">
            <img src="/motor-sights-international-logo.png" alt="Motor Sights International" className="col-span-12 h-32 object-contain"/>

        </div>
        </>
    );
}
