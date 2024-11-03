import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/index.css";
import React from "react";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import DefaultLayout from "./layouts/DefaultLayout";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

const router = createMemoryRouter(
  [
    {
      path: "/",
      element: (
        <DefaultLayout>
          <Home />
        </DefaultLayout>
      ),
    },
    {
      path: "/settings",
      element: (
        <DefaultLayout>
          <Settings />
        </DefaultLayout>
      ),
    },
  ],
  {}
);

const root = createRoot(document.getElementById("root")!);
root.render(<RouterProvider router={router} />);
