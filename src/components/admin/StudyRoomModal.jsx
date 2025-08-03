import { useState, useEffect } from "react";
import Modal from "../common/Modal/Modal";
import studyRoomService from "../../api/studyRoomService";
import imageApi from "../../api/imageService";
import styles from "./StudyRoomModal.module.scss";

function StudyRoomModal({ isOpen, onClose, studyHallId, studyRoom, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    maxNum: 1,
    thumbnail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (studyRoom) {
      setFormData({
        name: studyRoom.name || "",
        maxNum: studyRoom.maxNum || 1,
        thumbnail: studyRoom.thumbnail || "",
      });
      // 기존 썸네일이 있으면 미리보기로 설정
      if (studyRoom.thumbnail) {
        setImagePreview(studyRoom.thumbnail);
      }
    } else {
      setFormData({
        name: "",
        maxNum: 1,
        thumbnail: "",
      });
      setImagePreview(null);
    }
    setError("");
    setImageFile(null);
  }, [studyRoom, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxNum" ? parseInt(value) || 1 : value,
    }));
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
      const response = await imageApi.upload(imageFile, 'studyroom-images');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      };

      if (studyRoom) {
        await studyRoomService.studyRoom.updateStudyRoom(
          studyHallId,
          studyRoom.id,
          submitData
        );
      } else {
        await studyRoomService.studyRoom.createStudyRoom(studyHallId, submitData);
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
            <span className={styles.helper}>스터디룸의 대표 이미지를 업로드하세요.</span>
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
              {loading || uploadingImage ? "저장 중..." : studyRoom ? "수정" : "생성"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default StudyRoomModal;