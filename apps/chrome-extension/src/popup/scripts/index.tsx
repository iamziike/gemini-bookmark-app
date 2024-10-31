import "bootstrap/dist/css/bootstrap.min.css";
import React, { StrictMode } from "react";
import App from "./components/App";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
