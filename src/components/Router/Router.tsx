import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { HomeLayout } from '../HomeLayout/HomeLayout'
import { NextActionsPage } from '../NextActionsPage/NextActionsPage'
import { ConcernsPage } from '../ConcernsPage/ConcernsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [
      { path: '/', element: <Navigate to="next-actions" replace /> },
      {
        path: 'next-actions',
        element: <NextActionsPage />,
      },
      { path: 'concerns', element: <ConcernsPage /> },
    ],
  },
])

export const Router = () => <RouterProvider router={router} />
