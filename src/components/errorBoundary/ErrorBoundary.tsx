import React, { Component, ErrorInfo } from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error: ', error, errorInfo);
        this.setState({ hasError: true });
    }

    render() {
        if (this.state.hasError) {
            return (
                <main>
                    <div className="bg-gray-50 flex h-screen">
                        <div className="m-auto flex justify-center items-center flex-col">
                            <div>
                                <img src="/images/error/maintenance.svg" alt="Maintenance" />
                            </div>
                            <p className="text-Base my-6 p-2 text-slate-500 md:text-base">
                                Mohon maaf atas ketidaknyamanan anda, saat ini sistem sedang dalam perbaikan , sampai
                                waktu yang tidak ditentukan
                            </p>
                        </div>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
