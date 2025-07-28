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

const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    errorElement: <ErrorPage />,
  },
  {
    path: '/about',
    Component: About,
    errorElement: <ErrorPage />,
  },
  {
    path: '/privacy',
    Component: Privacy,
    errorElement: <ErrorPage />,
  },
  {
    path: '/license',
    Component: License,
    errorElement: <ErrorPage />,
  },
  {
    path: '/profile',
    Component: Profile,
    errorElement: <ErrorPage />,
  },
  {
    path: '/stones',
    children: [
      {
        index: true,
        Component: Runestone,
      },
      {
        path: ':slug',
        Component: Runestone,
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
