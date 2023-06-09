import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import {Hero} from "./Hero.tsx";
import {Document} from "./Document.tsx";
import {Feedback} from "./Feedback.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Hero/>,
    },
    {
        path: "document",
        element: <Document/>,
    },
    {
        path: "feedback",
        element: <Feedback/>,
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <RouterProvider router={router}/>
)
