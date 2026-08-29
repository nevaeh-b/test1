import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import StampProgressBar from '../components/StampProgressBar';
import '../styles/common.css';
import '../styles/Home.css';
import { characterData } from '../data/characterData';

export default function Home() {
  const navigate = useNavigate();

  // 배너 및 팁 슬라이드 상태
  const banners = [
    { id: 1, src: '/images/홈화면-배너.png', alt: '메인 배너 1', path: '/nighttour' },
    { id: 2, src: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=800&auto=format&fit=crop', alt: '배너 2', path: '/nighttour' }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const tips = [
    '팝업 이벤트 오픈',
    '대전 시티투어 버스 운행 안내',
    '신규 장소 인증 시 추가 포인트 지급!'
  ];
  const [currentTip, setCurrentTip] = useState(0);

  // 배너 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // 팁 타이머
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 2500);
    return () => clearInterval(tipTimer);
  }, [tips.length]);

  // 1. 유저 정보 상태
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    email: '',
    reward_balance: 0,
    profile_image: null,
  });

  // 2. 캐릭터 정보 및 스탬프 데이터 상태
  const [userResult, setUserResult] = useState(null);
  const [stampInfo, setStampInfo] = useState({
    totalStamps: 0,
    currentSetCount: 0, // 9개 기준 나머지 (0~9)
  });

  useEffect(() => {
    const fetchMyInfoAndStamps = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 사용자 정보
        const resUser = await fetch('http://localhost:3000/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await resUser.json();

        if (resUser.ok) {
          setUserInfo(userData);
        } else {
          localStorage.removeItem('accessToken');
          navigate('/login');
          return;
        }

        // 캐릭터 및 스탬프 정보
        const resStamps = await fetch('http://localhost:3000/stamps/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const stampsData = await resStamps.json();

        if (resStamps.ok) {
          // 캐릭터 데이터 매핑
          if (stampsData.character) {
            const matchedCharacter = characterData[stampsData.character];
            setUserResult(matchedCharacter || null);
          }

          // progress bar 계산 / 9개 단위
          const total = stampsData.totalStamps || 0;
          const currentCount = total > 0 && total % 9 === 0 ? 9 : total % 9;

          setStampInfo({
            totalStamps: total,
            currentSetCount: currentCount,
          });
        }
      } catch (error) {
        console.error('홈 화면 정보 조회 오류:', error);
      }
    };

    fetchMyInfoAndStamps();
  }, [navigate]);

  return (
    <AppLayout>
      <div className="home-container">
        
        {/* 배너 */}
        <section className="banner-wrapper">
          <img 
            className="banner-image-slim" 
            src={banners[currentSlide].src} 
            alt={banners[currentSlide].alt}
            onClick={() => navigate(banners[currentSlide].path)}
          />
          <div className="banner-dots">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </section>

        {/* 공지사항 */}
        <section className="tips-ticker" onClick={() => navigate('/mypage/notice')}>
          <span className="tips-icon">📢</span>
          <div className="tips-text-container">
            <span className="tips-text">{tips[currentTip]}</span>
          </div>
        </section>

        {/* 스탬프 수집 */}
        <section className="progress-section">
          <h3 className="section-title">
            {userResult ? `${userResult.name} 수집 진행 중` : '여행 캐릭터 수집 진행 중'}
          </h3>
          
          <StampProgressBar 
            current={stampInfo.currentSetCount} 
            total={9} 
          />
        </section>

        {/* 자주 찾는 메뉴 */}
        <section className="quick-menu-section">
          <h2 className="quick-menu-title">자주 찾는 메뉴</h2>
          <div className="quick-menu-grid">
            <button className="quick-menu-btn" onClick={() => navigate('/mypage/place-verify')}>
              <img src="/icons/인증.png" alt="인증" className="quick-icon" />
              <span>장소 인증하기</span>
            </button>
            <button className="quick-menu-btn" onClick={() => navigate('/mypage/inquiry')}>
              <img src="/icons/문의.png" alt="문의" className="quick-icon" />
              <span>문의하기</span>
            </button>
            <button className="quick-menu-btn" onClick={() => navigate('/nighttour')}>
              <img 
                src="/icons/혼잡도.png" 
                alt="야간 축제" 
                className="quick-icon" 
                onError={(e) => { e.target.src = '/icons/야간.png'; }} 
              />
              <span>야간 축제</span>
            </button>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}