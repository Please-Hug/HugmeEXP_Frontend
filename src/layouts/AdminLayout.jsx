import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      </header>
      <nav className="mb-4 space-x-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `px-4 py-2 rounded ${isActive ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-100'}`
          }
        >
          회원 목록
        </NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}