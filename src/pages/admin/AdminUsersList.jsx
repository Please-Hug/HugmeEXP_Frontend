import React, { useState, useEffect } from 'react';
import { getUsers } from '../../api/adminService';
import UserTable from '../../components/Admin/UserTable';
import styles from './AdminUsersList.module.scss';

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        console.log('API 호출 성공:', res);
        setUsers(res.data.content || []);
      } catch (err) {
        console.error('API 호출 실패:', err);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  console.log('현재 users 상태:', users);

  return (
    <div className={styles.AdminUsersList}>
      <h2 className={styles.title}>전체 회원</h2>
      <div className={styles.content}>
        <div className={styles.card}>
          <UserTable users={users} />
        </div>
      </div>
    </div>
  );
}