// src/app/router.tsx
import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage.tsx";
import ReaderPage from "../pages/ReaderPage/ReaderPage.tsx";

export const router = createBrowserRouter(
  [
    { path: "/", element: <HomePage /> },
    { path: "/read/:translation/:book/:chapter", element: <ReaderPage /> },
  ],
  {
    // importante pro GitHub Pages quando deploy fica em /bible/
    basename: import.meta.env.BASE_URL,
  }
);
