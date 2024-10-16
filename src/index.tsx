import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './LF2/defines/defines';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  { path: '/quad_tree_test', Component: React.lazy(() => import('./Laboratory/QuadTree')) },
  { path: '/bebavior_net_test', Component: React.lazy(() => import('./Laboratory/BehaviorNet')) },
  // { path: '*', Component: React.lazy(() => import('./App')) },
  { path: '*', Component: React.lazy(() => import('./Laboratory/BehaviorNet')) },
]);
ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
reportWebVitals();
