import { Outlet } from 'react-router-dom';

import Header from '@components/layout/Header';

function Layout() {
  return (
    <div className='min-h-dvh overflow-hidden'>
      <Header />
      <Outlet />
    </div>
  );
}

export default Layout;
