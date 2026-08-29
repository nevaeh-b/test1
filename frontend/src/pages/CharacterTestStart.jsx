import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/CharacterTestStart.css';

export default function CharacterTestStart() {
  const navigate = useNavigate();
  const location = useLocation();

  // 진입 경로에 따라 설정 다르게
  const from = location.state?.from || 'mypage';

  const handleStart = () => {
    navigate('/test', { state: { from } });
  };

  const handleSkip = () => {
    navigate('/signup/complete');
  };

  return (
    <AppLayout 
      showHeader={true}
      showBack={from === 'mypage'}
      onBack={() => navigate(-1)}
      showActions={false}
      showNav={false}
      title="여행 유형 테스트"
    >
      <div className="test-start-container">
        {from === 'tourist' && (
          <div className="skip-btn-area">
            <button type="button" className="skip-btn" onClick={handleSkip}>
              건너뛰기
            </button>
          </div>
        )}

        <div className="test-start-content">
          <div className="badge-wrapper">
            <span className="test-badge">대전 여행 성향 분석</span>
          </div>

          <h2 className="main-title">
            나만의 대전 여행 스타일을<br />
            알아볼까요?
          </h2>

          <p className="sub-desc">
            간단한 9가지 질문을 통해<br />
            나에게 딱 맞는 맞춤 여행 코스를 추천해 드려요!
          </p>
        </div>

        {/* 시작 버튼 */}
        <div className="bottom-btn-area">
          <button type="button" className="submit-btn active" onClick={handleStart}>
            테스트 시작하기
          </button>
        </div>
      </div>
    </AppLayout>
  );
}