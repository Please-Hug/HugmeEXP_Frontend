import React, { useEffect, useState, useRef, use } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Notification.module.css";
import { set } from "date-fns";
import { fetchNotifications, markAllAsRead, markAsRead, subscribeToNotifications } from "../../../api/notificationService";

function Notification({ onClose, onOpenModal, isOpen, notifications, setNotifications }) {
    const [selectedTab, setSelectedTab] = useState("ACTIVITY");
    const dropdownRef = useRef(null);
    const [isFetched, setIsFetched] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [filtered, setFiltered] = useState([]);

    // sse 구독함수
    useEffect(() => {
        if (loading) 
            return;
        setLoading(true);
        const eventSource = subscribeToNotifications(
            (newNotification) => {
                console.log("SSE Event ", newNotification);
                const category = mapTypeToCategory(newNotification.type);
                setNotifications((prev) => [
                    { ...newNotification, category, read: false },
                    ...prev,
                ]);
            },
            (deletedId) => {
                console.log("알림 삭제됨:", deletedId);
                setNotifications((prev) => prev.filter((n) => n.id !== deletedId));
            },
            () => {
                setLoading(false);
            }
        );

        return () => {
            eventSource.close();
        };
    }, [setNotifications]);

    


    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // 모두 읽음 처리
    const handleReadAll = async () => {
        await markAllAsRead();
        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, read: true }));
            console.log("모두 읽음 처리:", updated);
            return updated;
        });
    };

    // 알림 읽음 처리
    const handleMarkAsRead = async (id) => {
        await markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === id ? { ...n, read: true} : n
            )
        );
    }

    // 클릭 시 해당 페이지로 이동
    const handleNotificationClick = async (noti) => {
        await markAsRead(noti.id);

        setNotifications((prev) => 
            prev.map((n) =>
                n.id === noti.id ? { ...n, read: true } : n
            )
        );

        // targetId가 없으면 이동하지 않음
        if (!noti.targetId) {
            console.log("알림에 targetId가 없습니다. 이동하지 않습니다. 레벨업은 이동하지 않습니다.");
            console.log("noti 객체: ", noti);
            return;
        }

        // 칭찬 상세 페이지 이동
        if(noti.type === "PRAISE_RECEIVED") {
            onOpenModal("PRAISE",noti.targetId);
            onClose();
        }

        // TODO: 나중에 다른 타입 분기 추가
    }
    

    const activityCount = notifications.filter(n => n.category === "ACTIVITY" && !n.read).length;
    const rewardCount = notifications.filter(n => n.category === "REWARD" && !n.read).length;
    //const filtered = notifications.filter(n => n.category === selectedTab);
    useEffect(() => {
        const filteredNotifications = notifications.filter(n => n.category === selectedTab);
        setFiltered(filteredNotifications);
    }, [selectedTab, notifications]);
    console.log("현재 탭:", selectedTab, "필터링 후:", filtered);

    return (
        <div className={styles.wrapper} ref={dropdownRef}>
            <div className={styles.header}>
                <span className={styles.title}>알림</span>
                <button className={styles.readAllButton} onClick={handleReadAll}>
                    모두 읽음
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${selectedTab === "ACTIVITY" ? styles.active : ""}`}
                    onClick={() => setSelectedTab("ACTIVITY")}
                >
                    활동/소식 <span className={styles.badge}>{activityCount}</span>
                </button>
                <button
                    className={`${styles.tab} ${selectedTab === "REWARD" ? styles.active : ""}`}
                    onClick={() => setSelectedTab("REWARD")}
                >
                    보상 <span className={styles.badge}>{rewardCount}</span>
                </button>
            </div>

            <div className={styles.list}>
                {filtered.length === 0 ? (
                    <p className={styles.empty}>알림이 없습니다.</p>
                ) : (
                    filtered.map((noti) => (
                        <div 
                            key={noti.id} 
                            className={styles.card}
                            onClick={() => handleNotificationClick(noti)}
                            style={{ backgroundColor: noti.read ? "#f9f9f9" : "#fff"}}
                        >
                            <div className={styles.content}>{noti.content}</div>
                            <div className={styles.time}>{formatTimeAgo(noti.createdAt)}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return "";

    const diff = (new Date() - new Date(dateStr)) / 1000;
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
}

function mapTypeToCategory(type) {
    if (["PRAISE_RECEIVED", "DIARY_COMMENT", "DIARY_LIKE"].includes(type)) return "ACTIVITY";
    if (["LEVEL_UP", "MISSION_REWARD"].includes(type)) return "REWARD";
    return "ACTIVITY";
}



export default Notification;
