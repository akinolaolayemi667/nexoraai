import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@/styles/globals.css";
import { MotionProvider, ToastProvider } from "@/components/ui";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </MotionProvider>
  </StrictMode>,
);
