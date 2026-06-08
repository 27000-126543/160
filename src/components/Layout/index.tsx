import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StatusBar from './StatusBar';

const Layout: React.FC = () => {
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-polar-deep">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
        <StatusBar />
      </div>
    </div>
  );
};

export default Layout;
