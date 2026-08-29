import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/StampBoard.css';

export default function StampBoard() {
  const navigate = useNavigate();

  // 스탬프 API 데이터 상태
  const [stampData, setStampData] = useState({
    character: '',
    totalStamps: 0,
    totalSlots: 9,
    openStamps: [],
    progress: {
      TRAVELER_VERIFY: 0,
      STAY: 0,
      CONGESTION: 0,
      COURSE_COMPLETE: 0,
      NIGHT_EVENT: 0,
      PLACE_VERIFY: 0,
    },
    visitedPlaces: [], // 방문 인증된 장소 목록 (선택적 확장)
  });
  const [loading, setLoading] = useState(true);

  // GET /stamps/me 연동
  useEffect(() => {
    const fetchStampData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:3000/stamps/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStampData(data);
        }
      } catch (error) {
        console.error('스탬프 정보 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStampData();
  }, []);

  // 스탬프 리스트 생성
  const getEarnedStampList = () => {
    const { progress, visitedPlaces = [] } = stampData;
    const earnedList = [];

    // 1. 여행객 인증
    if (progress.TRAVELER_VERIFY > 0) {
      earnedList.push({ id: 'traveler', title: '여행객 인증 완료', point: '+1,000p' });
    }

    // 2. 숙박 인증
    if (progress.STAY > 0) {
      earnedList.push({ id: 'stay', title: '숙박 인증 완료', point: '+2,000p' });
    }

    // 3. 코스 완주
    if (progress.COURSE_COMPLETE > 0) {
      earnedList.push({ id: 'course', title: '코스 완주 완료', point: '+1,000p' });
    }

    // 4. 야간 관광
    if (progress.NIGHT_EVENT > 0) {
      earnedList.push({ id: 'night', title: '야간관광 참여 완료', point: '+1,000p' });
    }

    // 5. 혼잡도 평가
    if (progress.CONGESTION > 0) {
      earnedList.push({ id: 'congestion', title: '혼잡도 평가 완료', point: '+300p' });
    }

    // 6. 장소 방문 인증 (실제 방문 장소명이 전달되면 반영, 없으면 기본 장소 표기)
    const placeCount = progress.PLACE_VERIFY || 0;
    for (let i = 0; i < placeCount; i++) {
      const placeName = visitedPlaces[i]?.name || `추천 장소 ${i + 1}`;
      earnedList.push({
        id: `place-${i}`,
        title: `${placeName} 방문`,
        point: '+500p',
      });
    }

    // 최대 9개까지만 노출 (totalStamps 제한)
    return earnedList.slice(0, stampData.totalStamps || earnedList.length);
  };

  const earnedStamps = getEarnedStampList();

  const helpNoticeContent = (
    <ul className="help-notice-list">
      <li><strong>인증 유효기간:</strong> 여행객 및 장소 인증은 한 달까지 유지됩니다.</li>
      <li><strong>숙박 인증 조건:</strong> 여행객 인증을 완료한 회원의 경우에만 숙박 인증이 가능합니다.</li>
      <li><strong>장소 인증 범위:</strong> 추천 코스 내의 장소 방문 시에만 기본 장소 리워드가 수령 가능합니다.</li>
      <li><strong>코스 외 장소:</strong> 코스에 포함되지 않은 장소는 혼잡도 평가 참여를 통해서만 리워드를 수령할 수 있습니다.</li>
      <li>
        <strong>코스 완주 추가 리워드:</strong>
        <ul>
          <li>기본 완주 리워드: 1,000p</li>
          <li>장소 5개 이상 코스: +300p (총 1,300p)</li>
          <li>장소 8개 이상 코스: +800p (총 1,800p)</li>
          <li>장소 12개 이상 코스: +1,500p (총 2,500p)</li>
        </ul>
      </li>
      <li><strong>야간 관광 리워드:</strong> 앱 푸시 알림으로 사전에 정보가 제공된 공식 행사의 경우에만 리워드가 부여됩니다.</li>
    </ul>
  );

  return (
    <AppLayout 
      showHeader={true} 
      showNav={false}
      showBack={true}
      title="스탬프 보드"
      showActions={false}
      showHelp={true}
      helpTitle="스탬프 및 리워드 안내"
      helpContent={helpNoticeContent}
      onBack={() => navigate(-1)}
    >
      <div className="stamp-board-container">
        
        {/* 상단 챌린지 정보 카드 */}
        <div className="stamp-banner">
          <div className="banner-title">대전 여행 스탬프 챌린지</div>
          <div className="banner-sub">숙박 및 장소를 인증하고 스탬프를 모아보세요!</div>
          <div className="progress-info">
            <span>획득한 스탬프</span>
            <span className="count-text">
              {loading ? '-' : `${stampData.totalStamps}개`}
            </span>
          </div>
        </div>

        {/* 획득된 스탬프만  표시 (남은 빈 칸은 숨김) */}
        {earnedStamps.length > 0 ? (
          <div className="stamp-grid">
            {earnedStamps.map((item) => (
              <div key={item.id} className="stamp-card completed">
                <img className="stamp-img" src="/images/스탬프.png" alt="스탬프 찍힘" />
                <div className="stamp-text">
                  <div className="stamp-title-text">{item.title}</div>
                  <div className="stamp-point-text">{item.point}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="empty-stamp-notice">
              <p>아직 모은 스탬프가 없습니다.</p>
              <p className="sub-text">장소를 방문하거나 인증을 완료하여 스탬프를 채워보세요!</p>
            </div>
          )
        )}

        {/* 하단 버튼 영역 */}
        <div className="bottom-btn-area">
          <button 
            className="submit-btn" 
            onClick={() => navigate('/mypage/place-verify')}
          >
            장소 인증하고 스탬프 찍기
          </button>
        </div>

      </div>
    </AppLayout>
  );
}