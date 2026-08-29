import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import StampProgressBar from '../components/StampProgressBar';
import '../styles/common.css';
import '../styles/Mypage.css';
import { characterData } from '../data/characterData';

export default function MyPage() {
  const navigate = useNavigate();
  
  // 사용자 정보
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    email: '',
    reward_balance: 0,
    profile_image: null,
  });

  // 캐릭터 및 스탬프 정보
  const [userResult, setUserResult] = useState(null);
  const [stampInfo, setStampInfo] = useState({
    totalStamps: 0,
    currentSetCount: 0,
  });

  useEffect(() => {
    const fetchMyInfoAndStamps = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 사용자 정보 조회
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

        // 캐릭터 및 스탬프 정보 조회
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

          const total = stampsData.totalStamps || 0;
          const currentCount = total > 0 && total % 9 === 0 ? 9 : total % 9;

          setStampInfo({
            totalStamps: total,
            currentSetCount: currentCount,
          });
        }
      } catch (error) {
        console.error('마이페이지 정보 조회 오류:', error);
      }
    };

    fetchMyInfoAndStamps();
  }, [navigate]);

  return (
    <AppLayout>
      <div className="mypage-container">
        
        {/* 1. 프로필 & 포인트 카드 */}
        <section className="profile-card">
          <div className="profile-main">
            <img src={userInfo.profile_image || "/images/프로필.png"} className="profile-img" alt="프로필" />
            
            <div className="profile-info">
              <div className="name-wrapper">
                <h2 className="profile-name">{userInfo.nickname || '사용자'}</h2>
              </div>
              
              <div className="badge-tag">
                <img src="/icons/인증.png" className="badge-icon" alt="인증" />
                <span>
                  여행객 인증 완료
                  <span className="badge-divider"> | </span>
                  <strong className={userResult ? "profile-type-text" : "profile-type-none"}>
                    {userResult ? userResult.name : '유형 테스트 미진행'}
                  </strong>
                </span> 
              </div>
            </div>

            <button type="button" className="settings-btn" aria-label="설정" onClick={() => navigate('/mypage/setting')}>
              <img src="/icons/설정.png" className="settings-icon" alt="설정" />
            </button>
          </div>

          {/* 포인트 + 지역화폐 */}
          <div className="assets-card">
            <div className="asset-item">
              <span className="asset-value">{(userInfo.reward_balance || 0).toLocaleString()}</span>
              <span className="asset-label">내 포인트</span>
            </div>
            <div className="asset-divider" />
            <div className="asset-item">
              <span className="asset-value">{(userInfo.reward_balance || 0).toLocaleString()}</span>
              <span className="asset-label">내 지역화폐</span>
            </div>
          </div>

          {/* 포인트 전환 버튼 */}
          <button type="button" className="convert-btn" onClick={() => navigate('/mypage/currency')}>
            지역화폐로 전환하기
          </button>
        </section>

        {/* 2. 유형 테스트 바로가기 */}
        {!userResult && (
          <section 
            className="test-banner-card" 
            onClick={() => navigate('/test/start', { state: { from: 'mypage' } })}
          >
            <div className="test-banner-left">
              <span className="test-tag">성향 검사</span>
              <h4 className="test-title">나의 여행 유형 테스트하기</h4>
              <p className="test-desc">새로운 맞춤형 여행 코스를 찾아보세요!</p>
            </div>
            <img src="/icons/앞으로.png" alt="이동" className="arrow-icon-btn" />
          </section>
        )}

        {/* 3. 스테이플러스 스탬프 진행 영역 */}
        <section className="menu-section">
          <h3 className="section-title">
            {userResult ? `${userResult.name} 수집 진행 중` : '여행 캐릭터 수집 진행 중'}
          </h3>
          
          <StampProgressBar 
            current={stampInfo.currentSetCount} 
            total={9} 
          />

          <div className="menu-list">
            <button type="button" className="menu-item" onClick={() => navigate('/mypage/place-verify')}>
              <div className="menu-left">
                <img src="/icons/인증.png" className="menu-icon" alt="" />
                <span>장소 인증하기</span>
              </div>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>

            <button type="button" className="menu-item" onClick={() => navigate('/mypage/accommodation-verify')}>
              <div className="menu-left">
                <img src="/icons/인증.png" className="menu-icon" alt="" />
                <span>숙박 인증하기</span>
              </div>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>

            <button type="button" className="menu-item" onClick={() => navigate('/mypage/tourist', { state: { from: 'mypage' } })}>
              <div className="menu-left">
                <img src="/icons/인증3.png" className="menu-icon" alt="" />
                <span>여행객 인증하기</span>
              </div>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>

            <button type="button" className="menu-item" onClick={() => navigate('/test/start')}>
              <div className="menu-left">
                <img src="/icons/가방.png" className="menu-icon" alt="" />
                <span>나의 여행 유형 테스트하기</span>
              </div>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>
          </div>
        </section>

        {/* 4. 고객 만족 센터 */}
        <section className="menu-section">
          <h3 className="section-title">고객 만족 센터</h3>
          <div className="menu-list text-only">
            <button type="button" className="menu-item" onClick={() => navigate('/onboarding')}>
              <span>도움말</span>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>
            <button type="button" className="menu-item" onClick={() => navigate('/mypage/notice')}>
              <span>공지사항</span>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>
            <button type="button" className="menu-item" onClick={() => navigate('/mypage/faq')}>
              <span>자주 묻는 질문</span>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>
            <button type="button" className="menu-item" onClick={() => navigate('/mypage/inquiry')}>
              <span>1:1 카톡 문의</span>
              <img src="/icons/앞으로.png" alt="앞으로" className="icon-button" />
            </button>
          </div>
        </section>

      </div>
    </AppLayout>
  );
}