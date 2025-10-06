import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function Forbidden() {
    return (
        <>
        <PageMeta
            title="Motor Sights International - 404 Not Found"
            description="This is the 403 Forbidden page for Motor Sights International"
            image="/motor-sights-international.png"
        />
        <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden z-1 bg-[#0253a5]">
            <div className="mx-auto w-[80%] text-center rounded-[30px] pb-8 bg-white shadow-lg">
                {/* <div className="absolute bottom-0 w-full"> */}
                    <img src="/images/error/403.svg" alt="403" className="w-full" />
                {/* </div> */}
                <p className="mb-6 text-base text-gray-700 sm:text-lg">
                    You don't have permission to access this page. 
                    This page is not available in your menu access.
                </p>

                <div className="space-y-4">
                    <Link 
                        to="/home" 
                        className="inline-flex items-center justify-center rounded-lg px-5 py-3.5 text-sm font-medium bg-[#0253a5] text-white shadow-theme-xs hover:bg-[#003061] hover:shadow-md disabled:bg-brand-300"
                    >
                        Go to Dashboard
                    </Link>
                    
                    <div>
                        <button 
                            onClick={() => window.history.back()}
                            className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
                        >
                            ← Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
