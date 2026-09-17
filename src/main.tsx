import "virtual:uno.css";

import { StrictMode } from "react";

import { hydrateRoot } from "react-dom/client";

import App from "./App";

import { destinations, hotels, posts } from "./data";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

hydrateRoot(
  rootElement,
  <StrictMode>
    <App destinations={destinations} hotels={hotels} posts={posts} />
  </StrictMode>,
);
