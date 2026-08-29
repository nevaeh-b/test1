import './VerifyResult.css';

export default function AuthResultModal({ 
  isOpen, 
  isSuccess, 
  title, 
  message, 
  subMessage, 
  earnedPoint = 0, // 포인트
  onConfirm, 
  onRetry 
}) {
  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        {/* 성공 / 실패 아이콘 */}
        <div className={`result-icon-circle ${isSuccess ? 'success' : 'fail'}`}>
          {isSuccess ? '✓' : '✕'}
        </div>

        {/* 타이틀 + 설명 */}
        <h3 className="result-title">{title || (isSuccess ? '인증 성공!' : '인증 실패')}</h3>
        <p className="result-message">{message}</p>

        {/* 서브 문구 */}
        {subMessage && (
          <p className="result-sub-message">
            {subMessage}
          </p>
        )}

        {/* 포인트 지급 내역 확인 */}
        {isSuccess && earnedPoint > 0 && (
          <div className="reward-point-badge">
            +{earnedPoint.toLocaleString()} P 적립 완료!
          </div>
        )}

        {/* 버튼 */}
        <div className="modal-btn-group">
          {isSuccess ? (
            <button type="button" className="modal-btn confirm-btn" onClick={onConfirm}>
              확인
            </button>
          ) : (
            <>
              {onRetry && (
                <button type="button" className="modal-btn retry-btn" onClick={onRetry}>
                  다시 시도
                </button>
              )}
              <button type="button" className="modal-btn close-btn" onClick={onConfirm}>
                닫기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}