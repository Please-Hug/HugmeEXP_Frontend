import { useState, useEffect } from "react";
import { userRank, getCurrentUser } from "../../api/userService";
import useTokenPayload from "../../stores/tokenPayloadStore";
import styles from "./RankingPage.module.scss";
import BASE_URL from "../../api/baseUrl";
import emptyUserProfile from "../../assets/images/user/empty-user-profile.svg";
import medal1st from "../../assets/images/user/medal_1st.png";
import medal2nd from "../../assets/images/user/medal_2nd.png";
import medal3rd from "../../assets/images/user/medal_3rd.png";

const RankingPage = () => {
  const [rankings, setRankings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tokenPayload = useTokenPayload((state) => state.tokenPayload);

  useEffect(() => {
    const fetchData = async () => {
      await fetchRankings();
      await fetchCurrentUser();
    };
    fetchData();
  }, [tokenPayload]);

  // 사용자별 미션 그룹 정보를 표시하는 함수
  const getUserMissionGroupsText = (user) => {
    // user 객체에서 missionGroups 정보를 찾기
    if (user.missionGroups && user.missionGroups.length > 0) {
      const missionNames = user.missionGroups
        .map((missionGroup) => missionGroup.name)
        .filter(Boolean) // null/undefined 제거
        .join(" | ");
      return missionNames || "참여 중인 미션이 없습니다";
    }

    // userMission 정보가 없는 경우 기본 텍스트
    return "참여 중인 미션이 없습니다";
  };

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const data = await userRank();
      console.log("랭킹 데이터:", data);
      setRankings(data);
    } catch (err) {
      setError("랭킹 데이터를 불러오는데 실패했습니다.");
      console.error("랭킹 데이터 로딩 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      userData.username = tokenPayload?.sub;
      setCurrentUser(userData);
    } catch (err) {
      console.error("현재 사용자 정보 로딩 에러:", err);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>랭킹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchRankings} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const topThree = rankings.slice(0, 3);
  const restRankings = rankings.slice(3);

  // 현재 사용자의 랭킹 순위와 퍼센트 계산
  const getCurrentUserRankInfo = () => {
    if (!currentUser || rankings.length === 0) {
      return { rank: null, percentage: "0%" };
    }

    // 현재 사용자의 랭킹에서의 순위 찾기
    const userRankIndex = rankings.findIndex(
      (user) => user.username === currentUser.username
    );

    if (userRankIndex === -1) {
      // 랭킹에 없는 경우 최하위로 가정
      const rank = rankings.length + 1;
      const percentage = Math.round((rank / (rankings.length + 1)) * 100);
      return { rank, percentage: `${percentage}%` };
    }

    const rank = userRankIndex + 1;
    const percentage = Math.round((rank / rankings.length) * 100);
    return { rank, percentage: `${percentage}%` };
  };

  const currentUserRankInfo = getCurrentUserRankInfo();

  const getPodiumOrder = (index) => {
    // 1등, 2등, 3등 순서로 배치
    return index + 1;
  };

  const getPodiumClass = (index) => {
    const classMap = { 0: "first", 1: "second", 2: "third" };
    return classMap[index];
  };

  const getMedalSrc = (index) => {
    const medalMap = {
      0: medal1st,
      1: medal2nd,
      2: medal3rd,
    };
    return medalMap[index];
  };

  const getMedalAlt = (index) => {
    const altMap = { 0: "Gold", 1: "Silver", 2: "Bronze" };
    return altMap[index];
  };

  return (
    <div className={styles.container}>
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className={styles.podium}>
          {topThree.map((user, index) => (
            <div
              key={user.id || index}
              className={`${styles.podiumItem} ${styles[getPodiumClass(index)]}`}
              style={{ order: getPodiumOrder(index) }}
            >
              <div className={styles.podiumUser}>
                <div className={styles.userAvatar}>
                  <img
                    src={
                      user.profileImageUrl
                        ? `${BASE_URL}${user.profileImageUrl}`
                        : emptyUserProfile
                    }
                    alt={user.name}
                  />
                </div>
                <div className={styles.crown}>
                  <img src={getMedalSrc(index)} alt={getMedalAlt(index)} />
                </div>
                <div className={styles.userName}>
                  {user.name || "사용자"}
                  <span className={styles.userLevel}>Lv.{user.level || 1}</span>
                </div>
                <div className={styles.userTitle}>
                  {getUserMissionGroupsText(user)}
                </div>
                <div className={styles.userExp}>{user.exp || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rest of Rankings */}
      {restRankings.length > 0 && (
        <div className={styles.rankingList}>
          {restRankings.map((user, index) => {
            const rank = index + 4;
            return (
              <div key={user.id || index} className={styles.rankingItem}>
                <div className={styles.rankNumber}>{rank}</div>
                <div className={styles.userAvatar}>
                  <img
                    src={
                      user.profileImageUrl
                        ? `${BASE_URL}${user.profileImageUrl}`
                        : emptyUserProfile
                    }
                    alt={user.name}
                  />
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>
                    {user.name || user.username || "익명 사용자"}
                    <span className={styles.userLevel}>
                      Lv.{user.level || 1}
                    </span>
                  </div>
                  <div className={styles.userTitle}>
                    {getUserMissionGroupsText(user)}
                  </div>
                </div>
                <div className={styles.userActions}>
                  <div className={styles.userExp}>{user.exp || 0} exp</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current User Section */}
      {currentUser && (
        <div className={styles.currentUserSection}>
          <div className={styles.currentUserItem}>
            <div className={styles.userRank}>
              {currentUserRankInfo.percentage}
            </div>
            <div className={styles.userAvatar}>
              <img
                src={
                  currentUser.profileImage
                    ? `${BASE_URL}${currentUser.profileImage}`
                    : emptyUserProfile
                }
                alt={currentUser.name || "현재 사용자"}
              />
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {currentUser.name || "익명 사용자"}
              </div>
              <div className={styles.userTitle}>
                {getUserMissionGroupsText(currentUser)}
              </div>
            </div>
            <div className={styles.userActions}>
              <div className={styles.userExp}>{currentUser.exp || 0} exp</div>
            </div>
          </div>
        </div>
      )}

      {rankings.length === 0 && (
        <div className={styles.emptyState}>
          <p>아직 랭킹 정보가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default RankingPage;
