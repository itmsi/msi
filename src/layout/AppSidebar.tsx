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
import { useLanguage } from "@/components/lang/useLanguage";
import { menuTranslations } from "@/components/lang/menuTranslations";
import { TbTopologyStar3, TbReport } from "react-icons/tb";

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

const AppSidebar: React.FC = () => {
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const location = useLocation();
    const { menu: authMenu } = useAuth();
    const { lang, langField, buildPath } = useLanguage(menuTranslations);
    
    const allowedMenuNames = useMemo(
        () => authMenu?.map(menu => menu.name) || [],
        [authMenu]
    );

    const navItems: NavItem[] = useMemo(() => [
        {
            icon: <GridIcon />,
            name: "Dashboard",
            allowedRoles: ['ADMIN'],
            subItems: [{ name: "Main", path: buildPath("/home"), allowedRoles: ['ADMIN'], }],
        },
        {
            name: "Power BI",
            icon: <GrLineChart />,
            allowedRoles: ['Dashboard Power BI', 'Manage Power BI', 'Category Power BI'],
            subItems: [
                { name: "Dashboard", path: buildPath("/power-bi/dashboard"), allowedRoles: ['Dashboard Power BI'], },
                { name: "Category", path: buildPath("/power-bi/category"), allowedRoles: ['Category Power BI'], },
                { name: "Manage", path: buildPath("/power-bi/manage"), allowedRoles: ['Manage Power BI'], },
            ],
        },
        {
            name: "Quotation",
            icon: <GrDocumentVerified />,
            allowedRoles: ['Product Quotation', 'Accessories Quotation', 'Manage Quotation', 'TNC Quotation', 'Customer Quotation', 'Bank Quotation', 'Island'],
            subItems: [
                { name: "Manage", path: buildPath("/quotations/manage"), allowedRoles: ['Manage Quotation'], },
                { name: "Product", path: buildPath("/quotations/products"), allowedRoles: ['Product Quotation'], },
                { name: "Accessories", path: buildPath("/quotations/accessories"), allowedRoles: ['Accessories Quotation'], },
                { name: "Term Condition", path: buildPath("/quotations/term-condition"), allowedRoles: ['TNC Quotation'], },
                {
                    name: "Administration",
                    subItems: [
                        { 
                            name: "Customers", 
                            path: buildPath("/quotations/administration/customers"), 
                            allowedRoles: ['Customer Quotation']
                        },
                        { 
                            name: "Bank Accounts", 
                            path: buildPath("/quotations/administration/bank-accounts"), 
                            allowedRoles: ['Bank Quotation']
                        },
                        { 
                            name: "Regions", 
                            path: buildPath("/quotations/administration/islands"), 
                            allowedRoles: ['Island']
                        }
                    ],
                },
            ],
        },
        {
            name: "Quotation ITI",
            icon: <GrDocumentVerified />,
            allowedRoles: ['Product ITI Quotation', 'Accessories ITI Quotation', 'Manage ITI Quotation', 'TNC ITI Quotation', 'Customer ITI Quotation', 'Bank ITI Quotation', 'Island ITI'],
            subItems: [
                { name: "Manage", path: buildPath("/quotations-iti/manage"), allowedRoles: ['Manage ITI Quotation'], },
                { name: "Product", path: buildPath("/quotations-iti/products"), allowedRoles: ['Product ITI Quotation'], },
                { name: "Accessories", path: buildPath("/quotations-iti/accessories"), allowedRoles: ['Accessories ITI Quotation'], },
                { name: "Term Condition", path: buildPath("/quotations-iti/term-condition"), allowedRoles: ['TNC ITI Quotation'], },
                {
                    name: "Administration",
                    subItems: [
                        { 
                            name: "Customers", 
                            path: buildPath("/quotations-iti/administration/customers"), 
                            allowedRoles: ['Customer ITI Quotation']
                        },
                        { 
                            name: "Bank Accounts", 
                            path: buildPath("/quotations-iti/administration/bank-accounts"), 
                            allowedRoles: ['Bank ITI Quotation']
                        },
                        { 
                            name: "Regions", 
                            path: buildPath("/quotations-iti/administration/islands"), 
                            allowedRoles: ['Island']
                        }
                    ],
                },
            ],
        },
        {
            name: "Return on Equity",
            icon: <GiChart />,
            allowedRoles: ['Manage ROA ROE Calculate', 'Setting ROA ROE Calculate'],
            path: buildPath("/roe-roa-calculator/manage")
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
                'User Management CRM',
                'Project CRM',
                'Division CRM'
            ],
            subItems: [
                { name: "Area Structure", path: buildPath("/crm/area-structure"), allowedRoles: ['Area Structure CRM'] },
                { name: "IUP Management", path: buildPath("/crm/iup-management"), allowedRoles: ['IUP Management CRM'] },
                { name: "Contractors", path: buildPath("/crm/contractors"), allowedRoles: ['Contractors CRM'] },
                { name: "Activities", path: buildPath("/crm/activity"), allowedRoles: ['Activities CRM'] },
                { name: "Projects", path: buildPath("/crm/project"), allowedRoles: ['Project CRM'] },
                { name: "User Management", path: buildPath("/crm/user-management"), allowedRoles: ['User Management CRM'] },
                { name: "Division", path: buildPath("/crm/manage-division"), allowedRoles: ['Division CRM'] }
            ],
        },
        {
            name: "NetSuite",
            icon: <TbReport />,
            allowedRoles: [
                'Purchase Orders Netsuite', 
            ],
            subItems: [
                { name: "Purchase Orders", path: "/netsuite/purchase-order", allowedRoles: ['Purchase Orders Netsuite'] },
            ],
        }
    ], [buildPath]);

    const othersItems: NavItem[] = useMemo(() => [
        {
            icon: <PlugInIcon />,
            name: "Authentication",
            allowedRoles: ['Sign In', 'Sign Up'], // Kosongkan karena tidak ada di auth_menu
            subItems: [
                { name: "Sign In", path: buildPath("/signin"), allowedRoles: ['Sign In'], },
                { name: "Sign Up", path: buildPath("/signup"), allowedRoles: ['Sign Up'], },
            ],
        },
        {
            icon: <UserIcon />,
            name: "Employee",
            subItems: [
                {
                    name: "Employees",
                    path: buildPath("/employees"),
                    allowedRoles: ['Employees'],
                },
                {
                    name: "Companies",
                    path: buildPath("/companies"),
                    allowedRoles: ['Companies'],
                },
                {
                    name: "Departments",
                    path: buildPath("/departments"),
                    allowedRoles: ['Departments'],
                },
                {
                    name: "Users",
                    path: buildPath("/users"),
                    allowedRoles: ['Users'],
                },
                {
                    name: "Positions",
                    path: buildPath("/position"),
                    allowedRoles: ['Positions'],
                },
                {
                    name: "Roles",
                    path: buildPath("/roles"),
                    allowedRoles: ['Roles'],
                },
                { 
                    name: "Menu", 
                    path: buildPath("/menu"), 
                    allowedRoles: ['Menu'], 
                },
                { 
                    name: "Sign Up", 
                    path: buildPath("/signup"), 
                    allowedRoles: ['Sign Up'], 
                },
            ],
        },
    ], [buildPath]);

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
                return !item.allowedRoles || item.allowedRoles.length === 0;
            }
            if (!item.allowedRoles || item.allowedRoles.length === 0) {
                return true;
            }
            return item.allowedRoles.some(name => allowedMenuNames.includes(name));
        }),
        [allowedMenuNames, authMenu, navItems, lang]
    );

    const othersFiltered = useMemo(
        () => othersItems.filter((item) => {
            if (!authMenu || authMenu.length === 0) {
                return !item.allowedRoles || item.allowedRoles.length === 0;
            }
            if (!item.allowedRoles || item.allowedRoles.length === 0) {
                return true;
            }
            return item.allowedRoles.some(name => allowedMenuNames.includes(name));
        }),
        [allowedMenuNames, authMenu, othersItems, lang]
    );

    // Helper function untuk ekstrak pathname dari URL yang mungkin punya search params
    const extractPathname = useCallback((url: string): string => {
        try {
            return new URL(url, window.location.origin).pathname;
        } catch {
            // Fallback jika URL parsing gagal
            return url.split('?')[0];
        }
    }, []);

    const isActive = useCallback(
        (path: string) => {
            const pathOnly = extractPathname(path);
            
            if (pathOnly === location.pathname) {
                return true;
            }
            
            const normalizedPath = pathOnly.endsWith('/') ? pathOnly : pathOnly + '/';
            const normalizedCurrentPath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
            
            return normalizedCurrentPath.startsWith(normalizedPath);
        },
        [location.pathname, extractPathname]
    );

    const isSubActive = useCallback((subPath: string) => {
        const pathOnly = extractPathname(subPath);
        
        if (pathOnly === location.pathname) {
            return true;
        }
        const normalizedSubPath = pathOnly.endsWith('/') ? pathOnly : pathOnly + '/';
        const normalizedCurrentPath = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
        
        return normalizedCurrentPath.startsWith(normalizedSubPath);
    }, [location.pathname, extractPathname]);

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
    }, [location.pathname, mainFiltered, othersFiltered]);
    
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
                    (sub) => {
                        if (!authMenu || authMenu.length === 0) {
                            return !sub.allowedRoles || sub.allowedRoles.length === 0;
                        }
                        return !sub.allowedRoles || sub.allowedRoles.some(name => allowedMenuNames.includes(name));
                    }
                );
                const isOpen = openSubmenu?.type === menuType && openSubmenu?.key === navKey;
                return (
                    <li key={index}>
                        {filteredSubItems?.length ? (
                            <button
                                onClick={() => handleSubmenuToggle(menuType, nav)}
                                className={`menu-item group ${
                                    isOpen
                                    ? "menu-item-active"
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
                                    <span className="menu-item-text">{langField(nav.name)}</span>
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
                                        isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
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
                                        <span className={`menu-item-text`}>{langField(nav.name)}</span>
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
                                                return !nestedItem.allowedRoles || nestedItem.allowedRoles.length === 0;
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
                                                    <span>{langField(subItem.name)}</span>
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
                                                                    {langField(nestedItem.name)}
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
                                                {langField(subItem.name)}
                                            </Link>
                                        ) : null}
                                    </li>
                                    );})}
                                </ul>
                            </div>
                        ) : null}
                    </li>
                )
            })}
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
