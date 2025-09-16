import { JSX, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Client from ".";
import { routes, TAppRoute } from "@/Routes";
import LoadingSpinner from "@/components/common/Loading";

const ClientRoutes = () => {
    const renderElement = (
        route: TAppRoute,
        parentLayout?: React.ComponentType<{ children: React.ReactNode }>
    ): JSX.Element => {
        const {
            layout: Layout,
            component: Component,
            isProtected,
            isUnProtected,
            roles,
        } = route;

        // fallback layout ke parent kalau subRoute nggak punya
        const EffectiveLayout = Layout ?? parentLayout;

        let element = <Component />;

        if (EffectiveLayout) {
            element = <EffectiveLayout>{element}</EffectiveLayout>;
        }

        return isProtected || isUnProtected || roles?.length ? (
            <Client
                isProtected={isProtected}
                isUnProtected={isUnProtected}
                roles={roles}
            >
                {element}
            </Client>
            ) : (
            element
        );
    };

    const getRoutes = (): { path: string; element: JSX.Element }[] => {
        const routeList: { path: string; element: JSX.Element }[] = [];

        routes.forEach((route) => {
            // 1. selalu daftarin parent
            const parentElement = renderElement(route);
            routeList.push({ path: route.path, element: parentElement });

            // 2. daftarin semua subRoutes (kalau ada)
            if (route.subRoutes && route.subRoutes.length > 0) {
                route.subRoutes.forEach((subRoute) => {
                const fullPath = `${route.path}${subRoute.path}`;
                const subElement = renderElement(subRoute, route.layout);
                routeList.push({ path: fullPath, element: subElement });
                });
            }
        });

        return routeList;
    };

    const routeList = getRoutes();

    return (
        <Suspense
            fallback={
                <div className="w-full h-[100dvh] flex justify-center items-center">
                <LoadingSpinner />
                </div>
            }
        >
            <Routes>
                {routeList.map((route, i) => (
                    <Route key={i} path={route.path} element={route.element} />
                ))}
            </Routes>
        </Suspense>
    );
};

export default ClientRoutes;
