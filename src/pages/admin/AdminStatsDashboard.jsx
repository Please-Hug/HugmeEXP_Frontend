import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getUserStats } from '../../api/adminService';
import styles from './AdminStatsDashboard.module.scss';

const AdminStatsDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('=== AdminStatsDashboard 컴포넌트 마운트됨 ===');

  useEffect(() => {
    let isMounted = true; // cleanup 플래그
    
    console.log('=== useEffect 실행됨 ===');
    
    const loadData = async () => {
      try {
        console.log('=== API 호출 시작 ===');
        const data = await getUserStats();
        console.log('=== API 호출 성공 ===');
        console.log('총 사용자:', data.totalUsers);
        console.log('활성 사용자:', data.activeUsers); 
        console.log('레벨별 분포:', data.levelDistribution);
        console.log('포인트 분포:', data.pointDistribution);
        console.log('권한별 분포:', data.roleDistribution);
        if (isMounted) {
          setStatsData(data);
        }
      } catch (err) {
        console.log('=== API 호출 실패 ===', err);
        if (isMounted) {
          setError('통계 데이터를 불러오는데 실패했습니다.');
          console.error('Stats fetch error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 플래그 설정
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div>통계 데이터를 불러오는 중...</div>
        <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '8px' }}>
          사용자별 출석 정보를 조회하고 있습니다. 잠시만 기다려주세요.
        </div>
        <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '8px' }}>
          DEBUG: 로딩 상태 - API 호출 중
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        {error}
        <div style={{ fontSize: '12px', marginTop: '8px' }}>
          DEBUG: 에러 상태 - {error}
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className={styles.error}>
        데이터를 불러올 수 없습니다.
        <div style={{ fontSize: '12px', marginTop: '8px' }}>
          DEBUG: statsData가 null입니다.
        </div>
      </div>
    );
  }

  // 차트 데이터 준비
  const levelChartData = Object.entries(statsData.levelDistribution || {})
    .sort(([a], [b]) => parseInt(a) - parseInt(b)) // 레벨 순으로 정렬
    .map(([level, count]) => ({
      level: `레벨 ${level}`,
      count
    }));

  const pointChartData = Object.entries(statsData.pointDistribution || {}).map(([range, count]) => ({
    range,
    count
  }));

  const roleChartData = Object.entries(statsData.roleDistribution || {}).map(([role, count]) => ({
    role: role === 'USER' ? '일반회원' : role === 'ADMIN' ? '관리자' : role,
    count
  }));

  // 파이차트 색상
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={styles.adminStats}>
      <div className={styles.header}>
        <h1>사용자 통계 대시보드</h1>
        <p>전체 사용자 현황 및 활동 통계</p>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardContent}>
            <h3>총 사용자</h3>
            <p className={styles.number}>{statsData.totalUsers.toLocaleString()}</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>⚡</div>
          <div className={styles.cardContent}>
            <h3>활성 사용자</h3>
            <p className={styles.number}>{statsData.activeUsers.toLocaleString()}</p>
            <span className={styles.percentage}>
              ({statsData.totalUsers > 0 
                ? ((statsData.activeUsers / statsData.totalUsers) * 100).toFixed(1)
                : 0}%)
            </span>
            <div className={styles.criteria}>
              {statsData.activeUsersCriteria || '최근 30일 내 출석'}
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <div className={styles.cardContent}>
            <h3>평균 레벨</h3>
            <p className={styles.number}>
              {statsData.totalUsers > 0 
                ? (Object.entries(statsData.levelDistribution)
                    .reduce((sum, [level, count]) => sum + (parseInt(level) * count), 0) / statsData.totalUsers).toFixed(1)
                : 0
              }
            </p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🎯</div>
          <div className={styles.cardContent}>
            <h3>총 포인트</h3>
            <p className={styles.number}>
              {statsData.users.reduce((sum, user) => sum + (user.point || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className={styles.chartsGrid}>
        {/* 레벨 분포 */}
        <div className={styles.chartCard}>
          <h3>레벨별 사용자 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 포인트 분포 */}
        <div className={styles.chartCard}>
          <h3>포인트 구간별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pointChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {pointChartData.map((entry, index) => (
                  <Cell key={`point-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {pointChartData.map((item, index) => (
              <div key={item.range} className={styles.legendItem}>
                <div 
                  className={styles.legendColor} 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.range}: {item.count}명</span>
              </div>
            ))}
          </div>
        </div>

        {/* 권한별 분포 */}
        <div className={styles.chartCard}>
          <h3>권한별 사용자 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {roleChartData.map((entry, index) => (
                  <Cell key={`role-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {roleChartData.map((item, index) => (
              <div key={item.role} className={styles.legendItem}>
                <div 
                  className={styles.legendColor} 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.role}: {item.count}명</span>
              </div>
            ))}
          </div>
        </div>

        {/* 월별 가입자 추이 - 실제 데이터 준비 후 활성화 */}
        {/* 
        <div className={styles.chartCard}>
          <h3>월별 가입자 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        */}
      </div>
    </div>
  );
};

export default AdminStatsDashboard;