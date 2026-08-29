import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/LoginFindPw.css';

export default function LoginFindPw() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [timeLeft, setTimeLeft] = useState(180);
  const authInputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isCodeSent && !isVerified && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isCodeSent && !isVerified) {
      alert('인증 시간이 만료되었습니다. 인증번호 전송을 다시 눌러주세요.');
    }
    return () => clearInterval(timer);
  }, [isCodeSent, isVerified, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setPhone(value);
  };

  const handleAuthCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setAuthCode(value);
  };

  const handleRequestCode = () => {
    if (userId.trim() === '') {
      alert('이메일을 먼저 입력해주세요.');
      return;
    }
    if (phone.length < 10) {
      alert('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    
    setIsCodeSent(true);
    setAuthCode('');
    setIsVerified(false);
    setTimeLeft(180); // 3분 리셋

    setTimeout(() => {
      if (authInputRef.current) {
        authInputRef.current.focus();
      }
    }, 10);
  };

  const handleVerify = () => {
    if (timeLeft === 0) {
      alert('인증 시간이 만료되었습니다.');
      return;
    }

    if (authCode === '123456') {
      alert('본인인증이 완료되었습니다.');
      setIsVerified(true);
    } else {
      alert('인증번호가 일치하지 않습니다. (테스트용: 123456)');
      setAuthCode('');
    }
  };

  return (
    <AppLayout 
      showHeader={true} 
      title="이메일/비밀번호 찾기" 
      showBack={true} 
      showActions={false} 
      showNav={false}
      onBack={() => navigate('/login')}
    >
      <div className="find-pw-container">
        <div className="form-content">
          <div className="tab-group">
            <div className="tab" onClick={() => navigate('/login/find-id')}>이메일 찾기</div>
            <div className="tab active">비밀번호 찾기</div>
          </div>

          <div className="single-input-group">
            <input 
              type="text" 
              className="input-field" 
              placeholder="이메일 입력" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isVerified}
            />
          </div>

          <div className="input-group-row">
            <input 
              type="tel" 
              className="input-field" 
              placeholder="휴대폰번호 입력('-' 제외)" 
              value={phone}
              onChange={handlePhoneChange}
              disabled={isVerified}
            />
            <button 
              className={`auth-req-btn ${isCodeSent ? 'sent' : ''}`} 
              onClick={handleRequestCode}
              disabled={isVerified}
            >
              {isCodeSent ? '재전송' : '인증번호 전송'}
            </button>
          </div>

          {isCodeSent && (
            <div className="input-group-row">
              <div className="input-with-timer">
                <input 
                  ref={authInputRef}
                  type="tel" 
                  className="input-field" 
                  placeholder="인증번호 6자리 (테스트: 123456)" 
                  value={authCode}
                  onChange={handleAuthCodeChange}
                  disabled={isVerified || timeLeft === 0}
                />
                {!isVerified && <span className="timer-text">{formatTime(timeLeft)}</span>}
              </div>
              <button 
                className="auth-btn" 
                onClick={handleVerify}
                disabled={isVerified || authCode.length !== 6 || timeLeft === 0}
              >
                {isVerified ? '완료' : '확인'}
              </button>
            </div>
          )}

          <button 
            className={`submit-btn ${isVerified ? 'active' : ''}`} 
            onClick={()=>navigate('/login/reset-pw')}
            disabled={!isVerified}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    </AppLayout>
  );
}