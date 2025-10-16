import { Route, Routes } from 'react-router-dom';

import Layout from '@components/layout/Layout';
import StoreWatcher from '@components/StoreWatcher';
import GlobalModal from '@components/ui/GlobalModal';
import Main from '@pages/Main';

function App() {
  return (
    <>
      <StoreWatcher />
      <GlobalModal />

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Main />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
