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
                                <img src="/images/maintenance.png" alt="Maintenance" />
                            </div>
                            <p className="text-center my-6 p-2 text-slate-500 md:text-base">
                                We're sorry for the inconvenience.<br />
                                Our team is currently working on essential system maintenance to improve our service. <br />
                                We'll be back online as soon as possible. We appreciate your patience
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
