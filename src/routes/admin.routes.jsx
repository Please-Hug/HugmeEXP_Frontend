import AdminLayout      from '../layouts/AdminLayout';
import AdminUsersList   from '../pages/admin/AdminUsersList';
import AdminUserDetail  from '../pages/admin/AdminUserDetail';
import AdminShopPage from "../pages/admin/AdminShopPage";
import AdminQuestPage from "../pages/admin/AdminQuestPage";

export default [
  {
    path: '/admin',
    element: <AdminLayout />,  
    children: [
      { index: true, element: <AdminUsersList /> },
      { path: 'users/:username', element: <AdminUserDetail /> },
      { path: "quest", element: <AdminQuestPage /> },
      { path: "shop", element: <AdminShopPage /> },
    ],
  },
];