import React from 'react';
import { Link } from 'react-router-dom';
import defaultProfileIcon from '../../assets/images/user/empty-user-profile.svg';
import styles from './UserTable.module.scss';

export default function UserTable({ users }) {
  // users가 배열이 아니면 로딩 메시지나 빈 상태 표시
  if (!Array.isArray(users)) {
    return <p className={styles.loadingMessage}>회원 목록을 불러오는 중입니다…</p>;
  }

  if (users.length === 0) {
    return <p className={styles.emptyMessage}>회원이 없습니다.</p>;
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return `${styles.roleBadge} ${styles.admin}`;
      case 'LECTURER':
        return `${styles.roleBadge} ${styles.lecturer}`;
      default:
        return `${styles.roleBadge} ${styles.user}`;
    }
  };

  return (
    <div className={styles.UserTable}>
      <table>
        <thead>
          <tr>
            <th>프로필</th>
            <th>ID</th>
            <th>이름</th>
            <th>아이디</th>
            <th>권한</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <img
                  src={user.profileImage || defaultProfileIcon}
                  alt={`${user.username} 프로필`}
                  className={styles.profileImage}
                />
              </td>
              <td>{user.id}</td>
              <td>{user.name || user.username}</td>
              <td>{user.username || '아이디 없음'}</td>
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