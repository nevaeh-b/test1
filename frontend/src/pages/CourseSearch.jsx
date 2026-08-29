import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/CourseSearch.css';

export default function CourseSearch() {
  const navigate = useNavigate();

  // 선택된 검색 옵션 상태 관리
  const [period, setPeriods] = useState('1박 2일');
  const [transport, setTransport] = useState('대중교통');
  const [themes, setThemes] = useState(['역사/문화']);
  const [barriers, setBarriers] = useState(['영유아']);

  const [allPlaces, setAllPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // 백엔드 연결 (장소 데이터 로드)
  useEffect(() => {
    const fetchPlaces = async () => {
      try {

        const res = await fetch('http://localhost:3000/places?page=1&limit=100');

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || data.places || []);
          setAllPlaces(list);
        } else {
          console.warn(`Places API 응답 오류 (${res.status}): 주소나 쿼리 파라미터(Dto) 확인 필요`);
        }
      } catch (err) {
        console.error('장소 데이터 로드 실패:', err);
      }
    };

    fetchPlaces();
  }, []);

  // 숙소 검색 (드롭다운)  
  useEffect(() => {
    if (!searchTerm.trim() || selectedPlace) {
      setSearchResults([]);
      return;
    }

    const filtered = allPlaces.filter((place) => {
      const name = place.name || place.title || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setSearchResults(filtered.slice(0, 4));
  }, [searchTerm, allPlaces, selectedPlace]);

  const handleSelectPlace = (e, place) => {
    e.preventDefault();
    e.stopPropagation();

    const placeName = place.name || place.title || '';
    setSelectedPlace(place);
    setSearchTerm(placeName);
    setSearchResults([]);
  };

  // 선택 취소/변경
  const handleClearSelection = () => {
    setSelectedPlace(null);
    setSearchTerm('');
    setSearchResults([]);
  };

  // 다중 선택 토글 함수
  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const transportList = [
    { name: '도보', icon: '/icons/도보.png' },
    { name: '자전거', icon: '/icons/자전거.png' },
    { name: '대중교통', icon: '/icons/대중교통.png' },
    { name: '자동차', icon: '/icons/자동차.png' },
  ];

  const periodList = ['당일치기', '1박 2일', '2박 3일', '3박 4일', '4박 5일 이상'];
  const themeList = ['역사/문화', '자연', '맛집', '과학/체험', '야간'];
  const barrierList = ['영유아', '시각장애', '청각장애', '지체장애'];

  // 백엔드 요청 Enum 매핑
  const themeMap = {
    '역사/문화': 'HISTORY_CULTURE',
    '자연': 'NATURE',
    '맛집': 'FOOD',
    '과학/체험': 'SCIENCE_EXPERIENCE',
    '야간': 'NIGHT'
  };

  const barrierMap = {
    '영유아': 'INFANT',
    '시각장애': 'BLIND',
    '청각장애': 'DEAF',
    '지체장애': 'WHEELCHAIR'
  };

  const handleSearchSubmit = () => {
    const mappedThemes = themes.map((t) => themeMap[t] || t);
    const mappedBarriers = barriers.map((b) => barrierMap[b] || b);

    navigate('/course/result', {
      state: {
        period,
        transport,
        themes: mappedThemes,
        barrierFreeTypes: mappedBarriers,
        accommodation: selectedPlace ? (selectedPlace.name || selectedPlace.title) : searchTerm,
        accommodationPlaceCode: selectedPlace ? (selectedPlace.id || selectedPlace.place_code) : 1,
        rawThemes: themes,
        rawBarriers: barriers
      }
    });
  };

  return (
    <AppLayout showHeader={true} title="맞춤 코스 검색하기" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>
      <div className="course-search-container">
        
        {/* 숙소 검색 */}
        <section className="search-section" style={{ position: 'relative' }}>
          <h2 className="section-title">숙소 선택</h2>
          <div className="search-input-box" style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="search-input"
              placeholder="숙소명 입력하여 검색 (예: 성심당, 유성호텔)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedPlace) setSelectedPlace(null);
              }}
              readOnly={!!selectedPlace}
            />
            {selectedPlace && (
              <button
                type="button"
                className="chip-btn"
                style={{ minWidth: '60px', padding: '0 12px', height: 'auto' }}
                onClick={handleClearSelection}
              >
                변경
              </button>
            )}
          </div>

          {/* 드롭다운 */}
          {!selectedPlace && searchResults.length > 0 && (
            <ul 
              className="search-results-dropdown"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 100,
                listStyle: 'none',
                padding: '4px 0',
                margin: '4px 0 0 0',
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {searchResults.map((place) => {
                const placeName = place.name || place.title || '숙소명 없음';
                const placeAddr = place.addr1 || place.address || '대전';

                return (
                  <li
                    key={place.id || place.place_code}
                    onMouseDown={(e) => handleSelectPlace(e, place)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '14px',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <span style={{ fontWeight: '500', color: '#1e293b' }}>{placeName}</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{placeAddr}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 여행 기간 */}
        <section className="search-section">
          <h2 className="section-title">여행 기간</h2>
          <div className="chip-grid grid-3">
            {periodList.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip-btn ${period === item ? 'active' : ''}`}
                onClick={() => setPeriods(item)}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 이동수단 */}
        <section className="search-section">
          <h2 className="section-title">이동수단</h2>
          <div className="chip-grid grid-2">
            {transportList.map((item) => (
              <button
                key={item.name}
                type="button"
                className={`chip-btn ${transport === item.name ? 'active' : ''}`}
                onClick={() => setTransport(item.name)}
              >
                <img src={item.icon} alt={item.name} className="chip-icon" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 테마 코스 */}
        <section className="search-section">
          <h2 className="section-title">테마 코스</h2>
          <div className="chip-grid">
            {themeList.map((item) => {
              const isSelected = themes.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={`chip-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleSelection(item, themes, setThemes)}
                >
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 무장애 코스 */}
        <section className="search-section">
          <h2 className="section-title">무장애 코스</h2>
          <div className="chip-grid">
            {barrierList.map((item) => {
              const isSelected = barriers.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={`chip-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleSelection(item, barriers, setBarriers)}
                >
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 검색 실행 버튼 */}
        <button
          type="button"
          className="search-submit-btn"
          onClick={handleSearchSubmit}
        >
          <span>맞춤 코스 검색하기</span>
          <img src="/icons/다음.png" alt="" className="btn-icon" />
        </button>
      </div>
    </AppLayout>
  );
}