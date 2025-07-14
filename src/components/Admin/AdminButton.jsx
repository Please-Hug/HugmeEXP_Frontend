import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminButton.module.scss';

export default function AdminButton() {
  return (
    <div className={styles.AdminButton}>
      <Link to="/admin" className={styles.button}>
        <span className={styles.icon}>⚙️</span>
        관리자 페이지
      </Link>
    </div>
  );
}