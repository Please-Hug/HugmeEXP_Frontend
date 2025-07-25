import React, { useState } from "react";
import styles from "./PasswordChangeModal.module.scss";
import api from "../../api/axiosInstance";

function PasswordChangeModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      await api.put("/api/auth/password", {
        oldPassword,
        newPassword,
      });
      alert("비밀번호가 성공적으로 변경되었습니다.");
      onClose();
    } catch (err) {
      console.error("비밀번호 변경 실패", err);
      setError(
        err.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>비밀번호 변경</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="current-password">현재 비밀번호</label>
            <input
              id="current-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="new-password">새로운 비밀번호</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirm-password">새로운 비밀번호 확인</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              변경하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordChangeModal;
