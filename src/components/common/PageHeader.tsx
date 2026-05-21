import Button from '@/components/ui/button/Button';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    backPath: string;
    subtitle?: string | null;

    // Slot untuk konten kanan (badge, tombol, dll)
    actions?: React.ReactNode;
}

export default function PageHeader({ title, backPath, subtitle, actions }: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between lg:h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-1 w-full">
                <Button
                    variant="outline"
                    onClick={() => navigate(backPath)}
                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                >
                    <MdKeyboardArrowLeft size={20} />
                </Button>
                <div className="border-l border-gray-300 h-6 mx-3"></div>

                <div className="flex items-center gap-4 justify-between w-full lg:flex-row flex-col">
                    <div>
                        <h1 className="ms-2 font-primary-bold font-normal text-xl">{title}</h1>
                        {subtitle && <p className="ms-2 text-sm text-gray-600">{subtitle}</p>}
                    </div>

                    {actions && (
                        <div className="capitalize ms-2 flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
