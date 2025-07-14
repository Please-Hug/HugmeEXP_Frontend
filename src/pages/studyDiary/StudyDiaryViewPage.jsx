import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudyDiary, deleteStudyDiary, createComment, deleteComment, toggleLike, getImagePresignedUrl } from "../../api/studyDiaryService";
import styles from "./StudyDiaryViewPage.module.scss";
import useUserStore from "../../stores/userStore";
import useTokenPayload from "../../stores/tokenPayloadStore";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/markdown.css";
import remarkGfm from "remark-gfm";

function StudyDiaryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diary, setDiary] = useState(null);
  const [processedContent, setProcessedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const userInfo = useUserStore((state) => state.userInfo);
  const { tokenPayload } = useTokenPayload();
  
  // 현재 로그인한 사용자가 글 작성자인지 확인
  const isAuthor = diary && userInfo && userInfo.name === diary.name;
  
  // 현재 사용자가 관리자인지 확인
  const isAdmin = ["ADMIN", "ROLE_ADMIN"].includes(tokenPayload?.role);
  
  // 디버깅 로그
  console.log("🔍 권한 체크 디버깅:", {
    tokenPayload: tokenPayload,
    userRole: tokenPayload?.role,
    isAdmin: isAdmin,
    isAuthor: isAuthor,
    userInfo: userInfo,
    diaryAuthor: diary?.name,
    showDeleteButton: isAuthor || isAdmin
  });

  useEffect(() => {
    fetchDiary();
  }, [id]);

  // 이미지 URL을 Presigned URL로 변환하는 함수
  const processImageUrls = async (content) => {
    if (!content) return content;

    // 임시: Presigned URL 변환 비활성화 (디버깅용)
    const USE_PRESIGNED_URL = false;
    
    if (!USE_PRESIGNED_URL) {
      console.log("🚧 Presigned URL 변환 비활성화됨 - 원본 URL 사용");
      return content;
    }

    try {
      // S3 이미지 URL 패턴 찾기
      const s3UrlPattern = /!\[([^\]]*)\]\((https:\/\/hugmeexp\.s3\.ap-northeast-2\.amazonaws\.com\/([^)]+))\)/g;
      let processedContent = content;
      const urlsToReplace = [];

      console.log("🔍 원본 콘텐츠:", content);

      let match;
      while ((match = s3UrlPattern.exec(content)) !== null) {
        const [fullMatch, altText, originalUrl, imageKey] = match;
        console.log("🎯 매치 발견:", {
          fullMatch,
          altText,
          originalUrl,
          imageKey: imageKey
        });
        urlsToReplace.push({ fullMatch, altText, originalUrl, imageKey });
      }

      console.log("🖼️ 발견된 이미지 URL들:", urlsToReplace);

      // 각 이미지 URL을 Presigned URL로 변환
      for (const { fullMatch, altText, originalUrl, imageKey } of urlsToReplace) {
        try {
          console.log(`🔍 이미지 키로 Presigned URL 요청: ${imageKey}`);
          const response = await getImagePresignedUrl(imageKey);
          console.log(`📡 Presigned URL API 응답:`, response);
          
          if (response?.data?.presignedUrl) {
            const newMarkdown = `![${altText}](${response.data.presignedUrl})`;
            processedContent = processedContent.replace(fullMatch, newMarkdown);
            console.log(`✅ URL 변환 성공: ${imageKey}`);
            console.log(`🔗 새로운 URL: ${response.data.presignedUrl}`);
          } else {
            console.log(`⚠️ Presigned URL이 응답에 없음:`, response);
          }
        } catch (error) {
          console.error(`❌ URL 변환 실패: ${imageKey}`, error);
          console.error(`❌ 에러 상세:`, error.response?.status, error.response?.data);
          console.log(`🔄 원본 URL 유지: ${originalUrl}`);
          // 실패한 경우 원본 URL 유지 (변환하지 않음)
        }
      }

      return processedContent;
    } catch (error) {
      console.error("이미지 URL 처리 중 오류:", error);
      return content; // 오류 발생 시 원본 콘텐츠 반환
    }
  };

  // diary가 변경될 때마다 이미지 URL 처리
  useEffect(() => {
    if (diary?.content) {
      processImageUrls(diary.content).then(setProcessedContent);
    }
  }, [diary]);

  const fetchDiary = async () => {
    try {
      setLoading(true);
      const response = await getStudyDiary(id);
      console.log("📋 fetchDiary 전체 응답:", response);
      console.log("📋 response.data:", response?.data);
      console.log("📋 response.data 타입:", typeof response?.data);
      
      // API 응답 구조에 따라 데이터 추출
      let diaryData = null;
      if (response?.data) {
        // 응답이 { data: {...} } 형태인 경우
        diaryData = response.data;
      } else if (response) {
        // 응답이 직접 데이터인 경우
        diaryData = response;
      }
      
      console.log("📋 최종 diaryData:", diaryData);
      
      if (diaryData) {
        setDiary(diaryData);
        console.log("✅ 배움일기 조회 성공");
      } else {
        console.log("❌ 응답에서 데이터를 찾을 수 없음");
        throw new Error("응답에서 데이터를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("❌ 배움일기 조회 실패:", error);
      console.error("❌ 에러 상태:", error.response?.status);
      console.error("❌ 에러 메시지:", error.message);
      console.error("❌ 에러 응답:", error.response?.data);
      
      // 개발 모드에서는 더미 데이터 사용, 프로덕션에서는 에러 표시
      if (process.env.NODE_ENV === 'development') {
        console.log("🔧 개발 모드: 더미 데이터 사용");
        // 임시 더미 데이터 (API 명세서 구조에 맞춤)
      setDiary({
        id: parseInt(id),
        userId: 1,
        name: "김학습",
        title: "React 컴포넌트 심화 학습",
        content: `오늘은 React의 컴포넌트 생명주기와 훅에 대해 깊이 학습했습니다.

## 배운 내용
1. **useEffect 훅의 의존성 배열**
   - 빈 배열을 전달하면 컴포넌트 마운트 시에만 실행
   - 의존성이 있으면 해당 값이 변경될 때마다 실행

2. **useState와 상태 관리**
   - 상태 업데이트는 비동기적으로 처리됨
   - 이전 상태를 기반으로 업데이트할 때는 함수형 업데이트 사용

## 어려웠던 점
- 클로저와 관련된 상태 업데이트 문제
- 무한 루프가 발생하는 useEffect 의존성 설정

## 해결 방법
- useCallback을 사용해서 함수 메모이제이션
- 의존성 배열을 정확히 설정

## 내일 학습할 내용
- React Router의 고급 기능
- 상태 관리 라이브러리 (Zustand) 심화`,
        likeNum: 8,
        commentList: [
          {
            id: 1,
            content: "정말 유익한 내용이네요! 특히 useEffect 부분이 도움됐습니다.",
            name: "이학습",
            createdAt: "2024-01-15T11:30:00"
          },
          {
            id: 2,
            content: "저도 같은 문제로 고민했는데 해결 방법을 공유해주셔서 감사합니다.",
            name: "박개발",
            createdAt: "2024-01-15T14:20:00"
          }
        ],
        createdAt: "2024-01-15T10:30:00"
      });
      } else {
        // 프로덕션 모드에서는 에러 상태 표시
        console.log("🚨 프로덕션 모드: 에러 상태 유지");
        setDiary(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    
    try {
      await deleteStudyDiary(id);
      alert("배움일기가 삭제되었습니다.");
      navigate("/study-diary");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleLikeToggle = async () => {
    if (isTogglingLike) return;
    
    try {
      setIsTogglingLike(true);
      const response = await toggleLike(id);
      
      if (response) {
        // 서버에서 최신 데이터를 다시 불러와서 페이지 새로고침
        await fetchDiary();
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }
    
    if (isSubmittingComment) return;
    
    try {
      setIsSubmittingComment(true);
      const response = await createComment(id, commentContent);
      
      if (response) {
        console.log("in handleCommentSubmit", response);
        // 댓글 등록 후 서버에서 최신 데이터를 다시 불러와서 페이지 새로고침
        setCommentContent("");
        await fetchDiary();
      }
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    
    try {
      const response = await deleteComment(id, commentId);
      
      if (response) {
        alert("댓글이 삭제되었습니다.");
        // 댓글 삭제 후 서버에서 최신 데이터를 다시 불러와서 페이지 새로고침
        await fetchDiary();
      }
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      
      // 상태 코드별 에러 처리
      const status = error.response?.status;
      switch (status) {
        case 401:
          alert("로그인이 필요합니다.");
          break;
        case 403:
          alert("댓글을 삭제할 권한이 없습니다.");
          break;
        case 404:
          alert("댓글을 찾을 수 없습니다.");
          break;
        default:
          alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!diary) {
    return <div className={styles.error}>배움일기를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate("/study-diary")}
        >
          ← 배움일기 목록으로
        </button>
        {(isAuthor || isAdmin) && (
          <div className={styles.actions}>
            {isAuthor && (
              <button 
                className={styles.editButton}
                onClick={() => navigate(`/study-diary/edit/${id}`)}
              >
                수정
              </button>
            )}
            <button 
              className={styles.deleteButton}
              onClick={handleDelete}
            >
              {isAdmin && !isAuthor ? "관리자 삭제" : "삭제"}
            </button>
          </div>
        )}
      </div>

      <article className={styles.article}>
        <header className={styles.articleHeader}>
          <h1>{diary.title}</h1>
          <div className={styles.meta}>
            <span className={styles.author}>
              작성자: {diary.name}
            </span>
            <span className={styles.date}>
              {new Date(diary.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.likeButton}
              onClick={handleLikeToggle}
              disabled={isTogglingLike}
            >
              ❤️ {diary.likeNum || 0}
            </button>
          </div>
        </header>

        <div className={styles.content} data-color-mode="light">
          <MDEditor.Markdown
            source={processedContent || diary.content}
            style={{ whiteSpace: "pre-wrap" }}
            remarkPlugins={[remarkGfm]}
          />
        </div>
        
        {/* 댓글 섹션 */}
        <div className={styles.commentSection}>
          <h3>댓글 ({diary.commentList?.length || 0})</h3>
          
          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              rows={3}
              className={styles.commentInput}
            />
            <button 
              type="submit" 
              className={styles.commentSubmitButton}
              disabled={isSubmittingComment}
            >
              {isSubmittingComment ? "등록 중..." : "댓글 등록"}
            </button>
          </form>
          
          {/* 댓글 목록 */}
          <div className={styles.commentList}>
            {diary.commentList && diary.commentList.length > 0 ? (
              diary.commentList.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentInfo}>
                      <span className={styles.commentAuthor}>{comment.name}</span>
                      <span className={styles.commentDate}>
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {(userInfo?.name === comment.name || isAdmin) && (
                      <button
                        className={styles.deleteCommentButton}
                        onClick={() => handleCommentDelete(comment.id)}
                        title={isAdmin && userInfo?.name !== comment.name ? "관리자 권한으로 삭제" : "댓글 삭제"}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              ))
            ) : (
              <p className={styles.noComments}>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

export default StudyDiaryViewPage; 