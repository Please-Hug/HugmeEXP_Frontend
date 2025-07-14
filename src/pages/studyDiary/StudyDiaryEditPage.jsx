import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudyDiary, updateStudyDiary } from "../../api/studyDiaryService";
import StudyDiaryEditor from "./components/StudyDiaryEditor";
import styles from "./StudyDiaryEditPage.module.scss";

function StudyDiaryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // 페이지 로드 시 기존 데이터 불러오기
  useEffect(() => {
    fetchDiaryData();
  }, [id]);

  const fetchDiaryData = async () => {
    try {
      setLoading(true);
      const response = await getStudyDiary(id);
      
      if (response?.data) {
        const data = response.data;
        setFormData({
          title: data.title || "",
          content: data.content || ""
        });
        setOriginalData(data);
      }
    } catch (error) {
      console.error("배움일기 조회 실패:", error);
      
      const status = error.response?.status;
      switch (status) {
        case 404:
          alert("해당 배움일기를 찾을 수 없습니다.");
          navigate("/study-diary");
          break;
        case 401:
          alert("로그인이 필요합니다.");
          navigate("/login");
          break;
        default:
          alert("배움일기를 불러오는데 실패했습니다.");
          navigate("/study-diary");
      }
    } finally {
      setLoading(false);
    }
  };

  // 제목 변경 처리
  const handleTitleChange = (e) => {
    const value = e.target.value;
    
    // 글자 수 제한 (API 명세: 1-100자)
    if (value.length > 100) {
      setErrors({ ...errors, title: "제목은 100자를 초과할 수 없습니다." });
      return;
    }
    
    const newErrors = { ...errors };
    delete newErrors.title;
    setErrors(newErrors);
    setFormData({ ...formData, title: value });
  };

  // 내용 변경 처리
  const handleContentChange = (value) => {
    // 글자 수 제한 (API 명세: 1-10000자)
    if (value.length > 10000) {
      setErrors({ ...errors, content: "내용은 10000자를 초과할 수 없습니다." });
      return;
    }
    
    const newErrors = { ...errors };
    delete newErrors.content;
    setErrors(newErrors);
    setFormData({ ...formData, content: value || "" });
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    } else if (formData.title.length < 1 || formData.title.length > 100) {
      newErrors.title = "제목은 1~100자 사이여야 합니다.";
    }
    
    if (!formData.content.trim()) {
      newErrors.content = "내용을 입력해주세요.";
    } else if (formData.content.length < 1 || formData.content.length > 10000) {
      newErrors.content = "내용은 1~10000자 사이여야 합니다.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 변경사항 확인
  const hasChanges = () => {
    if (!originalData) return false;
    
    return (
      formData.title !== originalData.title ||
      formData.content !== originalData.content
    );
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData = {
        title: formData.title.trim(),
        content: formData.content.trim()
      };
      
      const response = await updateStudyDiary(id, requestData);
      
      if (response?.data) {
        alert("배움일기가 성공적으로 수정되었습니다!");
        navigate(`/study-diary/${id}`);
      }
    } catch (error) {
      console.error("배움일기 수정 실패:", error);
      
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      switch (status) {
        case 400:
          alert(message || "입력값이 올바르지 않습니다. 다시 확인해주세요.");
          break;
        case 401:
          alert("로그인이 필요합니다.");
          navigate("/login");
          break;
        case 403:
          alert("이 배움일기를 수정할 권한이 없습니다.");
          navigate("/study-diary");
          break;
        case 404:
          alert("해당 배움일기를 찾을 수 없습니다.");
          navigate("/study-diary");
          break;
        default:
          alert("배움일기 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm("변경사항이 있습니다. 정말 취소하시겠습니까?")) {
        navigate(`/study-diary/${id}`);
      }
    } else {
      navigate(`/study-diary/${id}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>배움일기를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.editPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>배움일기 수정</h1>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(`/study-diary/${id}`)}
        >
          상세보기로
        </button>
      </div>

      {originalData && (
        <div className={styles.metadata}>
          <span className={styles.author}>작성자: {originalData.writerName || originalData.username}</span>
          <span className={styles.date}>
            작성일: {new Date(originalData.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 제목 입력 */}
        <div className={styles.formGroup}>
          <label htmlFor="title">
            제목 <span className={styles.required}>*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="제목을 입력하세요"
            className={errors.title ? styles.error : ""}
            disabled={submitting}
          />
          <div className={styles.fieldInfo}>
            <span className={styles.charCount}>
              {formData.title.length}/100
            </span>
            {errors.title && (
              <span className={styles.errorMessage}>{errors.title}</span>
            )}
          </div>
        </div>

        {/* 내용 입력 */}
        <div className={styles.formGroup}>
          <label>
            내용 <span className={styles.required}>*</span>
          </label>
          <StudyDiaryEditor
            ref={editorRef}
            value={formData.content}
            onChange={handleContentChange}
            placeholder="내용을 수정하세요..."
          />
          {errors.content && (
            <span className={styles.errorMessage}>{errors.content}</span>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            취소
          </button>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !hasChanges() || Object.keys(errors).length > 0}
          >
            {submitting ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudyDiaryEditPage;