import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { GrLineChart } from "react-icons/gr";

// Assume these icons are imported from an icon library
import {
    BoxCubeIcon,
    CalenderIcon,
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    ListIcon,
    PageIcon,
    PieChartIcon,
    PlugInIcon,
    TableIcon,
    UserIcon,
} from "@/icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import GridShape from "@/components/common/GridShape";

type NavItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    allowedRoles?: string[];
    subItems?: {
        name: string;
        path: string;
        icon?: React.ReactNode;
        pro?: boolean;
        new?: boolean;
        allowedRoles?: string[];
    }[];
    
};

const navItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        allowedRoles: ['Dashboard'],
        subItems: [{ name: "Main", path: "/home", allowedRoles: ['Dashboard'], }],
    },
    {
        icon: <CalenderIcon />,
        name: "Calendar",
        path: "/calendar",
        allowedRoles: ['Calendar'], // Tidak ada Calendar di auth_menu, jadi kita map ke Settings atau hapus allowedRoles
    },
    {
        icon: <CalenderIcon />,
        name: "Reports",
        path: "/reports",
        allowedRoles: ['Reports'],
    },
    {
        name: "Forms",
        icon: <ListIcon />,
        allowedRoles: ['Forms'], // Kosongkan karena 'Forms' tidak ada di auth_menu
        subItems: [{ name: "Form Elements", path: "/form-elements", allowedRoles: ['Forms'] }],
    },
    {
        name: "Tables",
        icon: <TableIcon />,
        allowedRoles: ['Tables'], // Kosongkan karena 'Tables' tidak ada di auth_menu
        subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false, allowedRoles: ['Tables'] }],
    },
    {
        name: "Pages",
        icon: <PageIcon />,
        allowedRoles: ['Pages', 'Blank Page', '404 Error'],
        subItems: [
            { name: "Blank Page", path: "/blank", allowedRoles: ['Pages', 'Blank Page', '404 Error'], },
            { name: "404 Error", path: "/error-404", allowedRoles: ['Pages', 'Blank Page', '404 Error'], },
        ],
    },
    {
        name: "Power BI",
        icon: <GrLineChart />,
        allowedRoles: ['Dashboard Power BI', 'Manage Power BI'],
        subItems: [
            { name: "Dashboard", path: "/power-bi/dashboard", allowedRoles: ['Dashboard Power BI'], },
            { name: "Category", path: "/power-bi/category", allowedRoles: ['Category Power BI'], },
            { name: "Manage", path: "/power-bi/manage", allowedRoles: ['Manage Power BI'], },
        ],
    },
];

const othersItems: NavItem[] = [
    {
        icon: <PieChartIcon />,
        name: "Charts",
        allowedRoles: ['Line Chart', 'Bar Chart'], // Kosongkan karena 'Charts' tidak ada di auth_menu
        subItems: [
            { name: "Line Chart", path: "/line-chart", allowedRoles: [], },
            { name: "Bar Chart", path: "/bar-chart", allowedRoles: [], },
        ],
    },
    {
        icon: <BoxCubeIcon />,
        name: "UI Elements",
        allowedRoles: ['Alerts', 'Avatar', 'Badge', 'Buttons', 'Images', 'Videos'], // Kosongkan karena tidak ada di auth_menu
        subItems: [
            { name: "Alerts", path: "/alerts", allowedRoles: ['Alerts'], },
            { name: "Avatar", path: "/avatars", allowedRoles: ['Avatar'], },
            { name: "Badge", path: "/badge", allowedRoles: ['Badge'], },
            { name: "Buttons", path: "/buttons", allowedRoles: ['Buttons'], },
            { name: "Images", path: "/images", allowedRoles: ['Images'], },
            { name: "Videos", path: "/videos", allowedRoles: ['Videos'], },
        ],
    },
    {
        icon: <PlugInIcon />,
        name: "Authentication",
        allowedRoles: ['Sign In', 'Sign Up'], // Kosongkan karena tidak ada di auth_menu
        subItems: [
            { name: "Sign In", path: "/signin", allowedRoles: ['Sign In'], },
            { name: "Sign Up", path: "/signup", allowedRoles: ['Sign Up'], },
        ],
    },
    {
        icon: <UserIcon />,
        name: "Administration",
        subItems: [
            {
                name: "Employees",
                path: "/employees",
                allowedRoles: ['Employees'],
            },
            {
                name: "Companies",
                path: "/companies",
                allowedRoles: ['Companies'],
            },
            {
                name: "Departments",
                path: "/departments",
                allowedRoles: ['Departments'],
            },
            {
                name: "Users",
                path: "/users",
                allowedRoles: ['Users'],
            },
            {
                name: "Positions",
                path: "/position",
                allowedRoles: ['Positions'],
            },
            {
                name: "Roles",
                path: "/roles",
                allowedRoles: ['Roles'],
            },
            { name: "Menu", path: "/menu", allowedRoles: ['Menu'], },
            { name: "Sign Up", path: "/signup", allowedRoles: ['Sign Up'], },
        ],
    },
    {
        icon: <PlugInIcon />,
        name: "Settings",
        path: "/settings",
        allowedRoles: ['Settings'],
    },
];

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();
    const { menu: authMenu } = useAuth();
    
    const allowedMenuNames = authMenu?.map(menu => menu.name) || [];

    type OpenState = { type: 'main' | 'others'; key: string } | null;
    const [openSubmenu, setOpenSubmenu] = useState<OpenState>(null);

    const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const buildNavKey = (menuType: 'main' | 'others', nav: NavItem): string => {
        return `${menuType}:${nav.path ?? nav.name}`;
    };

    const mainFiltered = useMemo(
        () => navItems.filter((item) => {
            if (!authMenu || authMenu.length === 0) {
                return true;
            }
            if (!item.allowedRoles || item.allowedRoles.length === 0) {
                return true;
            }
            return item.allowedRoles.some(name => allowedMenuNames.includes(name));
        }),
        [allowedMenuNames, authMenu]
    );

    const othersFiltered = useMemo(
        () => othersItems.filter((item) => {
            if (!authMenu || authMenu.length === 0) {
                return true;
            }
            if (!item.allowedRoles || item.allowedRoles.length === 0) {
                return true;
            }
            return item.allowedRoles.some(name => allowedMenuNames.includes(name));
        }),
        [allowedMenuNames, authMenu]
    );

    const isActive = useCallback(
        (path: string) => {
            // Exact match untuk root paths
            if (path === location.pathname) {
                return true;
            }
            
            // Check if current path starts with the path (untuk nested routes)
            const normalizedPath = path.endsWith('/') ? path : path + '/';
            const normalizedCurrentPath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
            
            return normalizedCurrentPath.startsWith(normalizedPath);
        },
        [location.pathname]
    );

    const isSubActive = useCallback((subPath: string) => {
        // Exact match untuk root paths
        if (subPath === location.pathname) {
            return true;
        }
        
        // Check if current path starts with the sub path (untuk nested routes)
        // Tambahkan trailing slash untuk menghindari partial match yang salah
        const normalizedSubPath = subPath.endsWith('/') ? subPath : subPath + '/';
        const normalizedCurrentPath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
        
        return normalizedCurrentPath.startsWith(normalizedSubPath);
    }, [location.pathname]);

    useEffect(() => {
        let bestMatch: OpenState = null;
        let bestLength = -1;

        const checkItems = (items: NavItem[], type: 'main' | 'others') => {
            items.forEach((nav) => {
                const matches = nav.subItems?.filter((sub) => isSubActive(sub.path)) ?? [];
                if (matches.length) {
                    const longest = matches.reduce((a, b) => (a.path.length >= b.path.length ? a : b));
                    if (longest.path.length > bestLength) {
                        bestLength = longest.path.length;
                        bestMatch = { type, key: buildNavKey(type, nav) };
                    }
                }
            });
        };

        checkItems(mainFiltered, 'main');
        checkItems(othersFiltered, 'others');

        setOpenSubmenu(bestMatch);
    }, [location.pathname, isSubActive]);

    // useEffect(() => {
    //     if (openSubmenu !== null) {
    //         const key = openSubmenu.key;
    //         // Use setTimeout to ensure DOM is updated
    //         setTimeout(() => {
    //             if (subMenuRefs.current[key]) {
    //                 // const scrollHeight = subMenuRefs.current[key]?.scrollHeight || 0;
    //                 // setSubMenuHeight((prevHeights) => ({
    //                 //     ...prevHeights,
    //                 //     [key]: scrollHeight,
    //                 // }));
    //             }
    //         }, 0);
    //     }
    // }, [openSubmenu]);
    
    const handleSubmenuToggle = (menuType: 'main' | 'others', nav: NavItem) => {
        const key = buildNavKey(menuType, nav);
        setOpenSubmenu((prev) => (prev && prev.key === key ? null : { type: menuType, key }));
    };

    const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
        return (
        <ul className="flex flex-col gap-4">
            {items.map((nav) => {

                const navKey = buildNavKey(menuType, nav);
                const filteredSubItems = nav.subItems?.filter(
                    (sub) => !sub.allowedRoles || sub.allowedRoles.some(name => allowedMenuNames.includes(name))
                );
                const isOpen = openSubmenu?.type === menuType && openSubmenu?.key === navKey;
                return (
                <li key={navKey}>
                    {filteredSubItems?.length ? (
                        <button
                            onClick={() => handleSubmenuToggle(menuType, nav)}
                            className={`menu-item group ${
                                isOpen
                                ? "menu-item-active ccc"
                                : "menu-item-inactive"
                            } cursor-pointer ${
                                !isExpanded && !isHovered
                                ? "lg:justify-center color-[#606060]"
                                : "lg:justify-start"
                            }`}
                        >
                            <span className={`menu-item-icon-size ${!isExpanded && !isHovered ? '' : 'color-[#606060]'}`}>
                                {nav.icon}
                            </span>
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <span className="menu-item-text">{nav.name}</span>
                            )}
                            {(isExpanded || isHovered || isMobileOpen) && (
                                <ChevronDownIcon
                                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                                        isOpen
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                />
                            )}
                        </button>
                    ) : nav.path ? (
                            <Link
                                to={nav.path}
                                className={`menu-item group ${
                                    isActive(nav.path) ? "menu-item-active xx" : "menu-item-inactive cc"
                                } ${!isHovered ? '' : 'color-[#606060]'}`}
                            >
                                <span
                                    className={`menu-item-icon-size ${
                                        isActive(nav.path)
                                        ? "menu-item-icon-active"
                                        : "menu-item-icon-inactive"
                                    }`}
                                >
                                    {nav.icon}
                                </span>
                                {(isExpanded || isHovered || isMobileOpen) && (
                                    <span className={`menu-item-text`}>{nav.name}</span>
                                )}
                            </Link>
                    ) : null }
                    {filteredSubItems?.length && (
                        <div
                            ref={(el) => {
                                subMenuRefs.current[navKey] = el;
                            }}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                height: isOpen ? "auto" : "0px",
                            }}
                        >
                            <ul className={`mt-2 space-y-1 ml-9 ${(isExpanded || isHovered || isMobileOpen) ? "" : "hidden"}`}>
                                {filteredSubItems.map((subItem) => {
                                    return (
                                <li key={`${navKey}:${subItem.path}`}>
                                    <Link
                                        to={subItem.path}
                                        className={`menu-dropdown-item ${
                                            isSubActive(subItem.path)
                                            ? "menu-dropdown-item-active"
                                            : "menu-dropdown-item-inactive"
                                        }`}
                                    >
                                        {subItem.name}
                                    </Link>
                                </li>
                                );})}
                            </ul>
                        </div>
                    )}
                </li>
            )})}
        </ul>
    )};

    return (
        <aside
            className={`bg-aside fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-[0 0px 15px -8px #0055b5] 
            ${
                isExpanded || isMobileOpen
                    ? "w-[290px]"
                    : isHovered
                    ? "w-[290px]"
                    : "w-[90px]"
            }
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0`}
            onMouseEnter={() => !isExpanded && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <GridShape />
            <div
                className={`py-8 flex ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-center"
                }`}
            >
                <Link to="/">
                    {isExpanded || isHovered || isMobileOpen ? (
                        <>
                            <img
                                className=""
                                src="/motor-sights-international-logo.png"
                                alt="Motor Sights International"
                                width={110}
                            />
                        </>
                    ) : (
                        <img
                            src="/motor-sights-international-logo.png"
                            alt="Motor Sights International"
                            width={32}
                            height={32}
                        />
                    )}
                </Link>
            </div>
            <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                <nav className="mb-6">
                    <div className="flex flex-col gap-4">
                        {renderMenuItems(mainFiltered, "main")}
                        {othersFiltered.length === 0 ? null : (
                        <div>
                            <h2
                                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                                !isExpanded && !isHovered
                                    ? "lg:justify-center"
                                    : "justify-start"
                                }`}
                            >
                                {isExpanded || isHovered || isMobileOpen ? (
                                    "Others"
                                ) : (
                                    <HorizontaLDots />
                                )}
                            </h2>
                            {renderMenuItems(othersFiltered, "others")}
                        </div>
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    );
};

export default AppSidebar;
