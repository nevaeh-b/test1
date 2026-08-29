import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import NotificationBlock from '../components/NotificationBlock';
import '../styles/common.css';
import '../styles/Notification.css';

export default function Notification() {
  const [isNudgeActive, setIsNudgeActive] = useState(true);

  // 기본 알림 데이터
  const defaultNotifications = [
    {
      id: 1,
      type: 'RATING',
      title: '방문 장소 혼잡도 평가 요청',
      message: 'KAIST 방문을 확인했습니다. 실시간 현장 혼잡도를 평가하고 혜택 포인트를 받아보세요!',
      buttonText: '평가 참여하기 (+300P)',
    },
    {
      id: 2,
      type: 'CONGESTION',
      title: '혼잡 우회 경로 안내',
      message: '현재 위치하신 유성온천거리 일대의 혼잡도가 매우 높습니다. 쾌적하게 이동할 수 있는 대안 장소를 추천해 드려요.',
      buttonText: '대안 장소 확인',
    },
    {
      id: 3,
      type: 'NIGHT_TOUR',
      title: '맞춤형 야간 관광 이벤트',
      message: '오늘 19:00, 국립중앙과학관에서 환상적인 열기구 야간 라이팅 쇼가 펼쳐집니다.',
      buttonText: '이벤트 상세보기',
    }
  ];

  return (
    <AppLayout showActions={false} showNav={false} showBack={true} title="알림">
      <div className="notification-container">
        <div className="noti-content">
          
          {/* 위치 토글 */}
          <div className="nudge-card">
            <div className="nudge-info">
              <div className="nudge-title">위치 기반 넛지 알림 활성화</div>
            </div>
            <div 
              className={`toggle-switch ${isNudgeActive ? 'active' : ''}`}
              onClick={() => setIsNudgeActive((prev) => !prev)}
            >
              <div className="toggle-circle"></div>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="list-section">
            <div className="list-title">
              알림 목록
              {!isNudgeActive && (
                <span className="disabled-text">(알림 비활성화됨)</span>
              )}
            </div>
            
            <div className="noti-list">
              {defaultNotifications.map((noti) => (
                <NotificationBlock
                  key={noti.id}
                  type={noti.type}
                  title={noti.title}
                  message={noti.message}
                  buttonText={noti.buttonText}
                  isDisabled={!isNudgeActive}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}