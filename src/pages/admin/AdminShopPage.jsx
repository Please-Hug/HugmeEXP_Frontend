import { useState } from "react";
import apiInstance from "../../api/axiosInstance.js";
import styles from './AdminShopPage.module.scss';

function AdminShopPage() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    quantity: 0,
    price: 0,
    image: null,
  });
  const [deleteId, setDeleteId] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("brand", formData.brand);
    data.append("quantity", formData.quantity);
    data.append("price", formData.price);
    data.append("image", formData.image);

    try {
      await apiInstance.post("/api/v1/admin/shop", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ 상품 등록 완료!");
      setFormData({ name: "", brand: "", quantity: 0, price: 0, image: null });
    } catch (err) {
      console.error("상품 등록 실패:", err);
      setMessage("❌ 상품 등록 실패");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      setMessage("❌ 삭제할 상품 ID를 입력하세요.");
      return;
    }

    if (!window.confirm(`정말로 상품 ID ${deleteId}를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await apiInstance.delete(`/api/v1/admin/shop/${deleteId}`);
      setMessage(`✅ 상품 ID ${deleteId} 삭제 완료`);
      setDeleteId("");
    } catch (err) {
      console.error("상품 삭제 실패:", err);
      setMessage("❌ 상품 삭제 실패");
    }
  };

  // 메시지 타입에 따른 클래스 결정
  const getMessageClass = () => {
    if (message.startsWith("✅")) {
      return `${styles.message} ${styles.success}`;
    } else if (message.startsWith("❌")) {
      return `${styles.message} ${styles.error}`;
    }
    return styles.message;
  };

  return (
    <div className={styles.AdminShopPage}>
      <h2 className={styles.title}>상점 관리</h2>
      
      <div className={styles.content}>
        <div className={styles.card}>
          <h3>상품 등록</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="상품명"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="text"
              name="brand"
              placeholder="브랜드"
              value={formData.brand}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="수량"
              value={formData.quantity}
              onChange={handleChange}
              className={styles.input}
              min="0"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="포인트 가격"
              value={formData.price}
              onChange={handleChange}
              className={styles.input}
              min="0"
              required
            />
            <div className={styles.fileInputWrapper}>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className={styles.fileInput}
                required
              />
              <label className={styles.fileLabel}>
                {formData.image ? formData.image.name : "이미지 파일 선택"}
              </label>
            </div>
            <button type="submit" className={styles.button}>
              상품 등록
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h3>상품 삭제</h3>
          <div className={styles.formGroup}>
            <input
              type="number"
              placeholder="삭제할 상품 ID"
              value={deleteId}
              onChange={(e) => setDeleteId(e.target.value)}
              className={styles.input}
            />
            <button 
              onClick={handleDelete} 
              className={styles.deleteButton}
            >
              삭제
            </button>
          </div>
        </div>

        {message && <div className={getMessageClass()}>{message}</div>}
      </div>
    </div>
  );
}

export default AdminShopPage;
