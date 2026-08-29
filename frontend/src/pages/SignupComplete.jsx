import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/SignupComplete.css'; 

export default function SignupComplete() {
  const navigate = useNavigate();
  // 불러오는 동안 표시할 기본값 (또는 빈 문자열 '')
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      // 로컬 스토리지 내 토큰 가져오기
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('accessToken이 없습니다.');
        return;
      }

      try {
        // 사용자 정보 불러오기
        const response = await fetch('http://localhost:3000/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userNickname = data.nickname;
          if (userNickname) {
            setNickname(userNickname);
          }
        } else {
          console.error('사용자 정보 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('서버 통신 에러:', error);
      }
    };

    fetchUserProfile();

      const storedNickname = localStorage.getItem('nickname') || '회원';
      setNickname(storedNickname);

      const timer = setTimeout(() => {
        navigate('/onboarding'); 
      }, 5000);

      return () => clearTimeout(timer); 
    }, [navigate]);

  return (
    <AppLayout showHeader={false} showNav={false}>
      <div className="signup-complete-container">
        
        <div className="complete-content">
          <div className="emoji">🎉</div>
          <div className="title">회원 가입 완료 !</div>
          <div className="welcome-text">
            {nickname ? `${nickname} 님` : '회원 님'}의 가입을 환영합니다!<br />
            5초 후 자동으로 홈 화면으로 이동합니다.
          </div>
        </div>

        <div className="bottom-btn-area">
          <button className="submit-btn" onClick={() => navigate('/onboarding')}>홈 화면으로 돌아가기</button>
        </div>

      </div>
    </AppLayout>
  );
}