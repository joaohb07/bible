// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage.tsx";
import ReaderPage from "../pages/ReaderPage/ReaderPage.tsx";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(
  [
    { path: "/", element: <HomePage /> },
    { path: "/read/:translation/:book/:chapter", element: <ReaderPage /> },
  ],
  { basename: base }
);

