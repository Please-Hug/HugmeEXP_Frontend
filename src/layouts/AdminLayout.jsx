import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useUserStore from '../stores/userStore';
import useTokenPayload from '../stores/tokenPayloadStore';
import { getCurrentUser } from '../api/userService';
import { jwtDecode } from 'jwt-decode';
import styles from './AdminLayout.module.scss';
import { FaUsers, FaHouse } from 'react-icons/fa6'; // 아이콘 import 추가

export default function AdminLayout() {
  const userInfo = useUserStore((state) => state.userInfo);
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const setTokenPayload = useTokenPayload((state) => state.setTokenPayload);
  const navigate = useNavigate();

  // MainLayout과 동일한 사용자 정보 로딩 로직
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = jwtDecode(token);
        // 토큰 만료 체크
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.clear();
          navigate("/login", { replace: true });
          return;
        }
        setTokenPayload(payload);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    }
  }, [setTokenPayload]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getCurrentUser();
        setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login", { replace: true });
        }
      }
    };
    fetchUserData();
  }, [setUserInfo, navigate]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 관리자 권한 확인
  useEffect(() => {
    if (userInfo && userInfo.role !== 'ADMIN') {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, userInfo]);

  if (!userInfo) {
    return <div className={styles.loadingMessage}>로딩 중...</div>;
  }

  return (
    <div className={styles.AdminLayout}>
      {/* 사이드바 */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>관리자 대시보드</h2>
          <div className={styles.adminInfo}>
            <span className={styles.adminName}>{userInfo.name}</span>
            <span className={styles.adminRole}>관리자</span>
          </div>
        </div>
        
        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>
              <FaUsers />
            </span>
            회원 관리
          </NavLink>
          
          <NavLink
            to="/dashboard"
            className={styles.navItem}
          >
            <span className={styles.navIcon}>
              <FaHouse />
            </span>
            메인 대시보드
          </NavLink>
        </nav>
      </div>

      {/* 메인 컨텐츠 */}
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.breadcrumb}>
            <span>관리자</span>
            <span> / </span>
            <span>회원 관리</span>
          </div>
        </div>
        
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}