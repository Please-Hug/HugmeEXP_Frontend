import AdminLayout      from '../layouts/AdminLayout';
import AdminUsersList   from '../pages/admin/AdminUsersList';
import AdminUserDetail  from '../pages/admin/AdminUserDetail';
import AdminShopPage from "../pages/admin/AdminShopPage";
import AdminQuestPage from "../pages/admin/AdminQuestPage";
import AdminStudyRoomPage from "../pages/admin/AdminStudyRoomPage";
import AdminStudyRoomReservationPage from "../pages/admin/AdminStudyRoomReservationPage";
import AdminStatsDashboard from '../pages/admin/AdminStatsDashboard';

export default [
  {
    path: '/admin',
    element: <AdminLayout />,  
    children: [
      { index: true, element: <AdminUsersList /> },
      { path: 'users/:username', element: <AdminUserDetail /> },
      { path: "quest", element: <AdminQuestPage /> },
      { path: "shop", element: <AdminShopPage /> },
      { path: "studyroom", element: <AdminStudyRoomPage /> },
      { path: "studyroom-reservation", element: <AdminStudyRoomReservationPage /> },
      { path: "stats", element: <AdminStatsDashboard /> },
    ],
  },
];