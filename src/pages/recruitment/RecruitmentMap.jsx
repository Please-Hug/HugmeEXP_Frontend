import React, { useState, useEffect, createContext } from "react";
import { useParams } from "react-router-dom";
import { validateAndBuildParams, getRecruitments, getRecruitmentFilters, getSearchSuggestions } from "../../api/recruitmentService";
import RecruitmentMapHeader from "../../components/recruitment/recruitment_map/RecruitmentPageHeader";
import RecruitmentList from "../../components/recruitment/recruitment_map/RecruitmentList";
import RecruitmentDetail from "../../components/recruitment/recruitment_map/RecruitmentDetail";
import MapContainer from "../../components/recruitment/recruitment_map/MapContainer";

import { RecruitmentFilter } from "../../components/recruitment/recruitment_filter";
import RecruitmentSearch from "../../components/recruitment/recruitment_map/RecruitmentSearch";
import styles from "./RecruitmentMap.module.scss";
import MapBoundsDisplay from "../../components/recruitment/recruitment_map/MapBoundsDisplay";

// 기술 스택 데이터를 위한 Context 생성
export const FilterDataContext = createContext(null);

function RecruitmentMapPage() {
  const { jobId } = useParams(); // URL 파라미터에서 jobId 추출
  // 기존 상태
  const [selectedJob, setSelectedJob] = useState(jobId ? { id: jobId } : null); // jobId가 있으면 해당 채용 공고 선택
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

  // 필터 데이터 상태
  const [filterData, setFilterData] = useState({
    techStacks: [],
    educationOptions: [],
    experienceOptions: [],
  });
  const [filterDataLoading, setFilterDataLoading] = useState(true);

  // 기술 스택 ID로 기술 스택 정보 찾기 함수
  const findTechStackById = (id) => {
    if (filterDataLoading || !filterData.techStacks) return null;
    return filterData.techStacks.find((stack) => stack.id === id) || null;
  };

  const handleSelectJob = (job) => {
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

  // 필터 데이터 가져오기 (기술 스택, 교육, 경력 등)
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setFilterDataLoading(true);
        const data = await getRecruitmentFilters();
        setFilterData(data);
        console.log("Filter data loaded:", data);
      } catch (err) {
        console.error("Error fetching filter data:", err);
      } finally {
        setFilterDataLoading(false);
      }
    };

    fetchFilterData();
  }, []); // 페이지 로드 시 한 번만 실행

  // Define fetchRecruitments outside of useEffect so it can be called directly
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
        setIsMapSearchActive(false);
        setShouldUseMapBounds(false);
      } catch (err) {
        console.error("채용 정보 조회 실패:", err);
        setError(
          err.response?.data?.message || "채용 정보를 불러오는데 실패했습니다."
        );
        setRecruitments([]);
      } finally {
        setLoading(false);
      }
    };

  // 채용 정보 API 호출 - 필터 변경시에만 자동으로 호출
  useEffect(() => {
    fetchRecruitments();
  }, [
    filterType,
    regionFilter,
    salary,
    experience,
    selectedSkills,
    education,
    // isMapSearchActive 의존성 제거 - 이제 직접 호출하므로 필요 없음
  ]);

  const handleBoundsChange = (bounds) => {
    // Just update the bounds state but don't trigger API call
    setMapBounds(bounds);
  };

  const handleSearchCurrentMap = () => {
    // When user clicks "Search Current Map", enable map bounds for API call
    // Set both flags to ensure we use the latest map bounds
    setShouldUseMapBounds(true);
    setIsMapSearchActive(true);
    
    // Call fetchRecruitments directly with the latest map bounds
    // We need to use the current mapBounds state which should have been updated by MapContainer
    const params = validateAndBuildParams({
      filterType,
      regionFilter,
      salary,
      experience,
      education,
      selectedSkills,
      isMapSearchActive: true,
      mapBounds: mapBounds, // Use the latest mapBounds directly
    });
    
    if (params) {
      setLoading(true);
      setError(null);
      
      getRecruitments(params)
        .then(data => {
          setRecruitments(data);
          setIsMapSearchActive(false);
          setShouldUseMapBounds(false);
        })
        .catch(err => {
          console.error("채용 정보 조회 실패:", err);
          setError(err.response?.data?.message || "채용 정보를 불러오는데 실패했습니다.");
          setRecruitments([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
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
  
  const handleKeywordSearch = async (keyword) => {
    if (!keyword.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 키워드 검색을 위한 파라미터 생성
      const params = validateAndBuildParams({
        filterType,
        regionFilter,
        salary,
        experience,
        education,
        selectedSkills,
        isMapSearchActive: false,
        mapBounds: null,
        keyword: keyword.trim() // 키워드 추가
      });
      
      // getRecruitments API 호출하여 키워드로 채용 정보 검색
      const data = await getRecruitments(params);
      setRecruitments(data);
      setIsMapSearchActive(false);
      setShouldUseMapBounds(false);
      
      // 검색 결과가 있고 첫 번째 결과에 좌표가 있으면 지도 중심 이동
      if (data.length > 0 && data[0].latitude && data[0].longitude) {
        let lat = parseFloat(data[0].latitude);
        let lng = parseFloat(data[0].longitude);
        
        // 좌표가 뒤바뀌었을 가능성 체크
        const mightBeSwapped = (lat > 100 || lat < 30) && (lng > 30 && lng < 40);
        if (mightBeSwapped) {
          [lat, lng] = [lng, lat]; // 좌표 교환
        }
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapCenter({ lat, lng });
        }
      }
    } catch (err) {
      console.error("키워드 검색 실패:", err);
      setError(err.response?.data?.message || "키워드 검색에 실패했습니다.");
      setRecruitments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FilterDataContext.Provider
      value={{ filterData, loading: filterDataLoading, findTechStackById }}
    >
      <div className={styles.pageContainer}>
        <RecruitmentMapHeader />
        <main className={styles.mainContent}>
          <div className={styles.listWrapper}>
            <RecruitmentSearch onSearch={handleSearch} onKeywordSearch={handleKeywordSearch} />
            <div className={styles.filterWrapper}>
              {filterDataLoading ? (
                <div>필터 데이터 로딩 중...</div>
              ) : (
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
              )}
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
            mapCenter={mapCenter}
          />
        </div>
      </main>
    </div>
    </FilterDataContext.Provider>
  );
}

export default RecruitmentMapPage;
