import React, { useState } from 'react';
import DateColumnDemo from '@/components/demo/DateColumnDemo';
import ColumnUtilsDemo from '@/components/demo/ColumnUtilsDemo';

const TableDemoPage: React.FC = () => {
    const [activeDemo, setActiveDemo] = useState<'date' | 'full'>('date');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Table Components Demo</h1>
                            <p className="text-gray-600">Interactive demonstration of reusable table components</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveDemo('date')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeDemo === 'date'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Date Column Demo
                            </button>
                            <button
                                onClick={() => setActiveDemo('full')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeDemo === 'full'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Full Features Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Content */}
            <div className="max-w-7xl mx-auto">
                {activeDemo === 'date' && <DateColumnDemo />}
                {activeDemo === 'full' && <ColumnUtilsDemo />}
            </div>

            {/* Footer */}
            <div className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-600">
                        <p className="mb-2">Reusable Table Components for React Applications</p>
                        <div className="flex justify-center space-x-4 text-sm">
                            <span>✅ Server-side pagination</span>
                            <span>✅ Custom styling themes</span>
                            <span>✅ Column utilities</span>
                            <span>✅ TypeScript support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableDemoPage;