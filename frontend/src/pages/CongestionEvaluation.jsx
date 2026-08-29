import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import VerifyResult from '../components/VerifyResult';
import { verifyPlaceLocation } from '../components/Verification';
import '../styles/common.css';
import '../styles/CongestionEvaluation.css';

export default function CongestionEvaluation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [allPlaces, setAllPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState(location.state?.placeName || '');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(
    location.state?.placeId 
      ? { id: Number(location.state.placeId), name: location.state.placeName || '' } 
      : null
  );

  const [verifiedPlaceIds, setVerifiedPlaceIds] = useState([]);
  const [isVerifiedPlace, setIsVerifiedPlace] = useState(false);

  const [visitTime, setVisitTime] = useState('2026-07-18T13:00');
  const [congestionLevel, setCongestionLevel] = useState(3);
  const [waitingTime, setWaitingTime] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickVerifying, setIsQuickVerifying] = useState(false);

  const [resultModal, setResultModal] = useState({
    isOpen: false,
    isSuccess: true,
    title: '',
    message: '',
    point: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const placesRes = await fetch('http://localhost:3000/places');
        if (placesRes.ok) {
          const placesData = await placesRes.json();
          setAllPlaces(Array.isArray(placesData) ? placesData : placesData.places || []);
        }

        if (token) {
          const stampRes = await fetch('http://localhost:3000/stamps/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (stampRes.ok) {
            const stampData = await stampRes.json();
            const openStampIds = stampData.openStamps || [];
            setVerifiedPlaceIds(openStampIds);

            if (location.state?.placeId) {
              setIsVerifiedPlace(openStampIds.includes(Number(location.state.placeId)));
            }
          }
        }
      } catch (error) {
        console.error('데이터 조회 오류:', error);
      }
    };

    fetchData();
  }, [location.state]);

  useEffect(() => {
    if (!searchTerm.trim() || selectedPlace) {
      setSearchResults([]);
      return;
    }

    const filtered = allPlaces.filter((place) =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filtered.slice(0, 4));
  }, [searchTerm, allPlaces, selectedPlace]);

  const handleSelectPlace = (e, place) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedPlace(place);
    setSearchTerm(place.name);
    setSearchResults([]);

    const verified = verifiedPlaceIds.includes(place.id);
    setIsVerifiedPlace(verified);
  };

  const handleClearSelection = () => {
    setSelectedPlace(null);
    setSearchTerm('');
    setIsVerifiedPlace(false);
    setSearchResults([]);
  };

  // 💡 공통 유틸 함수(verifyPlaceLocation)를 호출하는 약식 GPS 인증 처리 로직
  const handleQuickGpsVerify = async () => {
    if (!selectedPlace) return;

    if (!navigator.geolocation) {
      alert('이 브라우저에서는 GPS 위치 정보를 지원하지 않습니다.');
      return;
    }

    setIsQuickVerifying(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        try {
          const data = await verifyPlaceLocation({
            place: selectedPlace,
            currentCoords
          });

          setIsQuickVerifying(false);

          if (data.success) {
            setIsVerifiedPlace(true);
            setVerifiedPlaceIds((prev) => [...prev, selectedPlace.id]);
          }

          setResultModal({
            isOpen: true,
            isSuccess: data.success,
            title: data.success ? '장소 인증 성공!' : '장소 인증 실패',
            message: data.message || (data.success ? '장소 방문 인증이 완료되었습니다.' : '장소 200m 근처에서 다시 시도해 주세요.'),
            point: data.reward?.amount || 0
          });
        } catch (err) {
          setIsQuickVerifying(false);
          setResultModal({
            isOpen: true,
            isSuccess: false,
            title: '오류 발생',
            message: err.message || '인증 통신 중 오류가 발생했습니다.',
            point: 0
          });
        }
      },
      (error) => {
        console.error('GPS 수신 에러:', error);
        setIsQuickVerifying(false);
        alert('현재 위치 정보를 가져오지 못했습니다. GPS 위치 권한을 확인해 주세요.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlace) {
      alert('평가할 장소를 검색 후 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요한 서비스입니다.');
      }

      const reviewRes = await fetch('http://localhost:3000/congestion/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          placeId: selectedPlace.id,
          congestionLevel: Number(congestionLevel),
        }),
      });

      const reviewData = await reviewRes.json();
      if (!reviewRes.ok) {
        throw new Error(reviewData.message || '혼잡도 평가 제출에 실패했습니다.');
      }

      let earnedPoint = 0;
      let modalMessage = '장소 인증을 하지 않은 곳은 리워드가 지급되지 않습니다.';

      if (isVerifiedPlace) {
        const rewardRes = await fetch('http://localhost:3000/rewards/congestion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ placeId: selectedPlace.id }),
        });

        const rewardData = await rewardRes.json();
        if (rewardRes.ok) {
          earnedPoint = rewardData.amount || 100;
          modalMessage = '혼잡도 평가 제출이 완료되어 리워드가 지급되었습니다!';
        }
      }

      setIsSubmitting(false);
      setResultModal({
        isOpen: true,
        isSuccess: true,
        title: '평가 완료!',
        message: modalMessage,
        point: earnedPoint,
      });
    } catch (error) {
      setIsSubmitting(false);
      setResultModal({
        isOpen: true,
        isSuccess: false,
        title: '평가 실패',
        message: error.message || '혼잡도 평가 중 오류가 발생했습니다.',
        point: 0,
      });
    }
  };

  const handleConfirm = () => {
    setResultModal((prev) => ({ ...prev, isOpen: false }));
    if (resultModal.title === '평가 완료!' && resultModal.isSuccess) {
      navigate('/mypage');
    }
  };

  return (
    <AppLayout showHeader={true} title="혼잡도 평가하기" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>
      <div className="evaluation-container">
        <form className="evaluation-form" onSubmit={handleFormSubmit}>
          <div className="question-list">
            
            {/* 장소 검색 파트 */}
            <section className="question-item search-section-wrapper">
              <label htmlFor="place-search" className="question-label">
                방문하신 장소를 검색해 주세요
              </label>
              <div className="input-box" style={{ display: 'flex', gap: '8px' }}>
                <input
                  id="place-search"
                  type="text"
                  className="date-picker-input"
                  placeholder="장소명을 입력하여 검색 (예: 성심당)"
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
                    className="all-btn"
                    style={{ minWidth: '60px', padding: '0 10px' }}
                    onClick={handleClearSelection}
                  >
                    변경
                  </button>
                )}
              </div>

              {!selectedPlace && searchResults.length > 0 && (
                <ul className="search-results-dropdown">
                  {searchResults.map((place) => {
                    const isVerified = verifiedPlaceIds.includes(place.id);
                    return (
                      <li
                        key={place.id}
                        onMouseDown={(e) => handleSelectPlace(e, place)}
                      >
                        <span className="place-name-text">{place.name}</span>
                        {isVerified ? (
                          <span className="badge-verified">인증완료</span>
                        ) : (
                          <span className="badge-unverified">미인증</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              {selectedPlace && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {isVerifiedPlace ? (
                    <span style={{ color: '#2e7d32', fontWeight: '600', fontSize: '13px' }}>
                      ✓ 장소 인증이 완료된 장소입니다. (평가 완료 시 +100P)
                    </span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff5f5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ffe3e3' }}>
                      <div style={{ fontSize: '12px', color: '#e53935', fontWeight: '600' }}>
                        장소가 인증되지 않아 포인트가 지급되지 않습니다.
                      </div>
                      <button
                        type="button"
                        onClick={handleQuickGpsVerify}
                        disabled={isQuickVerifying}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#fff',
                          backgroundColor: '#004ea1',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {isQuickVerifying ? '위치 확인 중...' : '위치 인증하기'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Q1. 방문 시간 */}
            <section className="question-item">
              <label htmlFor="visit-time" className="question-label">
                Q1. 언제 방문하셨나요?
              </label>
              <div className="input-box">
                <input
                  id="visit-time"
                  type="datetime-local"
                  className="date-picker-input"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                />
              </div>
            </section>

            {/* Q2. 혼잡도 */}
            <section className="question-item">
              <span className="question-label">Q2. 전체적인 혼잡도는 어땠나요?</span>
              <div className="congestion-rating-container">
                <div className="radio-group">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <label key={level} className="rating-radio-label">
                      <input
                        type="radio"
                        name="congestion"
                        value={level}
                        checked={congestionLevel === level}
                        onChange={() => setCongestionLevel(level)}
                        className="visually-hidden"
                      />
                      <span className={`custom-radio ${congestionLevel === level ? 'selected' : ''}`}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="rating-text-labels">
                  <span className="label-text">매우 한가</span>
                  <span className="label-text">매우 혼잡</span>
                </div>
              </div>
            </section>

            {/* Q3. 웨이팅 시간 */}
            <section className="question-item">
              <span className="question-label">Q3. 웨이팅은 얼마나 걸렸나요?</span>
              <div className="waiting-options-group">
                {[
                  { id: 'none', label: '대기 없음' },
                  { id: '10-30', label: '10분 ~ 30분' },
                  { id: '30-60', label: '30분 ~ 1시간' },
                  { id: '60+', label: '1시간 이상' },
                ].map((option) => (
                  <label 
                    key={option.id} 
                    className={`waiting-card ${waitingTime === option.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setWaitingTime(option.id);
                    }}
                  >
                    <input
                      type="radio"
                      name="waitingTime"
                      value={option.id}
                      checked={waitingTime === option.id}
                      onChange={() => setWaitingTime(option.id)}
                      className="visually-hidden"
                    />
                    <div className="checkbox-indicator">
                      {waitingTime === option.id && <span className="check-mark">✓</span>}
                    </div>
                    <span className="option-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </section>

          </div>

          <button type="submit" className="primary-btn submit-btn" disabled={isSubmitting || isQuickVerifying}>
            <span>{isSubmitting ? '제출 중...' : '평가 완료'}</span>
            <span className="point-badge-inline">{isVerifiedPlace ? '+100P' : '0P'}</span>
          </button>
        </form>

        <VerifyResult 
          isOpen={resultModal.isOpen}
          isSuccess={resultModal.isSuccess}
          title={resultModal.title}
          message={resultModal.message}
          point={resultModal.point}
          onConfirm={handleConfirm}
          onRetry={() => setResultModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </AppLayout>
  );
}