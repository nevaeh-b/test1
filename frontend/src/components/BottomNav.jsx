import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 현재 경로가 해당 메뉴의 경로로 시작하는지 체크
  const isActive = (path) => {
    if (path === '/home') return currentPath === '/' || currentPath === '/home';
    return currentPath.startsWith(path);
  };

  return (
    <nav className="app-nav">
      
      <button
        type="button" className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => navigate('/home')} >
        <img src="/icons/메뉴바-홈.png" alt="홈" className="nav-icon-img" />
      </button>

      <button type="button" className={`nav-item ${isActive('/course') ? 'active' : ''}`} onClick={() => navigate('/course')}>
        <img src="/icons/메뉴바-코스.png" alt="코스" className="nav-icon-img" />
      </button>

      <button type="button" className={`nav-item ${isActive('/congestion') ? 'active' : ''}`}  onClick={() => navigate('/congestion')}>
        <img src="/icons/메뉴바-지도.png" alt="지도" className="nav-icon-img" />
      </button>

      <button type="button" className={`nav-item ${isActive('/mypage') ? 'active' : ''}`}  onClick={() => navigate('/mypage')}>
        <img src="/icons/메뉴바-마이.png" alt="마이페이지" className="nav-icon-img" />
      </button>

    </nav>
  );
}