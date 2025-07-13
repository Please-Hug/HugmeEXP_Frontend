import React from 'react';
import { Link } from 'react-router-dom';
import defaultProfileIcon from '../../assets/images/user/empty-user-profile.svg';

export default function UserTable({ users }) {
  // users가 배열이 아니면 로딩 메시지나 빈 상태 표시
  if (!Array.isArray(users)) {
    return <p>회원 목록을 불러오는 중입니다…</p>;
  }

  if (users.length === 0) {
    return <p>회원이 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">프로필</th>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">이름</th>
            <th className="px-4 py-2 text-left">이메일</th>
            <th className="px-4 py-2 text-left">권한</th>
            <th className="px-4 py-2 text-left">액션</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">
                <div className="flex items-center">
                  <img
                    src={user.profileImage || defaultProfileIcon}
                    alt={`${user.username} 프로필`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
              </td>
              <td className="px-4 py-2">{user.id}</td>
              <td className="px-4 py-2">{user.name || user.username}</td>
              <td className="px-4 py-2">{user.email || '이메일 없음'}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user.role === 'LECTURER' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-2">
                <Link
                  to={`/admin/users/${user.username}`}
                  className="text-blue-500 hover:text-blue-700"
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