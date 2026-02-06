import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { GrDocumentVerified, GrLineChart } from "react-icons/gr";
import { GiChart } from "react-icons/gi";

// Assume these icons are imported from an icon library
import {
    ChevronDownIcon,
    GridIcon,
    HorizontaLDots,
    PlugInIcon,
    UserIcon,
} from "@/icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import GridShape from "@/components/common/GridShape";
import { TbTopologyStar3 } from "react-icons/tb";

type SubNavItem = {
    name: string;
    path?: string;
    icon?: React.ReactNode;
    pro?: boolean;
    new?: boolean;
    allowedRoles?: string[];
    subItems?: SubNavItem[];
};

type NavItem = {
    name: string;
    icon?: React.ReactNode;
    path?: string;
    allowedRoles?: string[];
    subItems?: SubNavItem[];
};

const navItems: NavItem[] = [
    {
        icon: <GridIcon />,
        name: "Dashboard",
        allowedRoles: ['ADMIN'],
        subItems: [{ name: "Main", path: "/home", allowedRoles: ['ADMIN'], }],
    },
    {
        name: "Power BI",
        icon: <GrLineChart />,
        allowedRoles: ['Dashboard Power BI', 'Manage Power BI', 'Category Power BI'],
        subItems: [
            { name: "Dashboard", path: "/power-bi/dashboard", allowedRoles: ['Dashboard Power BI'], },
            { name: "Category", path: "/power-bi/category", allowedRoles: ['Category Power BI'], },
            { name: "Manage", path: "/power-bi/manage", allowedRoles: ['Manage Power BI'], },
        ],
    },
    {
        name: "Quotation",
        icon: <GrDocumentVerified />,
        allowedRoles: ['Product Quotation', 'Accessories Quotation', 'Manage Quotation', 'TNC Quotation', 'Customer Quotation', 'Bank Quotation', 'Island'],
        subItems: [
            { name: "Manage", path: "/quotations/manage", allowedRoles: ['Manage Quotation'], },
            { name: "Product", path: "/quotations/products", allowedRoles: ['Product Quotation'], },
            { name: "Accessories", path: "/quotations/accessories", allowedRoles: ['Accessories Quotation'], },
            { name: "Term Condition", path: "/quotations/term-condition", allowedRoles: ['TNC Quotation'], },
            {
                name: "Administration",
                subItems: [
                    { 
                        name: "Customers", 
                        path: "/quotations/administration/customers", 
                        allowedRoles: ['Customer Quotation']
                    },
                    { 
                        name: "Bank Accounts", 
                        path: "/quotations/administration/bank-accounts", 
                        allowedRoles: ['Bank Quotation']
                    },
                    { 
                        name: "Regions", 
                        path: "/quotations/administration/islands", 
                        allowedRoles: ['Island']
                    }
                ],
            },
        ],
    },
    {
        name: "Return on Equity ",
        icon: <GiChart />,
        allowedRoles: ['Manage ROA ROE Calculate', 'Setting ROA ROE Calculate'],
        path: "/roe-roa-calculator/manage"
        // subItems: [
        //     { name: "Manage", path: "/roe-roa-calculator/manage", allowedRoles: ['Manage ROA ROE Calculate'] },
        //     // { name: "Settings", path: "/roe-roa-calculator/settings", allowedRoles: ['Setting ROA ROE Calculate'] },
        // ],
    },
    {
        name: "CRM",
        icon: <TbTopologyStar3 />,
        allowedRoles: [
            'Area Structure CRM', 
            'IUP Management CRM', 
            'Contractors CRM',
            'Activities CRM',
            'User Management CRM'
        ],
        subItems: [
            { name: "Area Structure", path: "/crm/area-structure", allowedRoles: ['Area Structure CRM'] },
            { name: "IUP Management", path: "/crm/iup-management", allowedRoles: ['IUP Management CRM'] },
            { name: "Contractors", path: "/crm/contractors", allowedRoles: ['Contractors CRM'] },
            { name: "Activities", path: "/crm/activity", allowedRoles: ['Activities CRM'] },
            { name: "User Management", path: "/crm/user-management", allowedRoles: ['User Management CRM'] }
        ],
    }
];

const othersItems: NavItem[] = [
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
        name: "Employee",
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
            { 
                name: "Menu", 
                path: "/menu", 
                allowedRoles: ['Menu'], 
            },
            { 
                name: "Sign Up", 
                path: "/signup", 
                allowedRoles: ['Sign Up'], 
            },
        ],
    },
];

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();
    const { menu: authMenu } = useAuth();
    
    const allowedMenuNames = authMenu?.map(menu => menu.name) || [];

    type OpenState = { type: 'main' | 'others'; key: string } | null;
    const [openSubmenu, setOpenSubmenu] = useState<OpenState>(null);
    const [openNestedSubmenu, setOpenNestedSubmenu] = useState<string | null>(null);

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
            if (path === location.pathname) {
                return true;
            }
            
            const normalizedPath = path.endsWith('/') ? path : path + '/';
            const normalizedCurrentPath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
            
            return normalizedCurrentPath.startsWith(normalizedPath);
        },
        [location.pathname]
    );

    const isSubActive = useCallback((subPath: string) => {
        if (subPath === location.pathname) {
            return true;
        }
        const normalizedSubPath = subPath.endsWith('/') ? subPath : subPath + '/';
        const normalizedCurrentPath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
        
        return normalizedCurrentPath.startsWith(normalizedSubPath);
    }, [location.pathname]);

    useEffect(() => {
        let bestMatch: OpenState = null;
        let bestLength = -1;
        let bestNestedKey: string | null = null;

        const checkItems = (items: NavItem[], type: 'main' | 'others') => {
            items.forEach((nav) => {
                // Check level 2 items
                const matches = nav.subItems?.filter((sub) => sub.path && isSubActive(sub.path)) ?? [];
                if (matches.length) {
                    const longest = matches.reduce((a, b) => ((a.path?.length || 0) >= (b.path?.length || 0) ? a : b));
                    if (longest.path && longest.path.length > bestLength) {
                        bestLength = longest.path.length;
                        bestMatch = { type, key: buildNavKey(type, nav) };
                        bestNestedKey = null;
                    }
                }

                // Check level 3 nested items
                nav.subItems?.forEach((subItem, subIndex) => {
                    if (subItem.subItems && subItem.subItems.length > 0) {
                        const nestedMatches = subItem.subItems.filter((nested) => nested.path && isSubActive(nested.path));
                        if (nestedMatches.length) {
                            const longestNested = nestedMatches.reduce((a, b) => ((a.path?.length || 0) >= (b.path?.length || 0) ? a : b));
                            if (longestNested.path && longestNested.path.length > bestLength) {
                                bestLength = longestNested.path.length;
                                bestMatch = { type, key: buildNavKey(type, nav) };
                                const navKey = buildNavKey(type, nav);
                                bestNestedKey = `${navKey}:${subItem.path || subItem.name}:${subIndex}`;
                            }
                        }
                    }
                });
            });
        };

        checkItems(mainFiltered, 'main');
        checkItems(othersFiltered, 'others');

        setOpenSubmenu(bestMatch);
        setOpenNestedSubmenu(bestNestedKey);
    }, [location.pathname]);

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

    const handleNestedSubmenuToggle = (subItemKey: string) => {
        setOpenNestedSubmenu((prev) => (prev === subItemKey ? null : subItemKey));
    };

    const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
        return (
        <ul className="flex flex-col gap-4">
            {items.map((nav, index) => {

                const navKey = buildNavKey(menuType, nav);
                const filteredSubItems = nav.subItems?.filter(
                    (sub) => !sub.allowedRoles || sub.allowedRoles.some(name => allowedMenuNames.includes(name))
                );
                const isOpen = openSubmenu?.type === menuType && openSubmenu?.key === navKey;
                return (
                    <li key={index}>
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
                        {filteredSubItems?.length ? (
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
                                    {filteredSubItems.map((subItem, subIndex) => {
                                        const subItemKey = `${navKey}:${subItem.path || subItem.name}:${subIndex}`;
                                        const hasNestedSubItems = subItem.subItems && subItem.subItems.length > 0;
                                        
                                        // Filter nested items untuk mengecek apakah ada yang diizinkan
                                        const allowedNestedItems = hasNestedSubItems ? subItem.subItems?.filter((nestedItem) => {
                                            if (!authMenu || authMenu.length === 0) {
                                                return true;
                                            }
                                            if (!nestedItem.allowedRoles || nestedItem.allowedRoles.length === 0) {
                                                return true;
                                            }
                                            return nestedItem.allowedRoles.some(name => allowedMenuNames.includes(name));
                                        }) : [];
                                        
                                        // Jika ada nested items tapi semua tidak diizinkan, skip item ini
                                        if (hasNestedSubItems && (!allowedNestedItems || allowedNestedItems.length === 0)) {
                                            return null;
                                        }
                                        
                                        const isNestedOpen = openNestedSubmenu === subItemKey;
                                        
                                        return (
                                    <li key={subItemKey}>
                                        {hasNestedSubItems ? (
                                            <>
                                                <button
                                                    onClick={() => handleNestedSubmenuToggle(subItemKey)}
                                                    className={`menu-dropdown-item w-full text-left flex items-center justify-between ${
                                                        isNestedOpen ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                                                    }`}
                                                >
                                                    <span>{subItem.name}</span>
                                                    <ChevronDownIcon
                                                        className={`w-4 h-4 transition-transform duration-200 ${
                                                            isNestedOpen ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </button>
                                                {isNestedOpen && (
                                                    <ul className="mt-1 space-y-1 ml-4">
                                                        {allowedNestedItems?.map((nestedItem, nestedIndex) => {
                                                            if (!nestedItem.path) return null;
                                                            return (
                                                            <li key={`${subItemKey}:nested:${nestedIndex}`}>
                                                                <Link
                                                                    to={nestedItem.path}
                                                                    className={`menu-dropdown-item text-sm ${
                                                                        isSubActive(nestedItem.path)
                                                                        ? "menu-dropdown-item-active"
                                                                        : "menu-dropdown-item-inactive"
                                                                    }`}
                                                                >
                                                                    {nestedItem.name}
                                                                </Link>
                                                            </li>
                                                        )})}
                                                    </ul>
                                                )}
                                            </>
                                        ) : subItem.path ? (
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
                                        ) : null}
                                    </li>
                                    );})}
                                </ul>
                            </div>
                        ) : null}
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
                                    ""
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
