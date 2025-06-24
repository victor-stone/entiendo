import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Page, Main } from '../components/layout';
import { Landing, Dashboard, Preferences, Exercise, 
  Calendar, BugReport, Sandbox, About, License } from './index';
import { IdiomListPage, IdiomImportPage, ResetCache,
  AudioUploadPage, NewExamplePage, NewIdiomPage,
  SettingsPage, PromptsPage } from './admin';
import AdminRoute from '../components/admin/AdminRoute';
import UserRoute from '../components/UserRoute';

const router = createBrowserRouter([
  {
    element: <Page><Main><Outlet /></Main></Page>,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/about', element: <About /> },
      { path: '/license', element: <License /> },
      {
        path: '/app/*',
        element: <UserRoute><Outlet /></UserRoute>,
        children: [
          { path: 'dashboard',   element: <Dashboard /> },
          { path: 'preferences', element: <Preferences /> },
          { path: 'exercise',    element: <Exercise /> },
          { path: 'calendar',    element: <Calendar /> },
          { path: 'sandbox',     element: <Sandbox /> },
          { path: 'bugreport',   element: <BugReport /> }
        ],
      },
      {
        path: '/admin/*',
        element: <AdminRoute><Outlet /></AdminRoute>,
        children: [
          { path: '',        element: <div>Admin Dashboard</div> },
          { path: 'idioms',  element: <IdiomListPage /> },
          { path: 'idiom',   element: <NewIdiomPage /> },
          { path: 'import',  element: <IdiomImportPage /> },
          { path: 'example', element: <NewExamplePage /> },
          { path: 'audio',   element: <AudioUploadPage /> },
          { path: 'settings',element: <SettingsPage /> },
          { path: 'prompts', element: <PromptsPage /> },
          { path: 'resetcache',  element: <ResetCache /> },
          { path: 'example/:idiomId', element: <NewExamplePage /> },
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
