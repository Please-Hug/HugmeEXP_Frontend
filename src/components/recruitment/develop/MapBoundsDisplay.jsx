import React from "react";
import styles from "./MapBoundsDisplay.module.scss";

function MapBoundsDisplay({ bounds }) {
  if (!bounds) {
    return null;
  }

  const formatCoord = (coord) => {
    if (
      !coord ||
      typeof coord.lat !== "number" ||
      typeof coord.lng !== "number"
    ) {
      return "N/A";
    }
    return `Lat: ${coord.lat.toFixed(6)}, Lng: ${coord.lng.toFixed(6)}`;
  };

  return (
    <div className={styles.boundsContainer}>
      {bounds.diagonalDistance && (
        <div className={styles.boundItem}>
          <strong>현재 지도 범위 대각선 거리:</strong> {bounds.diagonalDistance}
        </div>
      )}
      <div className={styles.boundItem}>
        <strong>NE:</strong> {formatCoord(bounds.northEast)}
      </div>
      <div className={styles.boundItem}>
        <strong>NW:</strong> {formatCoord(bounds.northWest)}
      </div>
      <div className={styles.boundItem}>
        <strong>SE:</strong> {formatCoord(bounds.southEast)}
      </div>
      <div className={styles.boundItem}>
        <strong>SW:</strong> {formatCoord(bounds.southWest)}
      </div>
    </div>
  );
}

export default MapBoundsDisplay;
