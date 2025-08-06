import { useState, useEffect } from "react";
import Modal from "../common/Modal/Modal";
import KakaoMapPicker from "./KakaoMapPicker";
import studyRoomService from "../../api/studyRoomService";
import imageApi from "../../api/imageService";
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        openTime: formatTimeLocal(studyHall.openTime),
        closeTime: formatTimeLocal(studyHall.closeTime),
      });
      // 기존 썸네일이 있으면 미리보기로 설정
      if (studyHall.thumbnail) {
        setImagePreview(studyHall.thumbnail);
      }
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
      setImagePreview(null);
    }
    setError("");
    setImageFile(null);
  }, [studyHall, isOpen]);

  // 시간 형식 변환 (ISO 8601 -> HH:mm)
  const formatTimeLocal = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
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
    
    // 빈 값이면 0으로 설정
    if (value === '') {
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));
      return;
    }
    
    const numValue = parseFloat(value);
    
    // NaN 체크
    if (isNaN(numValue)) {
      return;
    }
    
    // 유효성 검사
    if (name === "latitude") {
      if (numValue < -90.0 || numValue > 90.0) {
        setError("위도는 -90에서 90 사이여야 합니다.");
      } else {
        setError("");
      }
    } else if (name === "longitude") {
      if (numValue < -180.0 || numValue > 180.0) {
        setError("경도는 -180에서 180 사이여야 합니다.");
      } else {
        setError("");
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // 필수 필드 검증
    if (!formData.name || !formData.name.trim()) {
      setError("이름은 필수입니다.");
      return;
    }
    
    if (!formData.simpleAddress || !formData.simpleAddress.trim()) {
      setError("간단 주소는 필수입니다.");
      return;
    }
    
    if (!formData.openTime || !formData.closeTime) {
      setError("운영 시간은 필수입니다.");
      return;
    }
    
    // 좌표 유효성 검사
    if (formData.latitude < -90.0 || formData.latitude > 90.0) {
      setError("위도는 -90에서 90 사이여야 합니다.");
      return;
    }
    
    if (formData.longitude < -180.0 || formData.longitude > 180.0) {
      setError("경도는 -180에서 180 사이여야 합니다.");
      return;
    }
    
    setLoading(true);

    try {
      let thumbnailUrl = formData.thumbnail;

      // 새로운 이미지가 선택되었으면 업로드
      if (imageFile) {
        try {
          thumbnailUrl = await handleImageUpload();
        } catch (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }
      }

      const submitData = {
        ...formData,
        thumbnail: thumbnailUrl,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
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
      if (error.response?.status === 400) {
        setError("입력 데이터에 오류가 있습니다. 모든 필드를 올바르게 입력했는지 확인해주세요.");
      } else if (error.response?.status === 403) {
        setError("관리자 권한이 필요합니다.");
      } else if (error.response?.status === 404) {
        setError("스터디홀을 찾을 수 없습니다.");
      } else {
        setError(error.response?.data?.message || "저장에 실패했습니다.");
      }
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

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("지원하지 않는 이미지 형식입니다. (JPEG, PNG, GIF, WebP만 가능)");
      return;
    }

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("이미지 파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    setImageFile(file);
    setError("");

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async () => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const response = await imageApi.upload(imageFile, 'studyhall-images');
      return response.data.imageUrl;
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      throw new Error("이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingImage(false);
    }
  };

  // 이미지 제거 핸들러
  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <h2>{studyHall ? "스터디홀 수정" : "스터디홀 생성"}</h2>
        <form onSubmit={handleSubmit} noValidate>
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
                min="-90.0"
                max="90.0"
                value={formData.latitude}
                onChange={handleCoordinateChange}
                required
                title="위도는 -90에서 90 사이여야 합니다."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="longitude">경도 *</label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                min="-180.0"
                max="180.0"
                value={formData.longitude}
                onChange={handleCoordinateChange}
                required
                title="경도는 -180에서 180 사이여야 합니다."
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
            <label htmlFor="thumbnailUpload">썸네일 이미지</label>
            <div className={styles.imageUploadSection}>
              {imagePreview ? (
                <div className={styles.imagePreviewContainer}>
                  <img src={imagePreview} alt="썸네일 미리보기" className={styles.imagePreview} />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={handleImageRemove}
                    disabled={uploadingImage || loading}
                  >
                    이미지 제거
                  </button>
                </div>
              ) : (
                <div className={styles.imageUploadBox}>
                  <input
                    id="thumbnailUpload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    disabled={uploadingImage || loading}
                  />
                  <label htmlFor="thumbnailUpload" className={styles.uploadLabel}>
                    <span className={styles.uploadIcon}>📷</span>
                    <span>이미지를 선택하세요</span>
                    <span className={styles.uploadHint}>JPEG, PNG, GIF, WebP (최대 10MB)</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className={styles.timeGroup}>
            <div className={styles.formGroup}>
              <label htmlFor="openTime">오픈 시간 *</label>
              <input
                id="openTime"
                name="openTime"
                type="time"
                value={formData.openTime}
                onChange={handleChange}
                required
                placeholder="HH:MM"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="closeTime">마감 시간 *</label>
              <input
                id="closeTime"
                name="closeTime"
                type="time"
                value={formData.closeTime}
                onChange={handleChange}
                required
                placeholder="HH:MM"
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
              {loading || uploadingImage ? "저장 중..." : studyHall ? "수정" : "생성"}
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