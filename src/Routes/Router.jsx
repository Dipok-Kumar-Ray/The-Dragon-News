import { createBrowserRouter } from "react-router";

import HomeLayout from "../Layouts/HomeLayout";
import Home from "../Pages/Home";
import CategoryNews from "../Pages/CategoryNews";


const router = createBrowserRouter([
  {
    path: '/',
    Component: HomeLayout,
    children: [
      { index: true, Component: Home },
      {
        path: "/category/:id",
        Component:CategoryNews,
      },
      {
        path: "/new",
        element: <h2>News Layout</h2>,
      },
      {
        path: "/*",
        element: <h2>Error404</h2>,
      },
    ],
  },
]);

export default router;
