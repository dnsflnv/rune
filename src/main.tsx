import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Root } from './pages/root';
import ErrorPage from './error-page';
import { About } from './pages/about';
import { Privacy } from './pages/privacy';
import { License } from './pages/license';
import { Profile } from './pages/profile';
import Runestone from './pages/runestone';
import Runestones from './pages/runestones';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    errorElement: <ErrorPage />,
  },
  {
    path: '/about',
    element: <About />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/license',
    element: <License />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/profile',
    element: <Profile />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/runestones',
    children: [
      {
        index: true,
        element: <Runestones />,
      },
      {
        path: ':slug',
        element: <Runestone />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
