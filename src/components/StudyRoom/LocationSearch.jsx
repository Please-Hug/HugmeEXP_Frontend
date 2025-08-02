import { useState } from "react";
import styles from "./LocationSearch.module.scss";
import { searchStudyHallsByAddress, searchStudyHallsByName } from "../../api/studyRoomService";

const LocationSearch = ({
  currentLocation,
  searchRadius,
  onCurrentLocationClick,
  onRadiusChange,
  onLocationSet,
  onSearchNearby,
  onLoadAll,
  loading
}) => {
  const [searchType, setSearchType] = useState("nearby"); // "nearby" | "address" | "name"
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // 현재 위치 버튼 클릭
  const handleCurrentLocationClick = () => {
    setSearchType("nearby");
    onCurrentLocationClick();
  };

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      
      if (searchType === "address") {
        const response = await searchStudyHallsByAddress(searchQuery);
        // 검색 결과가 있으면 첫 번째 결과로 지도 중심 이동
        if (response.data && response.data.length > 0) {
          const firstResult = response.data[0];
          onLocationSet({
            latitude: firstResult.latitude,
            longitude: firstResult.longitude
          });
        }
      } else if (searchType === "name") {
        await searchStudyHallsByName(searchQuery);
      }
    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSearchLoading(false);
    }
  };

  // 엔터키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 반경 변경
  const handleRadiusChange = (e) => {
    const newRadius = parseFloat(e.target.value);
    onRadiusChange(newRadius);
  };

  // 위치 정확도 표시
  const renderLocationAccuracy = () => {
    if (!currentLocation?.accuracyInfo) return null;

    const { level, message, color } = currentLocation.accuracyInfo;
    
    return (
      <div className={`${styles.locationAccuracy} ${styles[level]}`}>
        <span className={styles.accuracyDot} style={{ backgroundColor: color }}></span>
        <span className={styles.accuracyMessage}>{message}</span>
        {currentLocation.accuracy && (
          <span className={styles.accuracyValue}>
            (±{Math.round(currentLocation.accuracy)}m)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.locationSearch}>
      {/* 검색 타입 선택 */}
      <div className={styles.searchTabs}>
        <button
          className={`${styles.tabButton} ${searchType === "nearby" ? styles.active : ""}`}
          onClick={() => setSearchType("nearby")}
        >
          🎯 주변 검색
        </button>
        <button
          className={`${styles.tabButton} ${searchType === "address" ? styles.active : ""}`}
          onClick={() => setSearchType("address")}
        >
          📍 주소 검색
        </button>
        <button
          className={`${styles.tabButton} ${searchType === "name" ? styles.active : ""}`}
          onClick={() => setSearchType("name")}
        >
          🏢 이름 검색
        </button>
      </div>

      {/* 주변 검색 */}
      {searchType === "nearby" && (
        <div className={styles.nearbySearch}>
          <button
            className={styles.currentLocationButton}
            onClick={handleCurrentLocationClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.buttonSpinner}></span>
                위치 확인 중...
              </>
            ) : (
              <>
                📍 현재 위치로 검색
              </>
            )}
          </button>

          {/* 현재 위치 정보 */}
          {currentLocation && (
            <div className={styles.currentLocationInfo}>
              <div className={styles.coordinates}>
                📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </div>
              {renderLocationAccuracy()}
            </div>
          )}

          {/* 검색 반경 설정 */}
          <div className={styles.radiusControl}>
            <label htmlFor="radius">검색 반경: {searchRadius}km</label>
            <input
              id="radius"
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={searchRadius}
              onChange={handleRadiusChange}
              className={styles.radiusSlider}
            />
            <div className={styles.radiusLabels}>
              <span>1km</span>
              <span>20km</span>
            </div>
          </div>

          {/* 주변 검색 버튼 */}
          <button
            className={styles.searchButton}
            onClick={() => onSearchNearby()}
            disabled={!currentLocation || loading}
          >
            🔍 {searchRadius}km 반경 검색
          </button>
        </div>
      )}

      {/* 주소/이름 검색 */}
      {(searchType === "address" || searchType === "name") && (
        <div className={styles.textSearch}>
          <div className={styles.searchInputGroup}>
            <input
              type="text"
              placeholder={
                searchType === "address" 
                  ? "주소를 입력하세요 (예: 강남구 테헤란로)" 
                  : "스터디홀 이름을 입력하세요"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className={styles.searchInput}
            />
            <button
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searchLoading}
            >
              {searchLoading ? (
                <span className={styles.buttonSpinner}></span>
              ) : (
                "🔍"
              )}
            </button>
          </div>

          <div className={styles.searchHints}>
            {searchType === "address" && (
              <div className={styles.hint}>
                💡 도로명 주소나 지번 주소를 입력해보세요
              </div>
            )}
            {searchType === "name" && (
              <div className={styles.hint}>
                💡 스터디홀 또는 스터디카페 이름을 입력해보세요
              </div>
            )}
          </div>
        </div>
      )}

      {/* 전체 보기 버튼 */}
      <div className={styles.viewAllSection}>
        <button
          className={styles.viewAllButton}
          onClick={onLoadAll}
          disabled={loading}
        >
          🗺️ 전체 스터디홀 보기
        </button>
      </div>

      {/* 안내 메시지 */}
      <div className={styles.helpText}>
        <div className={styles.helpItem}>
          <span className={styles.helpIcon}>📍</span>
          <span>지도를 클릭하면 해당 위치로 설정됩니다</span>
        </div>
        <div className={styles.helpItem}>
          <span className={styles.helpIcon}>🎯</span>
          <span>마커를 클릭하면 상세 정보를 볼 수 있습니다</span>
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;