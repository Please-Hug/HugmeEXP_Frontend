import React, { useState, useEffect } from 'react';
import { getUsers }  from '../../api/adminService';
import UserTable from '../../components/Admin/UserTable';

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
    <div>
      <h2 className="text-xl font-semibold mb-4">전체 회원</h2>
      <UserTable users={users} />
    </div>
  );
}