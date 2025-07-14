import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./DashboardMenu.module.scss";

function DashboardMenu() {
  const menuItems = [
    // { path: "/dashboard", label: "홈", end: true },
    // { path: "/activity", label: "활동" },
    // { path: "/settings", label: "설정" },
  ];

  return (
    <ul className={styles.dashboardMenu}>
      {menuItems.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            className={({ isActive }) => (isActive ? styles.active : "")}
            end={item.end}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default DashboardMenu;
