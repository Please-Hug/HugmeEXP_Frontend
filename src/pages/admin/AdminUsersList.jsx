import React, { useState, useEffect } from 'react';
import { getUsers } from '../../api/adminService';
import UserTable from '../../components/Admin/UserTable';
import styles from './AdminUsersList.module.scss';

export default function AdminUsersList() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (page = 0) => {
    setLoading(true);
    try {
      const res = await getUsers(page);
      
      const userData = res.data.content || [];
      const pageInfo = {
        number: res.data.number || 0,
        totalPages: res.data.totalPages || 1,
        totalElements: res.data.totalElements || 0
      };
      
      setUsers(userData);
      setCurrentPage(pageInfo.number);
      setTotalPages(pageInfo.totalPages);
      setTotalElements(pageInfo.totalElements);
      
    } catch (err) {
      console.error('API 호출 실패:', err);
      setUsers([]);
      setCurrentPage(0);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      fetchUsers(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 0) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className={styles.pageButton}
        >
          이전
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`${styles.pageButton} ${i === currentPage ? styles.active : ''}`}
        >
          {i + 1}
        </button>
      );
    }

    if (currentPage < totalPages - 1) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className={styles.pageButton}
        >
          다음
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={styles.AdminUsersList}>
      <h2 className={styles.title}>전체 회원</h2>
      
      <div className={styles.stats}>
        <span>총 {totalElements}명의 회원</span>
        {totalPages > 1 && <span>페이지 {currentPage + 1} / {totalPages}</span>}
      </div>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <UserTable users={users} loading={loading} />
        </div>
        
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
}