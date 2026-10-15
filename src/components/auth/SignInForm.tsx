import { useState, useEffect, useId, useRef, SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { AuthService } from "@/services/authService";
import { LoginRequest, LoginFormErrors } from "@/types/auth";
import { EASE_OUT, fadeUp, groupStagger } from "./login/motionVariants";

const inputClass =
    "h-11 w-full rounded-lg border bg-white px-4 text-sm text-(--color-black) placeholder:text-(--login-placeholder) " +
    "transition-colors duration-200 focus:outline-none focus-visible:ring-2 " +
    "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60";

const fieldStateClass = (hasError: boolean) =>
    hasError
        ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20"
        : "border-(--login-border) hover:border-(--login-border-hover) focus-visible:border-primary focus-visible:ring-primary/20";

function FieldError({ id, message }: { id: string; message?: string }) {
    return (
        <div className="mt-1.5 min-h-5">
            <AnimatePresence initial={false}>
                {message && (
                    <motion.p
                        id={id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="text-xs text-red-600"
                    >
                        {message}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const {
        authState,
        login,
        clearError
    } = useAuth();

    const navigate = useNavigate();
    const id = useId();
    const ids = {
        email: `${id}-email`,
        emailError: `${id}-email-error`,
        password: `${id}-password`,
        passwordError: `${id}-password-error`,
        general: `${id}-general-error`,
    };

    // Redirect if already authenticated
    useEffect(() => {
        if (authState.isAuthenticated) {
            navigate('/home');
        }
    }, [authState.isAuthenticated, navigate]);

    const isBusy = authState.isLoading || isSubmitting;
    const displayError = authState.error || formErrors.general;

    const handleInputChange = (field: keyof LoginRequest) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));

        if (formErrors[field] || formErrors.general || authState.error) {
            setFormErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
            clearError();
        }
    };

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isBusy) return;

        // Same rules login() applies internally; run them here so field errors are shown.
        const validationErrors = AuthService.validateLoginForm(formData);
        if (AuthService.hasValidationErrors(validationErrors)) {
            setFormErrors(validationErrors);
            (validationErrors.email ? emailRef : passwordRef).current?.focus();
            return;
        }

        setFormErrors({});
        setIsSubmitting(true);
        try {
            await login(formData);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setFormErrors({ general: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.form
            variants={groupStagger}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col"
        >
            <AnimatePresence initial={false}>
                {displayError && (
                    <motion.div
                        key="auth-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                        className="overflow-hidden"
                    >
                        <div
                            id={ids.general}
                            role="alert"
                            className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                        >
                            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-red-500">
                                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                            </svg>
                            <p>{displayError}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={fadeUp}>
                <label htmlFor={ids.email} className="mb-2 block text-sm text-(--login-text)">
                    Email <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                    ref={emailRef}
                    id={ids.email}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={authState.isLoading}
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? ids.emailError : undefined}
                    className={`${inputClass} ${fieldStateClass(!!formErrors.email)}`}
                />
                <FieldError id={ids.emailError} message={formErrors.email} />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-1">
                <label htmlFor={ids.password} className="mb-2 block text-sm text-(--login-text)">
                    Password <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                    <input
                        ref={passwordRef}
                        id={ids.password}
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        required
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        disabled={authState.isLoading}
                        aria-invalid={!!formErrors.password}
                        aria-describedby={formErrors.password ? ids.passwordError : undefined}
                        className={`${inputClass} pr-12 ${fieldStateClass(!!formErrors.password)}`}
                    />
                    <span className="absolute inset-y-0 right-1.5 flex items-center">
                        <motion.button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            whileTap={{ scale: 0.88 }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            aria-controls={ids.password}
                            className="grid size-9 place-items-center rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={showPassword ? "shown" : "hidden"}
                                    initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                                    transition={{ duration: 0.15 }}
                                    className="grid place-items-center"
                                >
                                    {showPassword ? (
                                        <EyeIcon className="size-5 fill-gray-500" />
                                    ) : (
                                        <EyeCloseIcon className="size-5 fill-gray-500" />
                                    )}
                                </motion.span>
                            </AnimatePresence>
                        </motion.button>
                    </span>
                </div>
                <FieldError id={ids.passwordError} message={formErrors.password} />
            </motion.div>

            <motion.div variants={fadeUp} className="mt-3">
                <motion.button
                    type="submit"
                    disabled={isBusy}
                    aria-busy={isSubmitting}
                    whileTap={isBusy ? undefined : { scale: 0.985 }}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 font-main-bold text-sm tracking-wide text-white transition-colors duration-200 enabled:hover:bg-(--login-primary-hover) enabled:active:bg-(--login-primary-active) focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-(--login-bg) disabled:cursor-not-allowed disabled:bg-(--login-disabled)"
                >
                    {isSubmitting && (
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4 animate-spin">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    )}
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </motion.button>
            </motion.div>
        </motion.form>
    );
}
