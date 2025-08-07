import { useMemo } from 'react';

/**
 * 개발 모드 감지를 위한 유틸리티 함수
 */

/**
 * 현재 URL이 개발 모드인지 확인
 * 개발 모드는 다음 조건 중 하나를 만족할 때 활성화됨:
 * 1. URL에 'dev=1' 파라미터가 있는 경우, 또는
 * 2. URL 경로에 '/dev-'가 포함된 경우
 * 
 * @returns {boolean} 개발 모드이면 true, 아니면 false
 */
export const isDevMode = () => {
  // SSR 환경에서 window 객체가 없을 경우 방어 코드
  if (typeof window === 'undefined') return false;

  // URL 파라미터 확인 (예: ?dev=1)
  const urlParams = new URLSearchParams(window.location.search);
  const hasDevParam = urlParams.get('dev') === '1';
  
  // URL 경로 확인 (예: /dev-recruitment/map)
  const pathname = window.location.pathname;
  const hasDevPath = pathname.includes('/dev-');
  
  // 두 조건 중 하나라도 만족하면 true 반환
  return hasDevParam || hasDevPath;
};

/**
 * 컴포넌트에서 개발 모드 상태를 사용하기 위한 React 훅
 * 성능 최적화를 위해 useMemo 사용
 * 
 * @returns {boolean} 개발 모드이면 true, 아니면 false
 */
export const useDevMode = () => {
  // 이 훅을 사용하는 컴포넌트에서 useMemo를 import 해야 함
  // import { useMemo } from 'react';
  
  // 컴포넌트에서 사용 예시:
  // const isDevMode = useDevMode();
  
  return useMemo(() => isDevMode(), []);
};
