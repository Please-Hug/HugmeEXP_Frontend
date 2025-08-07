import PublicLayout from "../layouts/PublicLayout";
import HomePage from "../pages/home/HomePage";
import RecruitmentMapPage from "../pages/recruitment/RecruitmentMap";

export default [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/recruitment/map", element: <RecruitmentMapPage /> },
      { path: "/recruitment/map/:jobId", element: <RecruitmentMapPage /> },
      { path: "/dev-recruitment/map", element: <RecruitmentMapPage /> },
      { path: "/dev-recruitment/map/:jobId", element: <RecruitmentMapPage /> },
    ],
  },
];
