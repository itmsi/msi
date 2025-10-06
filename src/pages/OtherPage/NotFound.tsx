import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
    return (
        <>
        <PageMeta
            title="Motor Sights International - 404 Not Found"
            description="This is the 404 Not Found page for Motor Sights International"
            image="/motor-sights-international.png"
        />
        <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden z-1 bg-[#0253a5]">
            <div className="mx-auto w-[80%] text-center rounded-[30px] pb-8 bg-white shadow-lg">
                {/* <div className="absolute bottom-0 w-full"> */}
                    <img src="/images/error/404.svg" alt="404" className="w-full" />
                {/* </div> */}
                <p className="mb-6 text-base text-gray-700 sm:text-lg">
                    We’re sorry, the page you requested is unavailable. Please navigate back to the homepage
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3.5 text-sm font-medium bg-[#0253a5] text-white shadow-theme-xs hover:bg-[#003061] hover:shadow-md disabled:bg-brand-300"
                >
                    Back to Home Page
                </Link>
            </div>
        </div>
        </>
    );
}
