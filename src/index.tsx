import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import './LF2/defines/defines';
import reportWebVitals from './reportWebVitals';
const router = createBrowserRouter([
  { path: '/quad_tree_test', Component: React.lazy(() => import('./QuadTree_index')) },
  { path: '/bebavior_net_test', Component: React.lazy(() => import('./Bebavior_index')) },
  { path: '*', Component: App },
]);
ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
reportWebVitals();
