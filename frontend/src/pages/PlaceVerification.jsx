import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import VerifyResult from '../components/VerifyResult';
import { verifyPlaceLocation } from '../components/Verification';
import '../styles/common.css';
import '../styles/PlaceVerification.css';

export default function PlaceVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialCoursePlaceId = location.state?.coursePlaceId || null;
  const initialPlace = location.state?.place || null;

  const [allPlaces, setAllPlaces] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(initialPlace ? initialPlace.name : '');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(initialPlace);

  const [currentCoords, setCurrentCoords] = useState(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [resultModal, setResultModal] = useState({
    isOpen: false,
    isSuccess: false,
    title: '',
    message: '',
    point: 0
  });

  // 장소 데이터 로드
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch('http://localhost:3000/places');
        if (res.ok) {
          const data = await res.json();
          setAllPlaces(Array.isArray(data) ? data : data.places || []);
        } else {
          // 백엔드 연결 실패 시 더미 데이터
          setAllPlaces([
            { id: 1, name: '성심당 본점', lat: 36.3276, lng: 127.4273, address: '대전 중구 은행동' },
            { id: 2, name: '카이스트 본원', lat: 36.3721, lng: 127.3604, address: '대전 유성구 어은동' }
          ]);
        }
      } catch (err) {
        console.error('장소목록 로드 오류:', err);
        setAllPlaces([
          { id: 1, name: '성심당 본점', lat: 36.3276, lng: 127.4273, address: '대전 중구 은행동' },
          { id: 2, name: '카이스트 본원', lat: 36.3721, lng: 127.3604, address: '대전 유성구 어은동' }
        ]);
      }
    };

    fetchPlaces();
  }, []);

  // 검색 시 드롭다운 처리
  useEffect(() => {
    if (!searchKeyword.trim() || selectedPlace) {
      setSearchResults([]);
      return;
    }

    const filtered = allPlaces.filter((place) =>
      place.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    setSearchResults(filtered.slice(0, 4));
  }, [searchKeyword, allPlaces, selectedPlace]);

  // GPS 내 위치 가져오기
  const getCurrentLocation = () => {
    setIsGpsLoading(true);
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 GPS 위치 정보 지원을 받지 못합니다.');
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsGpsLoading(false);
      },
      (error) => {
        console.error('GPS 수신 실패:', error);
        alert('현재 위치 정보를 가져오지 못했습니다. 위치 권한을 확인해주세요.');
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // 장소 선택 드롭다운 클릭 이벤트
  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setSearchKeyword(place.name);
    setSearchResults([]);
  };

  // 선택한 장소 변경/초기화 이벤트
  const handleClearSelection = () => {
    setSelectedPlace(null);
    setSearchKeyword('');
    setSearchResults([]);
  };

  // 공통 위치 인증 진행
  const handleVerifyLocation = async () => {
    if (!selectedPlace) {
      alert('인증할 장소를 먼저 선택해주세요.');
      return;
    }

    if (!currentCoords) {
      alert('현재 위치 정보를 수신 중입니다. 잠시 후 다시 시도해 주세요.');
      getCurrentLocation();
      return;
    }

    setIsVerifying(true);

    try {
      const data = await verifyPlaceLocation({
        place: selectedPlace,
        currentCoords,
        coursePlaceId: initialCoursePlaceId
      });

      setIsVerifying(false);
      setResultModal({
        isOpen: true,
        isSuccess: data.success,
        title: data.success ? '장소 인증 성공!' : '장소 인증 실패',
        message: data.message || (data.success ? '장소 방문이 확인되었습니다.' : '장소 근처에서 다시 시도해 주세요.'),
        point: data.reward?.amount || 0
      });
    } catch (err) {
      setIsVerifying(false);
      setResultModal({
        isOpen: true,
        isSuccess: false,
        title: '오류 발생',
        message: err.message || '인증 과정 중 네트워크 오류가 발생했습니다.',
        point: 0
      });
    }
  };

  const handleConfirmModal = () => {
    setResultModal((prev) => ({ ...prev, isOpen: false }));
    if (resultModal.isSuccess) {
      navigate('/congestion/rating');
    }
  };

  return (
    <AppLayout showActions={false} showNav={false} showBack={true} title="장소 인증">
      {isVerifying && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner" />
            <p>GPS 좌표 확인 및<br />방문 인증 진행 중...</p>
          </div>
        </div>
      )}

      <div className="veri-content">
        <section className="search-section-wrapper" style={{ position: 'relative', marginBottom: '16px' }}>
          <div className="input-box" style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="veri-search-input"
              placeholder="인증할 장소명을 검색하세요 (예: 성심당)"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                if (selectedPlace) setSelectedPlace(null);
              }}
              readOnly={!!selectedPlace}
            />
            {selectedPlace && (
              <button
                type="button"
                className="veri-search-btn"
                style={{ minWidth: '60px', padding: '0 10px', backgroundColor: '#6c757d' }}
                onClick={handleClearSelection}
              >
                변경
              </button>
            )}
          </div>

          {!selectedPlace && searchResults.length > 0 && (
            <ul className="search-results-dropdown">
              {searchResults.map((place) => (
                <li
                  key={place.id}
                  onMouseDown={() => handleSelectPlace(place)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="place-name-text">{place.name}</span>
                  {place.address && <span style={{ fontSize: '11px', color: '#888', marginLeft: '8px' }}>{place.address}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 선택된 장소 카드 */}
        <div className="veri-card-list">
          <div className="veri-card">
            <div className="card-info">
              <span className="card-label">선택된 장소</span>
              <span className="card-text">
                {selectedPlace ? selectedPlace.name : '장소를 검색 후 선택해 주세요'}
              </span>
            </div>
            <div className="card-icon-wrapper">
              <img src="/icons/location.png" alt="위치" className="card-icon" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          </div>
        </div>

        {/* GPS 상태 표시바 */}
        <div className="gps-status-bar">
          <span className="gps-text">
            GPS: {isGpsLoading ? '위치 찾는 중...' : currentCoords ? '현재 위치 수신 완료' : '수신 실패'}
          </span>
          <button type="button" className="refresh-gps-btn" onClick={getCurrentLocation}>
            새로고침
          </button>
        </div>

        {/* 안내사항 */}
        <div className="notice-box">
          <div className="notice-title">💡 GPS 장소 인증 안내</div>
          <ol className="notice-list">
            <li>실제 방문 장소 근처(200m 이내)에서 인증을 진행해 주세요.</li>
            <li>모바일 위치 서비스(GPS)가 활성화되어 있어야 합니다.</li>
            <li>인증 완료 시 스탬프 및 리워드가 즉시 적립됩니다.</li>
          </ol>
        </div>
      </div>

      <div className="bottom-btn-area">
        <button
          type="button"
          className="submit-btn"
          disabled={!selectedPlace || isVerifying}
          onClick={handleVerifyLocation}
        >
          현재 위치로 장소 인증 완료하기
        </button>
      </div>

      <VerifyResult
        isOpen={resultModal.isOpen}
        isSuccess={resultModal.isSuccess}
        title={resultModal.title}
        message={resultModal.message}
        point={resultModal.point}
        onConfirm={handleConfirmModal}
        onRetry={() => setResultModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </AppLayout>
  );
}