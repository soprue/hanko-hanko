import { Route, Routes } from 'react-router-dom';

import ErrorButton from '@components/dev/ErrorButton';
import Layout from '@components/layout/Layout';
import StoreWatcher from '@components/StoreWatcher';
import GlobalModal from '@components/ui/GlobalModal';
import Main from '@pages/Main';

function App() {
  return (
    <>
      <StoreWatcher />
      <GlobalModal />

      {import.meta.env.DEV && <ErrorButton />}

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Main />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
