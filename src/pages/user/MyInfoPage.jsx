import React, { useState, useRef, useEffect } from "react";
import styles from "./MyInfoPage.module.scss";
import emptyUserProfile from "../../assets/images/user/empty-user-profile.svg";
import { FaPen, FaTrash, FaUpload } from "react-icons/fa6";
import api from "../../api/axiosInstance.js";
import PasswordChangeModal from "../../components/user/PasswordChangeModal.jsx";

function MyInfoPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImg, setProfileImg] = useState(emptyUserProfile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    api
      .get("/api/v1/user")
      .then((res) => {
        const data = res.data.data;
        setName(data.name);
        setDescription(data.description || "");
        setPhone(data.phoneNumber);
        setProfileImg(
          data.profileImage
            ? `${api.defaults.baseURL}${data.profileImage}`
            : emptyUserProfile
        );
      })
      .catch((err) => {
        console.error("유저 정보 로딩 실패", err);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("jpg, jpeg, png, webp 형식의 이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/v1/profileImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedPath = res.data.data.profileImage;
      setProfileImg(`${api.defaults.baseURL}${uploadedPath}`);
      setMenuOpen(false);
    } catch (err) {
      console.error("프로필 이미지 업로드 실패", err);
      alert("프로필 이미지 업로드 중 문제가 발생했습니다.");
    }
  };

  const handleImageRemove = async () => {
    if (profileImg === emptyUserProfile) {
      alert("이미 삭제된 상태입니다.");
      setMenuOpen(false);
      return;
    }

    try {
      await api.delete("/api/v1/profileImage");
      setProfileImg(emptyUserProfile);
      alert("프로필 이미지가 삭제되었습니다.");
    } catch (err) {
      console.error("프로필 이미지 삭제 실패", err);
      alert("이미지 삭제 중 문제가 발생했습니다.");
    } finally {
      setMenuOpen(false);
    }
  };

  const validate = () => {
    const errs = {};

    if (!name.trim()) {
      errs.name = "이름은 필수 항목입니다.";
    } else if (name.length < 2 || name.length > 32) {
      errs.name = "이름은 2자 이상 32자 이하여야 합니다.";
    }

    if (!phone.trim()) {
      errs.phone = "전화번호는 필수 항목입니다.";
    } else if (!/^01[0-9]-\d{4}-\d{4}$/.test(phone)) {
      errs.phone = "전화번호 형식이 올바르지 않습니다.";
    }

    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload = {
      name,
      phoneNumber: phone,
      description: description || null,
    };

    try {
      const res = await api.patch("/api/v1/user", payload);
      const data = res.data.data;
      setName(data.name);
      setDescription(data.description || "");
      setPhone(data.phoneNumber);
      setProfileImg(
        data.profileImage
          ? `${api.defaults.baseURL}${data.profileImage}`
          : emptyUserProfile
      );
      alert("회원 정보가 성공적으로 업데이트되었습니다.");
    } catch (err) {
      console.error("회원 정보 업데이트 실패", err);
      alert("업데이트 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.myInfoPage}>
      <h2 className={styles.title}>내 정보 설정</h2>
      <div className={styles.form}>
        <div className={styles.profileSection}>
          <div className={styles.imageWrapper} ref={menuRef}>
            <img
              className={styles.profileImage}
              src={profileImg}
              alt="프로필 이미지"
            />
            <button
              className={styles.editButton}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <FaPen size={12} />
            </button>

            {menuOpen && (
              <div className={styles.menuDropdown}>
                <button
                  className={styles.menuItem}
                  onClick={() => fileInputRef.current.click()}
                >
                  <FaUpload size={12} />
                  이미지 업로드
                </button>
                <button
                  className={`${styles.menuItem} ${styles.deleteItem}`}
                  onClick={handleImageRemove}
                >
                  <FaTrash size={12} />
                  이미지 삭제
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>
          <p className={styles.imageDescription}>
            프로필 이미지의 권장 크기는 512x512입니다.
          </p>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name">이름</label>
          <input
            id="name"
            maxLength={32}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
          <span className={styles.charCount}>{`${name.length}/32`}</span>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="intro">내 소개</label>
          <textarea
            id="intro"
            rows={3}
            placeholder="자신의 소개를 입력해주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone">전화번호</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
          <p className={styles.phoneNote}>
            위 전화번호 문자로 기프티콘이 발송되며, 이외 다른 용도로 활용하지
            않습니다.
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.changePasswordButton} onClick={() => setIsPasswordModalOpen(true)}>
            비밀번호 변경
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            변경 사항 저장
          </button>
        </div>
      </div>
      {isPasswordModalOpen && <PasswordChangeModal onClose={() => setIsPasswordModalOpen(false)} />}
    </div>
  );
}

export default MyInfoPage;
