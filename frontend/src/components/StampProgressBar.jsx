import { useNavigate } from 'react-router-dom';
import './StampProgressBar.css';

export default function StampProgressBar({ current = 5, total = 8 }) {
  const navigate = useNavigate();
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="stamp-progress-card" onClick={() => navigate('/mypage/stamp')}>
      <div className="progress-header">
        <div className="progress-title-group">
          <span className="progress-badge">스탬프 보드</span>
          <span className="progress-title">꿈돌이 수집 진행 중! 🐥</span>
        </div>
        <span className="progress-count"><strong>{current}</strong> / {total}</span>
      </div>

      {/* 진행바 */}
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="progress-footer">
        <span>완성까지 {total - current}개 남았어요!</span>
        <span className="arrow-text">보드 보기 ▶</span>
      </div>
    </div>
  );
}