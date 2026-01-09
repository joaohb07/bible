// src/app/providers.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function Providers() {
  return <RouterProvider router={router} />;
}
