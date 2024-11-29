import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/index.css";
import React from "react";
import Home from "./pages/Home";
import DefaultLayout from "./layouts/DefaultLayout";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { SIDE_PANEL_PAGES } from "@chrome-extension/src/constants";

const router = createMemoryRouter(
  [
    {
      path: SIDE_PANEL_PAGES.HOME,
      errorElement: <div>Something went wrong</div>,
      element: (
        <DefaultLayout>
          <Home />
        </DefaultLayout>
      ),
    },
  ],
  {}
);

const root = createRoot(document.getElementById("root")!);
root.render(<RouterProvider router={router} />);
