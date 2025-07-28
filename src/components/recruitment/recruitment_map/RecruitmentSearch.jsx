import React, { useState } from "react";
import styles from "./RecruitmentSearch.module.scss";
import { FaSearch } from "react-icons/fa";

function RecruitmentSearch({ onSearch }) {
  const [keyword, setKeyword] = useState("");

  const handleSearchClick = () => {
    onSearch(keyword);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="가고 싶은 지역, 회사 검색해보세요!"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.searchInput}
        />
        <button onClick={handleSearchClick} className={styles.searchButton}>
          <FaSearch />
        </button>
      </div>
    </div>
  );
}

export default RecruitmentSearch;
