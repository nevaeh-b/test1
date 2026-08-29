import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/KaKaoinquiry.css';

export default function KakaoInquiry() {
  const navigate = useNavigate();

  // 카카오톡 채널 이동 (링크 주소 변경 필요!!!)
  const handleKakaoConnect = () => {
    window.open('https://pf.kakao.com/_xxxxxx', '_blank');
  };

  return (
    <AppLayout showHeader={true} title="1:1 카톡 문의"
      showNav={false}
      showActions={false}
      showBack={true}
      onBack={() => navigate(-1)}
    >
      <div className="kakao-inquiry-container">
        {/* 안내 */}
        <div className="kakao-card">
          <div className="kakao-info-header">
            <h2 className="inquiry-title">무엇을 도와드릴까요?</h2>
            <p className="inquiry-subtext">
              카카오톡을 통해 궁금한 점을 문의해주시면 빠르게 상담 받으실 수 있습니다.
            </p>
          </div>

          {/* 카카오톡 연결 바 */}
          <button type="button" className="kakao-connect-btn" onClick={handleKakaoConnect}
          >
            <img 
              src="/icons/문의.png" 
              alt="카카오톡" 
              className="kakao-btn-icon" 
            />
            <span className="kakao-btn-text">카카오톡 채널 상담 연결</span>
          </button>

          <div className="kakao-notice-box">
            <h4 className="notice-title">운영 안내</h4>

            {/* 시간 정보 칩 박스 */}
            <div className="time-info-group">
              <div className="time-chip">
                <span className="chip-label">상담 시간</span>
                <span className="chip-value">평일 10:00 ~ 20:00</span>
              </div>
              <div className="time-chip">
                <span className="chip-label">점심 시간</span>
                <span className="chip-value">평일 12:30 ~ 13:30</span>
              </div>
            </div>

            {/* 하단 안내 문구 */}
            <p className="notice-footer-text">
              주말 및 공휴일 문의 건은 다음 영업일에 순차적으로 답변드립니다.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}