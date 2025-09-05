import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Page, Main } from '../components/layout';
import { Landing, Dashboard, Preferences, Exercise, 
  Calendar, BugReport, Sandbox, About, License,
  Chat, Reports } from './index';
import { IdiomListPage, IdiomImportPage, ResetCache,
  AssignmentManagerPage, NewExamplePage, NewIdiomPage,
  SettingsPage, PromptsPage } from './admin';
import { Editor } from './editor/Editor';
import AdminRoute from '../components/admin/AdminRoute';
import EditorRoute from '../components/admin/EditorRoute';
import UserRoute from '../components/UserRoute';

// Layout wrappers
function DefaultLayout() {
  return (
    <Page>
      <Main>
        <Outlet />
      </Main>
    </Page>
  );
}

function EditorLayout() {
  return (
    <Page>
      <Main wide>
        <EditorRoute>
          <Outlet />
        </EditorRoute>
      </Main>
    </Page>
  )
}

function AppLayout() {
  return (
    <Page>
      <Main>
        <UserRoute>
          <Outlet />
        </UserRoute>
      </Main>
    </Page>
  );
}

function AdminLayout() {
  return (
    <Page>
      <Main wide>
        <AdminRoute>
          <Outlet />
        </AdminRoute>
      </Main>
    </Page>
  );
}

const router = createBrowserRouter([
  {
    element: <><Outlet /></>,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          { path: '/', element: <Landing /> },
          { path: '/about', element: <About /> },
          { path: '/license', element: <License /> },
          { path: '/chat', element: <Chat /> },
        ],
      },
      {
        path: '/editor/*',
        element: <EditorLayout />,
        children: [
          { path: 'manage',   element: <Editor /> },
        ],
      },

      {
        path: '/app/*',
        element: <AppLayout />,
        children: [
          { path: 'dashboard',   element: <Dashboard /> },
          { path: 'preferences', element: <Preferences /> },
          { path: 'exercise',    element: <Exercise /> },
          { path: 'calendar',    element: <Calendar /> },
          { path: 'sandbox',     element: <Sandbox /> },
          { path: 'reports',     element: <Reports /> },
          { path: 'bugreport',           element: <BugReport /> },
          { path: 'bugreport/:exampleID', element: <BugReport /> }
        ],
      },
      {
        path: '/admin/*',
        element: <AdminLayout />,
        children: [
          { path: 'idioms',  element: <IdiomListPage /> },
          { path: 'idiom',   element: <NewIdiomPage /> },
          { path: 'import',  element: <IdiomImportPage /> },
          { path: 'example', element: <NewExamplePage /> },
          { path: 'audio',   element: <AssignmentManagerPage /> },
          { path: 'settings',element: <SettingsPage /> },
          { path: 'prompts', element: <PromptsPage /> },
          { path: 'resetcache',  element: <ResetCache /> },
        ],
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

export default router;
