import React from 'react';
import { Link } from 'react-router-dom';
import styles from './UserTable.module.scss';
import emptyUserProfile from '../../assets/images/user/empty-user-profile.svg';
import api from '../../api/axiosInstance';

export default function UserTable({ users, loading }) {
  if (loading) {
    return (
      <div className={styles.UserTable}>
        <div className={styles.loadingMessage}>
          로딩 중...
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className={styles.UserTable}>
        <div className={styles.emptyMessage}>
          등록된 회원이 없습니다.
        </div>
      </div>
    );
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return `${styles.roleBadge} ${styles.admin}`;
      case 'LECTURER':
        return `${styles.roleBadge} ${styles.lecturer}`;
      case 'USER':
        return `${styles.roleBadge} ${styles.user}`;
      default:
        return styles.roleBadge;
    }
  };

  return (
    <div className={styles.UserTable}>
      <table>
        <thead>
          <tr>
            <th>프로필</th>
            <th>이름</th>
            <th>이메일</th>
            <th>역할</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <img
                  src={
                    user.profileImage
                      ? `${api.defaults.baseURL}${user.profileImage}`
                      : emptyUserProfile
                  }
                  alt={`${user.name} 프로필`}
                  className={styles.profileImage}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email || user.username || '이메일 없음'}</td>
              <td>
                <span className={getRoleBadgeClass(user.role)}>
                  {user.role}
                </span>
              </td>
              <td>
                <Link
                  to={`/admin/users/${user.username}`}
                  className={styles.actionLink}
                >
                  상세보기
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}