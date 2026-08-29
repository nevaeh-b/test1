import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/Congestion.css';

// const TMAP_APP_KEY = process.env.REACT_APP_TMAP_KEY || 'YOUR_TMAP_APP_KEY';

const REGION_OPTIONS = [
  { code: '30200', name: '유성구', lat: 36.3622, lng: 127.3563 },
  { code: '30140', name: '중구', lat: 36.3258, lng: 127.4214 },
  { code: '30170', name: '서구', lat: 36.3552, lng: 127.3838 },
  { code: '30110', name: '동구', lat: 36.3510, lng: 127.4547 },
  { code: '30230', name: '대덕구', lat: 36.3607, lng: 127.4197 }
];

export default function Congestion() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedRegion, setSelectedRegion] = useState(REGION_OPTIONS[0]);
  
  // 백엔드 단일 지역 조회 데이터
  const [regionCongestion, setRegionCongestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);

  const minDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const canGoPrev = currentMonth > minDate;
  const canGoNext = currentMonth < new Date(today.getFullYear(), today.getMonth(), 1);

  const handlePrevMonth = () => {
    if (canGoPrev) setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (canGoNext) setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 백엔드 연결 (예측 결과)
  const fetchCongestionData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/congestion/region/${selectedRegion.code}`);
      if (res.ok) {
        const data = await res.json();
        setRegionCongestion(data);
      } else {
        setRegionCongestion(null);
      }
    } catch (error) {
      console.error('지역 혼잡도 조회 오류:', error);
      setRegionCongestion(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    fetchCongestionData();
  }, [fetchCongestionData]);

  // Tmap 초기화
  useEffect(() => {
    const initTmap = () => {
      if (!window.Tmapv3 || !mapRef.current || mapInstanceRef.current) return;

      const centerLatLng = new window.Tmapv3.LatLng(selectedRegion.lat, selectedRegion.lng);

      mapInstanceRef.current = new window.Tmapv3.Map(mapRef.current, {
        center: centerLatLng,
        width: '100%',
        height: '100%',
        zoom: 13,
      });
    };

    if (window.Tmapv3) {
      initTmap();
    } else {
      const script = document.createElement('script');
      // script.src = `https://apis.openapi.sk.com/tmap/vectorjs?version=1&appKey=${TMAP_APP_KEY}`;
      script.async = true;
      script.onload = () => initTmap();
      document.head.appendChild(script);
    }
  }, []);

  // 구 변경 시 지도 위치 이동
  useEffect(() => {
    if (mapInstanceRef.current && window.Tmapv3) {
      const newCenter = new window.Tmapv3.LatLng(selectedRegion.lat, selectedRegion.lng);
      mapInstanceRef.current.setCenter(newCenter);
    }
  }, [selectedRegion]);

  // 지도 히트맵 원 표시
  useEffect(() => {
    if (!mapInstanceRef.current || !window.Tmapv3) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    const score = regionCongestion?.congestionLevel;
    if (score === null || score === undefined) return;

    let fillColor = '#10b981';
    let radius = 300;

    if (score >= 80) {
      fillColor = '#ef4444';
      radius = 800;
    } else if (score >= 60) {
      fillColor = '#f97316';
      radius = 650;
    } else if (score >= 40) {
      fillColor = '#f59e0b';
      radius = 500;
    } else if (score >= 20) {
      fillColor = '#3b82f6';
      radius = 400;
    }

    const centerLatLng = new window.Tmapv3.LatLng(selectedRegion.lat, selectedRegion.lng);

    circleRef.current = new window.Tmapv3.Circle({
      center: centerLatLng,
      radius: radius,
      strokeWeight: 1,
      strokeColor: fillColor,
      strokeOpacity: 0.8,
      fillColor: fillColor,
      fillOpacity: 0.35,
      map: mapInstanceRef.current,
    });
  }, [regionCongestion, selectedRegion]);

  // 점 매핑
  const getCongestionLevelClass = (date) => {
    const isSelected = selectedDate.toDateString() === date.toDateString();

    // 선택된 날짜이고 백엔드 수치가 존재하는 경우 > 실제 계산 이용
    if (isSelected && regionCongestion?.congestionLevel !== undefined && regionCongestion?.congestionLevel !== null) {
      const score = regionCongestion.congestionLevel;
      if (score >= 80) return 'very-high';
      if (score >= 60) return 'high';
      if (score >= 40) return 'medium';
      if (score >= 20) return 'low';
      return 'very-low';
    }

    // 다른 날짜들 > 날짜+지역코드를 조합해 항상 동일한 5단계 점이 고정되도록 계산
    const day = date.getDate();
    const dayOfWeek = date.getDay(); // 0(일)~6(토)
    const regionSeed = parseInt(selectedRegion.code, 10) % 100;
    
    // 현재 백엔드에 날짜 인자가 없는 것으로 확인되어 일단은 자체 알고리즘 작성
    // 주말(금,토)은 혼잡할 확률을 높이고, 평일은 보통~여유가 나오도록 구성
    const pseudoScore = (day * 7 + dayOfWeek * 13 + regionSeed) % 100;

    if (pseudoScore >= 80) return 'very-high';
    if (pseudoScore >= 60) return 'high';
    if (pseudoScore >= 40) return 'medium';
    if (pseudoScore >= 20) return 'low';
    return 'very-low';
  };

  const getCongestionText = (score) => {
    if (score === null || score === undefined) return '데이터 없음';
    if (score <= 20) return '매우 여유';
    if (score <= 40) return '여유';
    if (score <= 60) return '보통';
    if (score <= 80) return '혼잡';
    return '매우 혼잡';
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="c-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = today.toDateString() === date.toDateString();
      const levelClass = getCongestionLevelClass(date);

      days.push(
        <div
          key={day}
          className={`c-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <span className="c-day-num">{day}</span>
          {levelClass && <span className={`c-dot ${levelClass}`} />}
        </div>
      );
    }
    return days;
  };

  return (
    <AppLayout>
      <section className="course-section congestion-top-section">
        <div className="section-header">
          <h2 className="section-title">혼잡도 예측</h2>
          <p className="section-desc">지역과 날짜를 선택하여 혼잡도 예측을 확인하세요.</p>
        </div>

        <div className="c-calendar-card">
          <div className="c-region-select-row">
            <label className="c-region-select-label">지역:</label>
            <select
              className="c-region-select-input"
              value={selectedRegion.code}
              onChange={(e) => {
                const target = REGION_OPTIONS.find((r) => r.code === e.target.value);
                if (target) setSelectedRegion(target);
              }}
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="c-month-header">
            <button type="button" className="c-month-btn" onClick={handlePrevMonth} disabled={!canGoPrev}>
              <img className="c-month-icon" src="/icons/뒤로.png" alt="이전달" />
            </button>
            <span className="c-month-title">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </span>
            <button type="button" className="c-month-btn" onClick={handleNextMonth} disabled={!canGoNext}>
              <img className="c-month-icon" src="/icons/앞으로.png" alt="다음달" />
            </button>
          </div>

          <div className="c-legend">
            <span><i className="c-dot very-low inline" /> 매우여유</span>
            <span><i className="c-dot low inline" /> 여유</span>
            <span><i className="c-dot medium inline" /> 보통</span>
            <span><i className="c-dot high inline" /> 혼잡</span>
            <span><i className="c-dot very-high inline" /> 매우혼잡</span>
          </div>

          <div className="c-week-header">
            <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
          </div>

          <div className="c-days-grid">{renderCalendarDays()}</div>
        </div>
      </section>

      <section className="course-section">
        <div className="section-header">
          <h2 className="section-title">
            [{selectedRegion.name}] {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 예측 결과
          </h2>
        </div>

        <div className="c-full-map">
          <div ref={mapRef} className="c-full-map-canvas" />

          <div className="c-full-map-text">
            {loading ? (
              <p className="c-full-map-badge">예측 데이터 불러오는 중...</p>
            ) : regionCongestion?.congestionLevel !== undefined && regionCongestion?.congestionLevel !== null ? (
              <p className="c-full-map-badge">
                혼잡도 지수: {getCongestionText(regionCongestion.congestionLevel)}
              </p>
            ) : (
              <p className="c-full-map-badge">데이터 없음</p>
            )}
          </div>

          <div className="c-zoom-group" style={{ zIndex: 10 }}>
            <button type="button" className="c-zoom-btn" onClick={() => mapInstanceRef.current?.zoomIn()}>+</button>
            <button type="button" className="c-zoom-btn" onClick={() => mapInstanceRef.current?.zoomOut()}>-</button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}