import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationIcon from '/icons/notification.png';
import backIcon from '/icons/뒤로.png';
import helpIcon from '/icons/도움말.png';
import './Header.css';

export default function Header({ 
  title = "어디가유", 
  showBack = false, 
  showActions = true,
  showHelp = false, // 도움말
  helpTitle = "안내사항",
  helpContent = null,
  onBack, 
  points: initialPoints = 0
}) {
  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [points, setPoints] = useState(initialPoints);

  // 백엔드 연결: 포인트 조회
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch('http://localhost:3000/rewards/balance', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setPoints(data.balance ?? 0);
        }
      } catch (error) {
        console.error('포인트 조회 실패:', error);
      }
    };

    if (showActions) {
      fetchBalance();
    }
  }, [showActions]);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      <header className="app-header">
        {/* 왼쪽 영역: 뒤로가기(옵션) + 제목 */}
        <div className="header-left">
          {showBack && (
            <button 
              type="button" 
              className="icon-button back-button" 
              onClick={handleBackClick}
              aria-label="뒤로가기"
            >
              <img src={backIcon} alt="뒤로가기" className="nav-icon-img" />
            </button>
          )}
          <h1 className="header-title">{title}</h1>
        </div>

        {/* 오른쪽 영역: 포인트 + 알림 + 도움말 */}
        <div className="header-actions">
          {showActions && ( 
            <>
              <div className="point-badge" onClick={() => navigate('/point/conversion')} style={{ cursor: 'pointer' }}>
                <span className="point-value">{points.toLocaleString()}</span>
                <div className="point-icon">P</div>
              </div>  
              <button type="button" className="icon-button" aria-label="알림" onClick={() => navigate('/alarm')}>
                <img src={notificationIcon} alt="알림" className="nav-icon-img" />
              </button>
            </>
          )}

          {/* 도움말 버튼 */}
          {showHelp && (
            <button 
              type="button" 
              className="icon-button help-icon-button" 
              aria-label="도움말"
              onClick={() => setShowHelpModal(true)}
            >
              <img src={helpIcon} alt="도움말" className="nav-icon-img" />
            </button>
          )}
        </div>
      </header>

      {/* 도움말 모달 팝업 */}
      {showHelp && showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="help-modal-header">
              <h3>{helpTitle}</h3>
              <button 
                type="button" 
                className="close-btn" 
                onClick={() => setShowHelpModal(false)}
                aria-label="닫기"
              >
                ✖
              </button>
            </div>
            <div className="help-modal-body">
              {helpContent ? helpContent : (
                <div className="empty-help-content">
                  {/* 나중에 모달 내용 추가 */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}