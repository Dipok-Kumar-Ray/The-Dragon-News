import { createBrowserRouter } from "react-router";
import HomeLayout from "../Layouts/HomeLayout";
import Home from "../Pages/Home";
import CategoryNews from "../Pages/CategoryNews";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import AuthLayout from "../Layouts/AuthLayout";
import NewsDetails from "../Components/NewsDetails";
import PrivateRoute from "../provider/PrivateRoute";
import Dashboard from "../Pages/Dashboard";
import MyProfile from "../Pages/DashboardPages/MyProfile";
import RequestCharityRole from "../Pages/DashboardPages/RequestCharityRole";
import Favorites from "../Pages/DashboardPages/Favorites";
import MyReviews from "../Pages/DashboardPages/MyReviews";
import TransactionHistory from "../Pages/DashboardPages/TransactionHistory";

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomeLayout,
    children: [
      // { index: true, Component: Home },
      {
        path:'',
        element:<Home></Home>,
      },
      {
        path: "/category/:id",
        Component: CategoryNews,
        loader: () => fetch("/news.json"),
      },
      {
        path: "/*",
        element: <h2>Error404</h2>,
      },

    ],
  },

  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      {
        path: "/auth/login",
        Component: Login,
      },
      {
        path: "/auth/register",
        Component: Register,
      },
    ],
  },

  {
    path:'/news-details/:id',
    loader:() => fetch('/news.json'),
   element: <PrivateRoute>
    <NewsDetails></NewsDetails>
   </PrivateRoute>,
  },

  {
    path: "/dashboard",
    element: <PrivateRoute>
      <Dashboard />
    </PrivateRoute>,
    children: [
      {
        path: "profile",
        element: <MyProfile />
      },
      {
        path: "request-charity",
        element: <RequestCharityRole />
      },
      {
        path: "favorites",
        element: <Favorites />
      },
      {
        path: "reviews",
        element: <MyReviews />
      },
      {
        path: "transactions",
        element: <TransactionHistory />
      }
    ]
  },
]);

export default router;
