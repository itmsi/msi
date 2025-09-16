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
        <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Sign In
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your email and password to sign in!
                        </p>
                    </div>
                    <div>
                        <form onSubmit={handleSubmit}>
                            {/* General Error Message */}
                            {displayError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{displayError}</p>
                                </div>
                            )}
                            
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        Email <span className="text-error-500">*</span>{" "}
                                    </Label>
                                    <Input 
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleInputChange('email')}
                                        disabled={authState.isLoading}
                                        className={formErrors.email ? 'border-red-500' : ''}
                                    />
                                    {formErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>
                                        Password <span className="text-error-500">*</span>{" "}
                                    </Label>
                                    <div className="relative">
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
                                <div className="flex items-center justify-between">
                                    <Link
                                        to="/reset-password"
                                        className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div>
                                    <Button 
                                        className="w-full" 
                                        size="sm"
                                        disabled={authState.isLoading}
                                        onClick={handleButtonClick}
                                    >
                                        {authState.isLoading ? 'Signing in...' : 'Sign in'}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-5">
                            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                                Don&apos;t have an account? {""}
                                <Link
                                    to="/signup"
                                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                >
                                Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
