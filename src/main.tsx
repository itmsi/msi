import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "flatpickr/dist/flatpickr.css";
import App from './container/App';
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { AuthProvider } from './context/AuthContext.tsx';
import 'animate.css';
import ErrorBoundary from './components/errorBoundary/ErrorBoundary.tsx';
import { BrowserRouter } from "react-router";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
                <AppWrapper>
                    <BrowserRouter>
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </BrowserRouter>
                </AppWrapper>
        </ErrorBoundary>
    </StrictMode>
);
