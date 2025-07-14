import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudyDiaries, searchStudyDiaries, getWeeklyPopularStudyDiaries } from "../../api/studyDiaryService";
import styles from "./StudyDiaryListPage.module.scss";

function StudyDiaryListPage() {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("홈");
  const [sortType, setSortType] = useState("최신");
  const navigate = useNavigate();

  // 페이지 로드 시 배움일기 목록 가져오기
  useEffect(() => {
    console.log("in useEffect", isSearching, searchKeyword);
    if (isSearching) {
      fetchSearchResults();
    } else {
      fetchDiaries();
    }
  }, [currentPage, isSearching, sortType]);

  const fetchDiaries = async () => {
    try {
      setLoading(true);
      let response;
      
      if (sortType === "인기") {
        // 인기 정렬일 때는 일주일간 인기 배움일기 API 호출
        response = await getWeeklyPopularStudyDiaries(currentPage, 10, "likeCount", "DESC");
      } else {
        // 최신 정렬일 때는 기존 API 호출
        response = await getStudyDiaries(currentPage, 10, "createdAt");
      }
      
      console.log("in fetchDiaries", response);
      if (response.data) {
        setDiaries(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error("배움일기 목록 조회 실패:", error);
      // 임시 더미 데이터 (백엔드 연결 전까지)
      const dummyData = [
        {
          id: 1,
          title: "리액트 회원가입 양식 연습",
          content: "import React, { useState } from 'react'; function SignupForm() { const [formData, setFormData] = useState({ name: '', email: '', password: '' });...",
          createdAt: "2025.6.27",
          name: "백다희(백엔드4차)",
          likeNum: 2,
          commentNum: 0,
        },
        {
          id: 2,
          title: "2025.6.27 리액트 빌드 실행",
          content: "https://github.com/jhn9622/lecture/blob/main/react/2025-06-27.md",
          createdAt: "2025.6.27",
          name: "백다희(백엔드4차)",
          likeNum: 11,
          commentNum: 1,
        },
        {
          id: 3,
          title: "생성AI 4차 - 32일차·7컵차·이상탐지와 추천시스템",
          content: "오늘은 이상탐지와 추천시스템에 대해서 공부했던 것입니다. 특히 독기하여 훌륭데이터 과학이 어다니 풀어야 할 깊이있다는 이터리터의 디터인지 않...",
          createdAt: "2024.1.15",
          name: "김컴공(생성AI 4차)",
          likeNum: 11,
          commentNum: 4,
        },
        {
          id: 4,
          title: "[0627] PM 33컵차 이튼 정리",
          content: "재즈 관리를 위한 데이터 분석_데이터 분석 프레임워크🧓 기와에 남는 개념GAC고객 획특업 바용: 고객 한 명을 유치하는 데 총리익로는 들어가는 바용= 마케팅...",
          createdAt: "2024.6.27",
          name: "영예은(PM 4차)",
          likeNum: 3,
          commentNum: 0,
        },
        {
          id: 5,
          title: "볼륨",
          content: "볼륨이란?🤔볼륨은 데이터를 저장하는 저장소이다. 볼륨은 데이터가 저장되는 위치에 따라 제거한 문융닫 수 있음~파드 내에 위치; 파드(컨테이너) 내에 데이...",
          createdAt: "2024.1.14",
          name: "두윤수(클라우드 4차)",
          likeNum: 1,
          commentNum: 0,
        },
        {
          id: 6,
          title: "데이터 분석 이론 기초변율 배워보시다",
          content: "6월 20차료 데이터 분석 파드 시작 기록 모디야(자료 정리)데이터 리터라시<데이터 리터라시>데이터란 새로운 정보, 추시, 이해, 로직, 관찰 ...",
          createdAt: "2024.1.14",
          name: "두윤수(클라우드 4차)",
          likeNum: 1,
          commentNum: 0,
        },
        {
          id: 7,
          title: "로그분석",
          content: "# main.py # 로그 파일 이들log_file = 'mission_computer_main.log'json_file = 'mission_computer_main.json'# 1. 로그 파일 읽기try: with open(log...",
          createdAt: "2024.1.13",
          name: "이정원(클라우드4차)",
          likeNum: 2,
          commentNum: 0,
        },
        {
          id: 8,
          title: "20250627 React, Javascript 연습",
          content: "노션 정리https://www.notion.so/21446bdec13280a5929eda414ffb6e0d?source=copy_link",
          createdAt: "2024.1.13",
          name: "이정원(클라우드4차)",
          likeNum: 2,
          commentNum: 0,
        }
      ];
      setDiaries(dummyData);
      setTotalPages(Math.ceil(dummyData.length / 10));
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    if (!searchKeyword.trim()) return;
    
    try {
      setLoading(true);
      const response = await searchStudyDiaries(searchKeyword, currentPage, 10);
      
      if (response && response.data) {
        setDiaries(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error("배움일기 검색 실패:", error);
      setDiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setCurrentPage(0);
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setCurrentPage(0);
    }
  };

  const handleSearchReset = () => {
    setSearchKeyword("");
    setIsSearching(false);
    setCurrentPage(0);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "나의 활동") {
      navigate("/my-activity");
    }
  };

  const handleSortChange = (sort) => {
    setSortType(sort);
    setCurrentPage(0);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  return (
    <div className={styles.container}>
      {/* 헤더 섹션 */}
      <div className={styles.headerSection}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>배움일기</h1>
          <button
            className={styles.writeButton}
            onClick={() => navigate("/study-diary/write")}
          >
            배움일기 작성하기
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "홈" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("홈")}
        >
          홈
        </button>
        <button
          className={`${styles.tab} ${activeTab === "나의 활동" ? styles.activeTab : ""}`}
          onClick={() => handleTabChange("나의 활동")}
        >
          나의 활동
        </button>
      </div>

      {/* 검색 및 정렬 */}
      <div className={styles.searchAndSort}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="커뮤니티 알림 및 그룹들의 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </form>
        <div className={styles.sortButtons}>
          <button
            className={`${styles.sortButton} ${sortType === "최신" ? styles.activeSortButton : ""}`}
            onClick={() => handleSortChange("최신")}
          >
            최신
          </button>
          <button
            className={`${styles.sortButton} ${sortType === "인기" ? styles.activeSortButton : ""}`}
            onClick={() => handleSortChange("인기")}
          >
            인기
          </button>
        </div>
      </div>

      {/* 글 목록 */}
      <div className={styles.diaryList}>
        {diaries.length === 0 ? (
          <div className={styles.empty}>
            {isSearching ? (
              <>
                <p>검색 결과가 없습니다.</p>
                <button onClick={handleSearchReset}>
                  전체 목록 보기
                </button>
              </>
            ) : (
              <>
                <p>아직 작성된 배움일기가 없습니다.</p>
                <button onClick={() => navigate("/study-diary/write")}>
                  첫 번째 일기 작성하기
                </button>
              </>
            )}
          </div>
        ) : (
          diaries.map((diary) => (
            <div
              key={diary.id}
              className={styles.diaryCard}
              onClick={() => navigate(`/study-diary/${diary.id}`)}
            >
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{diary.title}</h3>
                <p className={styles.cardText}>
                  {truncateContent(diary.content)}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.cardStats}>
                  <span className={styles.likes}>❤️ {diary.likeNum || 0}</span>
                  <span className={styles.comments}>💬 {diary.commentNum || 0}</span>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.author}>{diary.name}</span>
                  <span className={styles.date}>{diary.createdAt}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className={styles.pageButton}
          >
            ←
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage - 2 + i;
            if (pageNum < 0 || pageNum >= totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`${styles.pageButton} ${currentPage === pageNum ? styles.activePage : ""}`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className={styles.pageButton}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

export default StudyDiaryListPage; 