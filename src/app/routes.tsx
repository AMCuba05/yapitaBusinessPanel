import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/Dashboard";
import BusinessConfig from "./pages/BusinessConfig";
import Cards from "./pages/Cards";
import Promotions from "./pages/Promotions";
import Rewards from "./pages/Rewards";
import Customers from "./pages/Customers";
import Cashiers from "./pages/Cashiers";
import Layout from "./components/Layout";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "config", Component: BusinessConfig },
          { path: "cards", Component: Cards },
          { path: "promotions", Component: Promotions },
          { path: "rewards", Component: Rewards },
          { path: "customers", Component: Customers },
          { path: "cashiers", Component: Cashiers },
        ],
      },
    ],
  },
]);
