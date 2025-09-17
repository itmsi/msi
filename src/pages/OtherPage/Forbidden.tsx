import { Link } from "react-router-dom";

export default function Forbidden() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-6">
                    <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        Access Forbidden
                    </h2>
                    <p className="text-gray-600">
                        You don't have permission to access this page. 
                        This page is not available in your menu access.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Link 
                        to="/home" 
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
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
                
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, please contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}