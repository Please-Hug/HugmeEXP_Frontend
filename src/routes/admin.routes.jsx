import AdminLayout      from '../layouts/AdminLayout';
import AdminUsersList   from '../pages/admin/AdminUsersList';
import AdminUserDetail  from '../pages/admin/AdminUserDetail';

export default [
  {
    path: '/admin',
    element: <AdminLayout />,  
    children: [
      { index: true, element: <AdminUsersList /> },
      { path: 'users/:username', element: <AdminUserDetail /> },
    ],
  },
];