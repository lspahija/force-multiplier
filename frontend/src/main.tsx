import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider,} from "react-router-dom";
import {Hero} from "./components/Hero.tsx";
import {Document} from "./components/Document.tsx";
import {Feedback} from "./components/Feedback.tsx";

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
