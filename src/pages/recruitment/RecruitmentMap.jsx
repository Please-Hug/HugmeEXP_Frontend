import React, { useState, useEffect } from "react";
import { validateAndBuildParams } from "../../api/recruitmentService";
import RecruitmentMapHeader from "../../components/recruitment/recruitment_map/RecruitmentPageHeader";
import RecruitmentList from "../../components/recruitment/recruitment_map/RecruitmentList";
import RecruitmentDetail from "../../components/recruitment/recruitment_map/RecruitmentDetail";
import MapContainer from "../../components/recruitment/recruitment_map/MapContainer";

import { RecruitmentFilter } from "../../components/recruitment/recruitment_filter";
import RecruitmentSearch from "../../components/recruitment/recruitment_map/RecruitmentSearch";
import styles from "./RecruitmentMap.module.scss";
import MapBoundsDisplay from "../../components/recruitment/recruitment_map/MapBoundsDisplay";
import { getRecruitments } from "../../api/recruitmentService";

function RecruitmentMapPage() {
  // 기존 상태
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [salary, setSalary] = useState(0);
  const [experience, setExperience] = useState([-1, 10]); // Default range: -1 (경력무관) to 10 years
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [education, setEducation] = useState(0);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 기본 중심: 서울시청
  const [mapBounds, setMapBounds] = useState(null);
  const [isMapSearchActive, setIsMapSearchActive] = useState(false);
  const [shouldUseMapBounds, setShouldUseMapBounds] = useState(false);

  // API 연동 상태
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectJob = (job) => {
    console.log("job ID", job.id);
    setSelectedJob(job);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setSelectedJob(null);
    setIsMapSearchActive(false);
    setShouldUseMapBounds(false); // Don't use map bounds when filter changes
  };

  const handleRegionFilterChange = (region) => {
    setRegionFilter(region);
    setSelectedJob(null);
    setIsMapSearchActive(false);
    setShouldUseMapBounds(false); // Don't use map bounds when region filter changes
  };

  const handleSalaryChange = (value) => setSalary(parseInt(value, 10));
  const handleExperienceChange = (value) => {
    setExperience(value);
  };
  const handleSkillChange = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };
  const handleEducationChange = (value) => setEducation(parseInt(value, 10));

  // 채용 정보 API 호출
  useEffect(() => {
    const fetchRecruitments = async () => {
      const params = validateAndBuildParams({
        filterType,
        regionFilter,
        salary,
        experience,
        education,
        selectedSkills,
        isMapSearchActive,
        mapBounds: shouldUseMapBounds ? mapBounds : null,
      });

      if (!params) {
        setRecruitments([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getRecruitments(params);

        setRecruitments(data);
      } catch (err) {
        console.error("채용 정보 조회 실패:", err);
        setError(err.response?.data?.message || "채용 정보를 불러오는데 실패했습니다.");
        setRecruitments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruitments();
  }, [
    filterType,
    regionFilter,
    salary,
    experience,
    selectedSkills,
    education,
    isMapSearchActive,
    mapBounds,
  ]);

  const handleBoundsChange = (bounds) => {
    // Just update the bounds state but don't trigger API call
    setMapBounds(bounds);
  };

  const handleSearchCurrentMap = () => {
    // When user clicks "Search Current Map", enable map bounds for API call
    setIsMapSearchActive(true);
    setShouldUseMapBounds(true);
  };

  const handleSearch = (keyword) => {
    if (!keyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    setIsMapSearchActive(false);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const { y, x } = data[0];
        setMapCenter({ lat: parseFloat(y), lng: parseFloat(x) });
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 없습니다.");
      } else {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className={styles.pageContainer}>
      <RecruitmentMapHeader />
      <main className={styles.mainContent}>
        <div className={styles.listWrapper}>
          <RecruitmentSearch onSearch={handleSearch} />
          <div className={styles.filterWrapper}>
            <RecruitmentFilter
              onFilterChange={handleFilterChange}
              filterType={filterType}
              onRegionFilterChange={handleRegionFilterChange}
              regionFilter={regionFilter}
              salary={salary}
              onSalaryChange={handleSalaryChange}
              experience={experience}
              onExperienceChange={handleExperienceChange}
              selectedSkills={selectedSkills}
              onSkillChange={handleSkillChange}
              education={education}
              onEducationChange={handleEducationChange}
            />
          </div>
          <div className={styles.listContainer}>
            {loading && <div>로딩 중...</div>}
            {error && <div>에러가 발생했습니다.</div>}
            {!loading && !error && (
              <div className={styles.recruitmentContent}>
                <RecruitmentList
                  jobs={recruitments} // API 데이터로 변경
                  selectedJob={selectedJob}
                  onSelectJob={handleSelectJob}
                />
              </div>
            )}
          </div>
        </div>
        {selectedJob && (
        <div className={styles.detailContainer}>
       
          <RecruitmentDetail
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        </div>)}
        
        <div className={styles.mapWrapper}>
          <MapBoundsDisplay bounds={mapBounds} />
          <MapContainer
            onSearchCurrentMap={handleSearchCurrentMap}
            jobs={recruitments} // API 데이터로 변경
            selectedJob={selectedJob}
            onSelectJob={handleSelectJob}
            onBoundsChange={handleBoundsChange}
          />
        </div>
      </main>
    </div>
  );
}

export default RecruitmentMapPage;
