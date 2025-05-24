import { Routes, Route } from 'react-router-dom'
import { Page, Main } from './components/layout'

import { 
  Landing, 
  Dashboard, 
  SelectIdioms,
  Exercise
} from './pages';

import { 
  IdiomListPage,
  IdiomImportPage,
  AudioUploadPage,
  NewIdiomExamplePage,
  NewIdiomPage
} from './pages/admin';

import AdminRoute from './components/admin/AdminRoute';
import UserRoute from './components/UserRoute';

function App() {
  return (
    <Page>
      <Main>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={
          <UserRoute>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="select" element={<SelectIdioms />} />
              <Route path="exercise" element={<Exercise />} />
            </Routes>
          </UserRoute>
          } />
        <Route path="/admin/*" element={
          <AdminRoute>
            <Routes>
              <Route path="/"                element={<div>Admin Dashboard</div>} />
              <Route path="idioms"           element={<IdiomListPage />} />
              <Route path="idiom"            element={<NewIdiomPage />} />
              <Route path="import"           element={<IdiomImportPage />} />
              <Route path="example"          element={<NewIdiomExamplePage />} />
              <Route path="example/:idiomId" element={<NewIdiomExamplePage />} />
              <Route path="audio"            element={<AudioUploadPage />} />
              <Route path="audio/:exampleId" element={<AudioUploadPage />} />
            </Routes>
          </AdminRoute>
        } />
      </Routes>
      </Main>
    </Page>
  )
}

export default App