import { createBrowserRouter } from "react-router";
import Root from "../Components/Home";
import HomeLayout from "../Layouts/HomeLayout";

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      { index: true, Component: Root },
      {
        path: "/auth",
        element: <h2>Authentication Layout</h2>,
      },
      {
        path: "/news",
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
