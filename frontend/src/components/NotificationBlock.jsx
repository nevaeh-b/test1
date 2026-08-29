import { useNavigate } from 'react-router-dom';
import './NotificationBlock.css';

export default function NotificationBlock({ 
  type, 
  title, 
  message, 
  buttonText, 
  isDisabled = false, 
  onClick 
}) {
  const navigate = useNavigate();

  // 알림 타입 구분
  const getTypeBadge = () => {
    switch (type) {
      case 'RATING':
        return { text: '혼잡도 평가', className: 'badge-rating' };
      case 'CONGESTION':
        return { text: '혼잡도 안내', className: 'badge-congestion' };
      case 'NIGHT_TOUR':
        return { text: '야간 행사', className: 'badge-night' };
      case 'EVENT':
        return { text: '행사 안내', className: 'badge-event' };
      case 'STAY':
        return { text: '숙소 인증', className: 'badge-stay' };
      default:
        return { text: '알림', className: 'badge-default' };
    }
  };

  // 버튼 클릭
  const handleActionClick = (e) => {
    if (isDisabled) return;

    if (onClick) {
      onClick(e);
      return;
    }

    switch (type) {
      case 'RATING':
        navigate('/congestion/rating');
        break;
      case 'CONGESTION':
        navigate('/congestion');
        break;
      case 'NIGHT_TOUR':
        navigate('/nighttour');
        break;
      case 'EVENT':
        navigate('/nighttour');
        break;
      case 'STAY':
        navigate('/verify/stay');
        break;
      default:
        console.log('경로가 지정되지 않은 알림 타입입니다.');
        break;
    }
  };

  const badge = getTypeBadge();

  return (
    <div className={`noti-card ${isDisabled ? 'disabled' : ''}`}>
      {/* 헤더 (뱃지 + 제목) */}
      <div className="noti-card-header">
        <span className={`noti-badge ${badge.className}`}>{badge.text}</span>
        <h4 className="noti-card-title">{title}</h4>
      </div>

      {/* 본문 메시지 */}
      <p className="noti-card-message">{message}</p>

      {/* 버튼 */}
      {buttonText && (
        <button
          type="button"
          className="noti-card-btn"
          disabled={isDisabled}
          onClick={handleActionClick}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}