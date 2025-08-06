import React, { useState } from "react";
import styles from "./LocationSearch.module.scss";
import { searchStudyHallsByAddress, searchStudyHallsByName } from "../../api/studyRoomService";

function LocationSearch({ onSearchResults, onNearbySearch, currentLocation, className }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name"); // 'name' 또는 'address'
  const [isSearching, setIsSearching] = useState(false);
  const [radius, setRadius] = useState(10.0);

  // 검색 실행
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let response;
      if (searchType === "name") {
        response = await searchStudyHallsByName(searchQuery.trim());
      } else {
        response = await searchStudyHallsByAddress(searchQuery.trim());
      }

      if (onSearchResults) {
        onSearchResults(response.data || [], null);
      }
    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSearching(false);
    }
  };

  // 주변 검색
  const handleNearbySearch = async () => {
    if (!currentLocation) {
      alert("현재 위치 정보를 가져올 수 없습니다.");
      return;
    }

    setIsSearching(true);
    try {
      if (onNearbySearch) {
        await onNearbySearch(currentLocation.lat, currentLocation.lng, radius);
      }
    } catch (error) {
      console.error("주변 검색 실패:", error);
      alert("주변 검색에 실패했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  // 현재 위치로 이동
  const handleCurrentLocationMove = () => {
    if (!currentLocation) {
      alert("현재 위치 정보를 가져올 수 없습니다.");
      return;
    }

    if (onSearchResults) {
      onSearchResults([], currentLocation);
    }
  };

  return (
    <div className={`${styles.locationSearch} ${className || ""}`}>
      <div className={styles.searchContainer}>
        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchTypeSelector}>
            <label>
              <input
                type="radio"
                value="name"
                checked={searchType === "name"}
                onChange={(e) => setSearchType(e.target.value)}
              />
              <span>이름</span>
            </label>
            <label>
              <input
                type="radio"
                value="address"
                checked={searchType === "address"}
                onChange={(e) => setSearchType(e.target.value)}
              />
              <span>주소</span>
            </label>
          </div>

          <div className={styles.searchInputGroup}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === "name" 
                  ? "스터디홀 이름을 입력하세요" 
                  : "주소를 입력하세요"
              }
              className={styles.searchInput}
              disabled={isSearching}
            />
            <button 
              type="submit" 
              className={styles.searchBtn}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? "검색중..." : "🔍"}
            </button>
          </div>
        </form>

        {/* 위치 기반 검색 */}
        <div className={styles.locationActions}>
          <div className={styles.radiusSelector}>
            <label htmlFor="radius">반경:</label>
            <select
              id="radius"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className={styles.radiusSelect}
            >
              <option value={1.0}>1km</option>
              <option value={3.0}>3km</option>
              <option value={5.0}>5km</option>
              <option value={10.0}>10km</option>
              <option value={20.0}>20km</option>
            </select>
          </div>

          <button
            onClick={handleNearbySearch}
            className={styles.nearbyBtn}
            disabled={isSearching || !currentLocation}
            title={!currentLocation ? "현재 위치 정보가 필요합니다" : ""}
          >
            {isSearching ? "검색중..." : "📍 주변 검색"}
          </button>

          <button
            onClick={handleCurrentLocationMove}
            className={styles.currentLocationBtn}
            disabled={!currentLocation}
            title={!currentLocation ? "현재 위치 정보가 필요합니다" : ""}
          >
            🎯 현재 위치
          </button>
        </div>
      </div>

      {/* 위치 권한 안내 */}
      {!currentLocation && (
        <div className={styles.locationNotice}>
          <p>📍 위치 서비스를 허용하면 주변 스터디홀을 쉽게 찾을 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}

export default LocationSearch;