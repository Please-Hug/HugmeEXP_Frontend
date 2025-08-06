import React, { useState, useEffect, useRef } from "react";
import styles from "./RecruitmentSearch.module.scss";
import { FaSearch } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { getSearchSuggestions } from "../../../api/recruitmentService";

function RecruitmentSearch({ onSearch, onKeywordSearch }) {
  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("location"); // "location" or "keyword"
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const suggestionTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch suggestions when keyword changes (only in keyword search mode)
  useEffect(() => {
    if (searchType !== "keyword" || !keyword.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Clear previous timeout
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    
    // Set a new timeout to avoid too many API calls
    suggestionTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getSearchSuggestions(keyword);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
    
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [keyword, searchType]);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSearchClick = () => {
    if (searchType === "location") {
      onSearch(keyword);
    } else {
      onKeywordSearch(keyword);
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    } else if (e.key === "ArrowDown" && showSuggestions && suggestions.length > 0) {
      // Focus on the first suggestion
      const firstSuggestion = document.querySelector(`.${styles.suggestionItem}`);
      if (firstSuggestion) {
        firstSuggestion.focus();
      }
      e.preventDefault();
    }
  };
  
  const handleSuggestionKeyDown = (e, suggestion) => {
    if (e.key === "Enter") {
      handleSuggestionClick(suggestion);
    } else if (e.key === "ArrowDown") {
      // Focus on the next suggestion
      if (e.target.nextElementSibling) {
        e.target.nextElementSibling.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      // Focus on the previous suggestion or back to input
      if (e.target.previousElementSibling) {
        e.target.previousElementSibling.focus();
      } else {
        searchInputRef.current.focus();
      }
      e.preventDefault();
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion.companyName || suggestion.title || "");
    onKeywordSearch(suggestion.companyName || suggestion.title || "");
    setShowSuggestions(false);
  };
  
  const handleInputChange = (e) => {
    setKeyword(e.target.value);
    if (searchType === "keyword" && e.target.value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.toggleWrapper}>
        <button
          className={`${styles.toggleButton} ${searchType === "location" ? styles.active : ""}`}
          onClick={() => setSearchType("location")}
        >
          <FaMapMarkerAlt /> 지역명
        </button>
        <button
          className={`${styles.toggleButton} ${searchType === "keyword" ? styles.active : ""}`}
          onClick={() => setSearchType("keyword")}
        >
          <MdWork /> 키워드
        </button>
      </div>
      <div className={styles.searchWrapper}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={searchType === "location" ? "가고 싶은 지역명을 검색해보세요!" : "직무, 회사명 등 키워드를 검색해보세요!"}
          value={keyword}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchType === "keyword" && keyword.trim() && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className={styles.searchInput}
        />
        <button onClick={handleSearchClick} className={styles.searchButton}>
          <FaSearch />
        </button>
        
        {/* Suggestions dropdown */}
        {showSuggestions && searchType === "keyword" && (
          <div ref={suggestionsRef} className={styles.suggestionsContainer}>
            {isLoading ? (
              <div className={styles.loadingText}>검색 중...</div>
            ) : suggestions.length > 0 ? (
              suggestions.slice(0, 6).map((suggestion, index) => (
                <div
                  key={suggestion.id || suggestion.recruitmentId || index}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion)}
                  tabIndex="0"
                >
                  <div className={styles.suggestionContent}>
                    {suggestion.companyName && (
                      <div className={styles.companyName}>{suggestion.companyName}</div>
                    )}
                    {suggestion.title && (
                      <div className={styles.jobTitle}>{suggestion.title}</div>
                    )}
                    {!suggestion.companyName && !suggestion.title && (
                      <div className={styles.noInfo}>정보 없음</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>검색 결과가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruitmentSearch;
