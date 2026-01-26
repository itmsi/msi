import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { ReactNode } from 'react';

const LayoutContent: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    return (
        <div className="min-h-screen xl:flex">
                <AppSidebar />
                {/* <NavBar /> */}
                <Backdrop />
            <div
                className={
                    `flex-1 transition-all duration-300 ease-in-out
                    ${isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'}
                    ${isMobileOpen ? 'ml-0' : ''}`
                }
            >
                <AppHeader />
                <div className="p-4 mx-auto md:p-6">{children}</div>
            </div>
        </div>
    );
};

const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
};

export default AppLayout;