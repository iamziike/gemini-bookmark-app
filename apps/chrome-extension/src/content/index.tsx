import App from "./scripts/components/App";
import { createRoot } from "react-dom/client";

window.addEventListener("load", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  root.render(<App />);
});
