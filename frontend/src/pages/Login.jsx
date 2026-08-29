import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) { // 로컬 스토리지에 저장
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/');
      } else {
        // 에러 메세지 저장
        setErrorMessage(data.message || '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('백엔드 통신 에러:', error);
      setErrorMessage('서버와 통신할 수 없습니다.');
    }
  };

  // 구글 로그인
  const handleGoogleLogin = () => {
    // 예시: Google OAuth 인증 후 받은 토큰으로 호출 처리
    // window.location.href = "구글_OAuth_URL";
    console.log('Google 로그인 시도');
  };

  // 네이버 로그인
  const handleNaverLogin = () => {
    // window.location.href = "네이버_OAuth_URL";
    console.log('Naver 로그인 시도');
  };

  // 카카오 로그인
  const handleKakaoLogin = () => {
    // Kakao SDK 또는 OAuth Redirect를 통해 accessToken 획득 후 handleSocialLoginRequest('kakao', token) 호출
    console.log('Kakao 로그인 시도');
  };

  return (
    <AppLayout showHeader={false} showNav={false}>
      <div className="login-container">
        
        <div className="logo-area">
          <img className="main-logo" src="/images/로고.png" alt="로고" />
        </div>

        <div className="login-form">
          <div className="input-group">
            <input 
              type="text" 
              className="input-field" 
              placeholder="이메일을 입력해주세요." 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
            />
          </div>
          <div className="input-group input-with-icon">
            <input 
              type={showPassword ? "text" : "password"} 
              className="input-field" 
              placeholder="비밀번호를 입력해주세요." 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
            />
            <img 
              className="pw-eye-icon" 
              src={showPassword ? "/icons/뜬눈.png" : "/icons/감은눈.png"} 
              alt="비밀번호 보기 토글" 
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          {/* 에러 메세지 */}
          {errorMessage && (
            <div style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '6px', textAlign: 'left' }}>
              {errorMessage}
            </div>
          )}
          
          <button 
            className={`submit-btn ${isFormValid ? 'active' : ''}`}
            disabled={!isFormValid}
            onClick={handleLogin}
            style={{ marginTop: errorMessage ? '12px' : '20px' }}
          >
            로그인
          </button>
        </div>

        <div className="login-links">
          <span onClick={() => navigate('/signup')}>회원가입하기</span>
          <span className="divider"></span>
          <span onClick={() => navigate('/login/find-id')}>이메일/비밀번호 찾기</span>
        </div>

        <div className="sns-login-area">

          <div className="sns-title">SNS 간편로그인</div>
          <button className="sns-btn google-btn" onClick={handleGoogleLogin}>구글로 계속하기</button>
          <button className="sns-btn naver-btn" onClick={handleNaverLogin}>네이버로 계속하기</button>
          <button className="sns-btn kakao-btn" onClick={handleKakaoLogin}>카카오로 계속하기</button>
        </div>

      </div>
    </AppLayout>
  );
}