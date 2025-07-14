import React, { useState, useEffect, useRef } from "react";
import {
  getBookmarks,
  addBookmark,
  updateBookmark,
  removeBookmark,
} from "../../api/bookmarkService";
import styles from "./BookmarkSection.module.scss";

function BookmarkSection() {
  const [bookmarks, setBookmarks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetId: null });

  const contextMenuRef = useRef(null);
  const formRef = useRef(null);

  const loadBookmarks = async () => {
    try {
      const data = await getBookmarks();
      setBookmarks(Array.isArray(data) ? data : []);
    } catch {
      setBookmarks([]);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  // 컨텍스트 메뉴 바깥 클릭/스크롤 시 닫기
  useEffect(() => {
    const handler = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("scroll", handler, true);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("scroll", handler, true);
    };
  }, [contextMenu.visible]);

   // [추가] 모달 열릴 때 ESC/ENTER 단축키 리스너 등록
  useEffect(() => {
  if (!modalOpen) return;
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    } else if (
      e.key === "Enter" &&
      document.activeElement.tagName === "INPUT"
    ) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [modalOpen]);

  // 모달 열기
  const openAddModal = () => {
    setEditItem(null);
    setLink("");
    setTitle("");
    setModalOpen(true);
  };
  // 모달 열기(수정)
  const openEditModal = (item) => {
    setEditItem(item);
    setLink(item.link);
    setTitle(item.title);
    setModalOpen(true);
    setContextMenu({ ...contextMenu, visible: false });
  };
  // 모달 닫기
  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    setLink("");
    setTitle("");
  };

  // 폼 제출 (추가/수정)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateBookmark(editItem.id, { title, link });
      } else {
        await addBookmark({ title, link });
      }
      closeModal();
      await loadBookmarks();
    } catch {
      alert("저장 실패");
    }
  };

  // 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("삭제할까요?")) return;
    try {
      await removeBookmark(id);
      setContextMenu({ ...contextMenu, visible: false });
      await loadBookmarks();
    } catch {
      alert("삭제 실패");
    }
  };

  // Chip 우클릭(컨텍스트 메뉴 열기)
  const handleChipRightClick = (e, id) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetId: id,
    });
  };

  return (
    <div className={styles.BookmarkSection}>
      <section className={styles.section}>
      {/* 툴바 */}
      <div className={styles.toolbar}>
        <button className={styles.addBtn} onClick={openAddModal}>
          북마크 추가
        </button>
        {/* 북마크 리스트: 한 줄, 가로 스크롤 */}
        <div className={styles.chipList}>
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className={styles.chip}
              onContextMenu={(e) => handleChipRightClick(e, bm.id)}
              onKeyDown={(e) => {
                if (e.Key === 'Enter' || e.key === ' ') {
                    window.open(bm.link, '_blank');
                }
              }}
              tabIndex={0}
              title={bm.link}
              role="button"
              aria-label={`북마크: ${bm.title || bm.link}`}
            >
              <a
                href={bm.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chipLink}
                aria-hidden="true"
                tabIndex={-1}
              >
                {bm.title || bm.link}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 컨텍스트 메뉴 (Chip 우클릭 시) */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
        <div className ={styles.menuItem} onClick={() => {
            const bookmark = bookmarks.find(bm => bm.id === contextMenu.targetId);
            if (bookmark) {
                openEditModal(bookmark);
            }
        }}>
        ✏️ 수정하기
        </div>
        <div
        className={styles.menuItem}
        style={{ color: "#ec5353" }}
        onClick={() => handleDelete(contextMenu.targetId)}
        >
            🗑 삭제하기
          </div>
        </div>
      )}

      {/* 북마크 추가/수정 모달 */}
      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
            <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <form ref={formRef} onSubmit={handleSubmit}>
                <label htmlFor="bookmark-url" className={styles.label}>
                URL
                <input
                    id="bookmark-url"
                    type="url"
                    className={styles.input}
                    value={link}
                    required
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                    autoFocus
                />
                </label>
                <label htmlFor="bookmark-title" className={styles.label}>
                표시할 텍스트
                <input
                    id="bookmark-title"
                    type="text"
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="링크를 나타낼 텍스트를 작성해주세요"
                />
                </label>
                <div>
                <div className={styles.modalActionRow}>
                  <button
                    type="button"
                    className={styles.modalCancelBtn}
                    onClick={closeModal}
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className={styles.modalOkBtn}
                  >
                    {editItem ? "수정하기" : "추가하기"}
                  </button>
                </div>
                </div>
            </form>
          </div>
        </div>
        )}
     </section>    
    </div>
  );
}

export default BookmarkSection;