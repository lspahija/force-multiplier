import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import {Hero} from "./components/Hero.tsx";
import {InitialDocument} from "./components/InitialDocument.tsx";
import {DocumentModification} from "./components/DocumentModification.tsx";
import {MantineProvider} from "@mantine/core";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Hero/>,
    },
    {
        path: "document",
        element: <InitialDocument/>,
    },
    {
        path: "feedback",
        element: <DocumentModification/>,
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <MantineProvider withGlobalStyles theme={{
        primaryColor: 'indigo',
        primaryShade: 8
    }}>
        <RouterProvider router={router}/>
    </MantineProvider>
)
