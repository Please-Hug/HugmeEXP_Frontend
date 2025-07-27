import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMonthlyRegistrationStats } from '../../api/adminService';
import styles from './MonthlyRegistrationChart.module.css';

const MonthlyRegistrationChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const monthlyStats = await getMonthlyRegistrationStats();
        
        const chartData = monthlyStats.map(stat => ({
          month: stat.month,
          count: stat.count,
          growthRate: stat.growthRate,
          displayMonth: formatMonth(stat.month)
        }));
        
        setData(chartData);
      } catch (err) {
        setError('월별 가입자 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return `${parseInt(month)}월`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{data.month}</p>
          <p className={styles.tooltipValue}>
            가입자: <span>{data.count}명</span>
          </p>
          {data.growthRate !== null && (
            <p className={styles.tooltipGrowth}>
              전월 대비: 
              <span className={data.growthRate >= 0 ? styles.positive : styles.negative}>
                {data.growthRate > 0 ? '+' : ''}{data.growthRate}%
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>월별 가입자 데이터 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>월별 신규 가입자 추이</h3>
      </div>
      
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayMonth" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#4F46E5" 
              strokeWidth={3}
              dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>총 가입자 (12개월)</span>
          <span className={styles.summaryValue}>
            {data.reduce((sum, item) => sum + item.count, 0)}명
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>월 평균</span>
          <span className={styles.summaryValue}>
            {Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length)}명
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>최고 기록</span>
          <span className={styles.summaryValue}>
            {Math.max(...data.map(item => item.count))}명
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRegistrationChart;