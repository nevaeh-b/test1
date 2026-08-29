import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/SettingAccount.css';

export default function SettingAccount() {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    nickname: '',
    email: '',
    reward_balance: 0,
    profile_image: null,
  });

  // 백엔드 연결 (내 정보)
  useEffect(() => {
    const fetchMyInfo = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const resUser = await fetch('http://localhost:3000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await resUser.json();

        if (resUser.ok) {
          setUserInfo(userData);
        } else {
          localStorage.removeItem('accessToken');
          navigate('/login');
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
    };

    fetchMyInfo();
  }, [navigate]);

  // 로그아웃 처리
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('accessToken');
      alert('로그아웃 되었습니다.');
      navigate('/login');
    }
  };

  // 회원탈퇴 처리
  const handleWithdrawal = async () => {
    if (window.confirm('정말로 탈퇴하시겠습니까? 데이터가 모두 삭제됩니다.')) {
      const token = localStorage.getItem('accessToken');
      try {
        const res = await fetch('http://localhost:3000/users/me', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          localStorage.removeItem('accessToken');
          alert('회원탈퇴가 완료되었습니다.');
          navigate('/login');
        } else {
          alert('회원탈퇴 처리에 실패했습니다.');
        }
      } catch (error) {
        console.error('회원탈퇴 중 오류 발생:', error);
      }
    }
  };

  return (
    <AppLayout
      showHeader={true}
      title="계정"
      showNav={false}
      showActions={false}
      showBack={true}
      onBack={() => navigate(-1)}
    >
      <div className="sub-setting-container">
        <div className="setting-content">
          {/* 로그인 정보 */}
          <div className="setting-section">
            <div className="setting-group-title">로그인 정보</div>
            <div className="setting-box">
              <div className="setting-item non-clickable">
                <div className="item-text">이메일</div>
                {/* 조회된 이메일 바인딩 */}
                <div className="item-value">{userInfo.email || '불러오는 중...'}</div>
              </div>
              <div
                className="setting-item"
                onClick={() => navigate('/login/reset-pw')} // 비밀번호 변경 페이지 경로 지정
              >
                <div className="item-text">비밀번호 변경</div>
                <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
              </div>
            </div>
          </div>

          {/* 계정 관리 */}
          <div className="setting-section">
            <div className="setting-group-title">계정 관리</div>
            <div className="setting-box">
              <div className="setting-item" onClick={handleLogout}>
                <div className="item-text text-danger">로그아웃</div>
              </div>
              <div className="setting-item" onClick={handleWithdrawal}>
                <div className="item-text text-gray">회원탈퇴</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}