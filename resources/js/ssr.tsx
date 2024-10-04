import { Ziggy as ziggy } from '@/ziggy'
import { createInertiaApp } from '@inertiajs/react'
import createServer from '@inertiajs/react/server'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import ReactDOMServer from 'react-dom/server'
import { route, RouteName, Config, RouteParams } from 'ziggy-js'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

// Define the structure for ZiggyProps to match the expected structure
interface ZiggyProps {
    location: {
        host?: string;
        pathname?: string;
        search?: string;
    };
    url: string;
    defaults: Record<string, any>;
    routes: Record<string, any>;
    port?: number | null;
}

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} / ${appName}` : appName),
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        setup: ({ App, props }) => {
            const ziggyProps = page.props.ziggy as ZiggyProps;

            // Use the existing route function without redeclaring it
            const customRoute = <T extends RouteName>(
                name: T,
                params?: RouteParams<T>,
                absolute?: boolean
            ) => route(name, params, absolute, {
                ...ziggy,
                location: ziggyProps.location, // Ensure location matches the expected structure
                routes: ziggyProps.routes // Use the routes from ziggyProps
            });

            return <App {...props} />
        }
    })
)