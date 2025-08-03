import React, { useState, useEffect } from "react";
import Modal from "../common/Modal/Modal";
import KakaoMapPicker from "./KakaoMapPicker";
import studyRoomService from "../../api/studyRoomService";
import styles from "./StudyHallModal.module.scss";

function StudyHallModal({ isOpen, onClose, studyHall, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    simpleAddress: "",
    address: "",
    latitude: 0,
    longitude: 0,
    thumbnail: "",
    openTime: "",
    closeTime: "",
  });
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (studyHall) {
      setFormData({
        name: studyHall.name || "",
        description: studyHall.description || "",
        simpleAddress: studyHall.simpleAddress || "",
        address: studyHall.address || "",
        latitude: studyHall.latitude || 0,
        longitude: studyHall.longitude || 0,
        thumbnail: studyHall.thumbnail || "",
        openTime: formatDateTimeLocal(studyHall.openTime),
        closeTime: formatDateTimeLocal(studyHall.closeTime),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        simpleAddress: "",
        address: "",
        latitude: 0,
        longitude: 0,
        thumbnail: "",
        openTime: "",
        closeTime: "",
      });
    }
    setError("");
  }, [studyHall, isOpen]);

  // 날짜 형식 변환 (ISO 8601 -> datetime-local)
  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 날짜 형식 변환 (datetime-local -> ISO 8601)
  const formatToISO = (dateTimeLocal) => {
    if (!dateTimeLocal) return "";
    return new Date(dateTimeLocal).toISOString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        openTime: formatToISO(formData.openTime),
        closeTime: formatToISO(formData.closeTime),
      };

      if (studyHall) {
        await studyRoomService.studyHall.updateStudyHall(studyHall.id, submitData);
      } else {
        await studyRoomService.studyHall.createStudyHall(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("스터디홀 저장 오류:", error);
      setError(error.response?.data?.message || "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapSelect = (coordinates) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      address: coordinates.address || prev.address,
      simpleAddress: coordinates.simpleAddress || prev.simpleAddress,
    }));
    setShowMapPicker(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h2>{studyHall ? "스터디홀 수정" : "스터디홀 생성"}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">이름 *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="스터디홀 이름을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="스터디홀 설명을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="simpleAddress">간단 주소 *</label>
            <input
              id="simpleAddress"
              name="simpleAddress"
              type="text"
              value={formData.simpleAddress}
              onChange={handleChange}
              required
              placeholder="예: 강남구, 서초구"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">상세 주소</label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="상세 주소를 입력하세요"
            />
          </div>

          <div className={styles.coordinateGroup}>
            <div className={styles.formGroup}>
              <label htmlFor="latitude">위도 *</label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={formData.latitude}
                onChange={handleCoordinateChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="longitude">경도 *</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={formData.longitude}
                onChange={handleCoordinateChange}
                required
              />
            </div>

            <button
              type="button"
              className={styles.mapButton}
              onClick={() => setShowMapPicker(true)}
            >
              지도에서 선택
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="thumbnail">썸네일 URL</label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className={styles.timeGroup}>
            <div className={styles.formGroup}>
              <label htmlFor="openTime">오픈 시간 *</label>
              <input
                id="openTime"
                name="openTime"
                type="datetime-local"
                value={formData.openTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="closeTime">마감 시간 *</label>
              <input
                id="closeTime"
                name="closeTime"
                type="datetime-local"
                value={formData.closeTime}
                onChange={handleChange}
                required
              />
            </div>
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
              {loading ? "저장 중..." : studyHall ? "수정" : "생성"}
            </button>
          </div>
        </form>
      </div>

      {/* 카카오 지도 선택기 */}
      {showMapPicker && (
        <KakaoMapPicker
          initialCoordinates={{
            latitude: formData.latitude,
            longitude: formData.longitude,
          }}
          onSelect={handleMapSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </Modal>
  );
}

export default StudyHallModal;