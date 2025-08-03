import React, { useState, useEffect } from "react";
import Modal from "../common/Modal/Modal";
import studyRoomService from "../../api/studyRoomService";
import styles from "./StudyRoomModal.module.scss";

function StudyRoomModal({ isOpen, onClose, studyHallId, studyRoom, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    maxNum: 1,
    thumbnail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (studyRoom) {
      setFormData({
        name: studyRoom.name || "",
        maxNum: studyRoom.maxNum || 1,
        thumbnail: studyRoom.thumbnail || "",
      });
    } else {
      setFormData({
        name: "",
        maxNum: 1,
        thumbnail: "",
      });
    }
    setError("");
  }, [studyRoom, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxNum" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (studyRoom) {
        await studyRoomService.studyRoom.updateStudyRoom(
          studyHallId,
          studyRoom.id,
          formData
        );
      } else {
        await studyRoomService.studyRoom.createStudyRoom(studyHallId, formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("스터디룸 저장 오류:", error);
      setError(error.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h2>{studyRoom ? "스터디룸 수정" : "스터디룸 생성"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">스터디룸 이름 *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="스터디룸 이름을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="maxNum">최대 인원 *</label>
            <input
              id="maxNum"
              name="maxNum"
              type="number"
              min="1"
              value={formData.maxNum}
              onChange={handleChange}
              required
              placeholder="최대 인원을 입력하세요"
            />
            <span className={styles.helper}>스터디룸을 동시에 사용할 수 있는 최대 인원입니다.</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="thumbnail">썸네일 URL</label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/room-image.jpg"
            />
            <span className={styles.helper}>스터디룸의 대표 이미지 URL을 입력하세요.</span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "저장 중..." : studyRoom ? "수정" : "생성"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default StudyRoomModal;