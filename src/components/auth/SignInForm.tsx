import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { LoginRequest, LoginFormErrors } from "@/types/auth";

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    
    const { 
        authState,
        login, 
        clearError 
    } = useAuth();
    
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (authState.isAuthenticated) {
            navigate('/home');
        }
    }, [authState.isAuthenticated, navigate]);

    const handleInputChange = (field: keyof LoginRequest) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
        
        // Clear errors when user starts typing
        if (formErrors[field] || formErrors.general || authState.error) {
            setFormErrors({});
            clearError();
        }
    };

    const handleButtonClick = async () => {
        try {
            setFormErrors({});
            await login(formData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setFormErrors({ general: errorMessage });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await handleButtonClick();
    };

    // Use error from authState or local formErrors
    const displayError = authState.error || formErrors.general;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#dfe8f2] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <img
                        src="/motor-sights-international-logo.png"
                        alt="Motor Sights International"
                        className="mx-auto h-20 w-auto mb-6"
                    />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Sign in to your account
                    </h2>
                </div>
                <div className="bg-white rounded-lg shadow-md p-8">

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error Message */}
                        {displayError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{displayError}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <Label>
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    disabled={authState.isLoading}
                                    className={`mt-1 ${formErrors.email ? 'border-red-500' : ''}`}
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                )}
                            </div>
                            
                            <div>
                                <Label>
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative mt-1">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleInputChange('password')}
                                        disabled={authState.isLoading}
                                        className={formErrors.password ? 'border-red-500' : ''}
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                        ) : (
                                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                        )}
                                    </span>
                                </div>
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                )}
                            </div>
                            
                            <div className="flex items-center justify-end">
                                <Link
                                    to="/reset-password"
                                    className="text-sm text-gray-600 hover:text-brand-600 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            
                            <Button 
                                className="w-full mt-6" 
                                size="md"
                                disabled={authState.isLoading}
                                onClick={handleButtonClick}
                            >
                                {authState.isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </div>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-brand-500 hover:text-brand-600 font-medium hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
