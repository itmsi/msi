import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative p-6 bg-white z-1 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row sm:p-0">
                {children}
                <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 lg:grid">
                    <div className="relative flex items-center justify-center z-1">
                        {/* <!-- ===== Common Grid Shape Start ===== --> */}
                        <GridShape />
                        <div className="flex flex-col items-center max-w-xs">
                            <Link to="/" className="block mb-4">
                                <img
                                    width={200}
                                    src="/motor-sights-international-logo-footer-white.svg"
                                    alt="Motor Sights International"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
