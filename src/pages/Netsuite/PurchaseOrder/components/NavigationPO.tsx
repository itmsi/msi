import { LuLayoutDashboard, LuShoppingCart } from 'react-icons/lu';
import { NavLink } from 'react-router-dom';

export default function NavigationPO() {
    const navItems = [
        { to: '/netsuite/purchase-order', label: 'Dashboard', icon: LuLayoutDashboard, end: true },
        { to: '/netsuite/purchase-order/manage', label: 'Manage Purchase Order', icon: LuShoppingCart, end: true },
    ];
  return (
    <div className="flex-1 flex flex-col w-full mx-auto">
        {/* Pill Navigation */}
        <nav className="inline-flex items-center gap-1 bg-[#dfe8f2] shadow-sm rounded-full p-1 mb-3 self-start">
        {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap ${isActive
                        ? 'bg-white text-[#0253a5] font-primary-bold shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#0253a5]' : 'text-gray-400'}`} />
                    {label}
                    </>
                )}
            </NavLink>
        ))}
        </nav>
    </div>
  )
}
