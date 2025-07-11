import React, { useState, useRef, useEffect } from "react";
import styles from "./Sidebar.module.scss";
import emptyUserProfile from "../../../assets/images/user/empty-user-profile.svg";
import api from "../../../api/axiosInstance.js";
import {
  FaLightbulb,
  FaBolt,
  FaBuilding,
  FaBell,
  FaHouse,
  FaBook,
  FaThumbsUp,
  FaGraduationCap,
  FaChessBoard,
  FaCartShopping,
  FaRankingStar,
  FaAnglesLeft,
} from "react-icons/fa6";
import logo from "../../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../stores/userStore";
import SidebarUserMenu from "./SidebarUserMenu";
import SidebarMissionGroup from "./SidebarMissionGroup";
import { getMyMissionGroups } from "../../../api/missionService";
import Notification from "../SideModal/Notification.jsx";
import PraiseDetailModal from "../../Praise/PraiseDetailModal";
import { fetchNotifications } from "../../../api/notificationService.js";
import useTokenPayload from "../../../stores/tokenPayloadStore.js";

function getQuickMenuItems() {
  return [
    { icon: <FaLightbulb />, label: "AI 안아줘요" },
    { icon: <FaBolt />, label: "빠른 검색" },
    { icon: <FaBell />, label: "알림" },
  ];
}

function getMenuItems() {
  return [
    { icon: <FaHouse />, label: "홈" },
    { icon: <FaBook />, label: "배움일기", link: "/study-diary" },
    { icon: <FaThumbsUp />, label: "칭찬", link: "/praises" },
    { icon: <FaGraduationCap />, label: "미션", link: "/mission" },
    { icon: <FaChessBoard />, label: "퀘스트", link: "/quest" },
    { icon: <FaCartShopping />, label: "상점", link: "/shop" },
    { icon: <FaRankingStar />, label: "랭킹", link: "/ranking" },
  ];
}

function getLecturerMenuItems() {
  return [
    { icon: <FaHouse />, label: "홈" },
    { icon: <FaBook />, label: "배움일기", link: "/study-diary" },
    { icon: <FaThumbsUp />, label: "칭찬", link: "/praises" },
    { icon: <FaGraduationCap />, label: "미션", link: "/mission" },
    { icon: <FaBook />, label: "미션 제출 현황", link: "/challenge" },
    { icon: <FaChessBoard />, label: "퀘스트", link: "/quest" },
    { icon: <FaCartShopping />, label: "상점", link: "/shop" },
    { icon: <FaRankingStar />, label: "랭킹", link: "/ranking" },
  ];
}

function Sidebar() {
  const quickMenuItems = getQuickMenuItems();
  let menuItems = getMenuItems();
  const tokenPayload = useTokenPayload((state) => state.tokenPayload);

  // 강사일 경우 메뉴 아이템 변경
  if (tokenPayload?.role === "ROLE_LECTURER") {
    menuItems = getLecturerMenuItems();
  }

  // const missionGroupItems = getMissonGroupItems();
  const navigate = useNavigate();
  const userInfo = useUserStore((state) => state.userInfo);
  const [userMenuToggle, setUserMenuToggle] = useState(false);
  const userMenuRef = useRef(null);
  const [missionGroupItems, setMissionGroupItems] = useState([]);

  // 알림 사이드모달 상태
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const bellRef = useRef(null);
  const [modalInfo, setModalInfo] = useState({
    type: null, // "PRAISE" | "DIARY" | null
    targetId: null, // 해당 모달에 열어야 할 대상 ID
  });

  useEffect(() => {
    if (isNotificationOpen && !isFetched) {
      fetchNotifications().then((data) => {
        setNotifications(data);
        setIsFetched(true);
      });
    }
  }, [isNotificationOpen, isFetched]);

  useEffect(() => {
    const fetchMissionGroups = async () => {
      try {
        const response = await getMyMissionGroups();
        setMissionGroupItems(response.data);
      } catch (error) {
        console.error("미션 그룹을 가져오는 데 실패했습니다:", error);
      }
    };
    fetchMissionGroups();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!userInfo) {
    return <div>로딩중...</div>;
  }

  return (
    <>
      <div className={styles.sidebar}>
        <div>
          <div className={styles.sidebarHeader}>
            <div>
              <FaBuilding />
              <span>EDUCATION</span>
            </div>
            <div>
              <FaAnglesLeft />
            </div>
          </div>
          <div className={styles.sidebarTitle}>
            <img src={logo} alt="Logo" />
            <span>허그톤 비욘드호라이즌</span>
          </div>
          <hr />
          <div className={styles.menuList}>
            {/* 퀵 메뉴 클릭 이벤트 수정*/}
            <ul>
              {quickMenuItems.map((item, index) => (
                <li
                  key={index}
                  ref={item.label === "알림" ? bellRef : null}
                  onClick={() => {
                    if (item.label === "알림") {
                      setIsNotificationOpen(!isNotificationOpen); // 알림 모달 열기
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <hr />
            <ul>
              {menuItems.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    navigate(item.link || "/");
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </li>
              ))}
              <hr />
            </ul>
            {missionGroupItems && missionGroupItems.length > 0 && (
              <SidebarMissionGroup missionGroupItems={missionGroupItems} />
            )}
          </div>
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userStats}>
            <div>
              Lv. <span>{userInfo.level}</span>
            </div>
            <div>
              <span>{userInfo.point}</span>개
            </div>
          </div>
          <div className={styles.userProfile} ref={userMenuRef}>
            <div>
              <img
                src={
                  userInfo?.profileImage
                    ? `${api.defaults.baseURL}${userInfo.profileImage}`
                    : emptyUserProfile
                }
                alt={userInfo?.name || "사용자 프로필"}
                onClick={() => setUserMenuToggle(!userMenuToggle)}
              />
              {userMenuToggle && <SidebarUserMenu />}
            </div>
            <span>©hug Inc.</span>
          </div>
        </div>
      </div>

      {/* Notification 컴포넌트 고정 렌더링 */}
      {bellRef.current && (
        <div
          style={{
            position: "absolute",
            top: bellRef.current.getBoundingClientRect().top + window.scrollY,
            left: bellRef.current.getBoundingClientRect().right + 8, // 아이콘 오른쪽에 붙이기
            zIndex: 2000,
            display: isNotificationOpen ? "block" : "none",
          }}
        >
          <Notification
            onClose={() => setIsNotificationOpen(false)}
            onOpenModal={(type, id) => setModalInfo({ type, targetId: id })}
            isOpen={isNotificationOpen}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        </div>
      )}

      {/* 모달 정보에 따라 모달 컴포넌트 렌더링 */}
      {modalInfo.type === "PRAISE" && modalInfo.targetId && (
        <PraiseDetailModal
          isOpen
          onClose={() => setModalInfo({ type: null, targetId: null })}
          praiseId={modalInfo.targetId}
          currentUser={userInfo}
          fetchPraise={() => {}} // 필요시 전달
        />
      )}

      {/* 일기 상세 모달 렌더링 */}
      {/* {modalInfo.type === "DIARY" && modalInfo.targetId && (
        <DiaryDetailModal
          isOpen
          onClose={() => setModalInfo({ type: null, targetId: null })}
          diaryId={modalInfo.targetId}
        />
      )} */}
    </>
  );
}

export default Sidebar;
