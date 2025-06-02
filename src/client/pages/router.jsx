import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Page, Main } from '../components/layout';
import { Landing, Dashboard, Preferences, Exercise, Calendar, BugReport } from './index';
import { IdiomListPage, IdiomImportPage, AudioUploadPage, NewIdiomExamplePage, NewIdiomPage } from './admin';
import AdminRoute from '../components/admin/AdminRoute';
import UserRoute from '../components/UserRoute';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';

const router = createBrowserRouter([
  {
    element: <Page><Main><Outlet /></Main></Page>,
    children: [
      { path: '/', element: <Landing /> },
      {
        path: '/app/*',
        element: <UserRoute><Outlet /></UserRoute>,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'preferences', element: <Preferences /> },
          { path: 'exercise', element: <Exercise /> },
          { path: 'calendar', element: <Calendar /> },
          { path: 'bugreport', element: <BugReport /> },
        ],
      },
      {
        path: '/admin/*',
        element: <AdminRoute><Outlet /></AdminRoute>,
        children: [
          { path: '', element: <div>Admin Dashboard</div> },
          { path: 'idioms', element: <IdiomListPage /> },
          { path: 'idiom', element: <NewIdiomPage /> },
          { path: 'import', element: <IdiomImportPage /> },
          { path: 'example', element: <NewIdiomExamplePage /> },
          { path: 'example/:idiomId', element: <NewIdiomExamplePage /> },
          { path: 'audio', element: <AudioUploadPage /> },
          { path: 'audio/:exampleId', element: <AudioUploadPage /> },
        ],
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true, // Enables relative paths in nested routes
    v7_fetcherPersist: true,   // Retains fetcher state during navigation
    v7_normalizeFormMethod: true, // Normalizes form methods (e.g., POST or GET)
    v7_partialHydration: true, // Supports partial hydration for server-side rendering
    v7_skipActionErrorRevalidation: true, // Prevents revalidation when action errors occur
  }
});

export default router;
