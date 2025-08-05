import React, { useEffect, useState, useRef } from "react";
import styles from "./LatestRecruitmentCarousel.module.scss";
import { getLatestRecruitments } from "../../api/recruitmentService";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

function LatestRecruitmentCarousel() {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const itemsPerView = 3;

  useEffect(() => {
    const fetchRecruitments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLatestRecruitments();
        setRecruitments(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruitments();
  }, []);

  const maxIndex = Math.max(0, recruitments.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const formatExperience = (min, max) => {
    if (min === 0 && max === 100) return "신입·경력";
    if (min === 0) return "신입";
    if (max === 100) return `${min}년 이상`;
    return `${min}~${max}년`;
  };

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();

    // 9999년은 상시채용으로 처리
    if (date.getFullYear() === 9999) {
      return "상시채용";
    }

    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "마감";
    if (diffDays === 0) return "오늘 마감";
    if (diffDays <= 7) return `D-${diffDays}`;

    return `${date.getMonth() + 1}.${date.getDate()}(${["일", "월", "화", "수", "목", "금", "토"][date.getDay()]})`;
  };

  // 드래그 기능
  const handleTouchStart = (e) => {
    setIsMouseDown(true);
    setIsDragging(false);
    setStartPos(e.type === "mousedown" ? e.clientX : e.touches[0].clientX);
    setPrevTranslate(currentTranslate);
  };

  const handleTouchMove = (e) => {
    // 마우스가 눌린 상태가 아니면 드래그 무시 (터치는 예외)
    if (e.type === "mousemove" && !isMouseDown) return;

    const currentPosition =
      e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
    const diff = Math.abs(currentPosition - startPos);

    // 일정 거리 이상 움직이면 드래그로 인식
    if (diff > 5) {
      setIsDragging(true);
    }

    if (!isDragging) return;

    const moveDiff = currentPosition - startPos;
    setCurrentTranslate(prevTranslate + moveDiff);
  };

  const handleTouchEnd = () => {
    setIsMouseDown(false);

    if (!isDragging) {
      setIsDragging(false);
      return;
    }

    const movedBy = currentTranslate - prevTranslate;
    const threshold = 100; // 최소 드래그 거리

    if (movedBy < -threshold && currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    } else if (movedBy > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    setCurrentTranslate(0);
    setPrevTranslate(0);

    // 드래그 상태를 약간의 딜레이 후에 해제하여 클릭 이벤트 차단
    setTimeout(() => {
      setIsDragging(false);
    }, 10);
  };

  const handleTitleClick = () => {
    window.open("/recruitment/map", "_blank");
  };

  const handleCardClick = (recruitmentId, e) => {
    // 드래그가 발생했으면 클릭 이벤트 차단
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window.open(`/recruitment/map/${recruitmentId}`, "_blank");
  };

  return (
    <div className={styles.latestRecruitmentCarousel}>
      <div className={styles.header}>
        <h3 onClick={handleTitleClick} className={styles.clickableTitle}>
          최신 채용 공고
        </h3>
        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <FaChevronLeft />
          </button>
          <button
            className={styles.navButton}
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error loading recruitments: {error.message}</p>}

      {!loading && !error && recruitments.length === 0 && (
        <p>채용 공고를 찾을 수 없습니다.</p>
      )}

      {!loading && !error && recruitments.length > 0 && (
        <div className={styles.carouselContainer}>
          <div
            className={styles.carouselTrack}
            ref={carouselRef}
            style={{
              transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% + ${isDragging ? currentTranslate : 0}px))`,
            }}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {recruitments.map((recruitment) => (
              <div
                key={recruitment.id}
                className={styles.recruitmentCard}
                onClick={(e) => handleCardClick(recruitment.id, e)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.companyInfo}>
                    {recruitment.companyImageUrl ? (
                      <img
                        src={recruitment.companyImageUrl}
                        alt={recruitment.companyName}
                        className={styles.companyLogo}
                      />
                    ) : (
                      <div className={styles.companyLogoPlaceholder}>
                        {recruitment.companyName.charAt(0)}
                      </div>
                    )}
                    <span className={styles.companyName}>
                      {recruitment.companyName}
                    </span>
                  </div>
                  <div className={styles.dueDate}>
                    <FaCalendarAlt />
                    <span>{formatDueDate(recruitment.dueDate)}</span>
                  </div>
                </div>

                <h4 className={styles.title}>{recruitment.title}</h4>

                <div className={styles.cardFooter}>
                  <div className={styles.location}>
                    <FaMapMarkerAlt />
                    <span>{recruitment.workLocation}</span>
                  </div>
                  <div className={styles.experience}>
                    {formatExperience(
                      recruitment.experienceMin,
                      recruitment.experienceMax
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LatestRecruitmentCarousel;
