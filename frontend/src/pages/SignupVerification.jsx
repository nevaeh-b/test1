import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/SignupVerification.css';

export default function SignupVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  const formData = location.state?.formData || {};
  const initialName = location.state?.name || formData.name || '';

  const [name, setName] = useState(initialName);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [phone, setPhone] = useState(formData.phone || '');
  const [authCode, setAuthCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // 에러 메시지 상태 관리
  const [phoneError, setPhoneError] = useState('');
  const [authError, setAuthError] = useState('');

  // 카운트다운
  const [timeLeft, setTimeLeft] = useState(180);
  const authInputRef = useRef(null);

  // 타이머 실행
  useEffect(() => {
    let timer;
    if (isCodeSent && !isVerified && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isCodeSent && !isVerified) {
      setAuthError('인증 시간이 만료되었습니다. 재전송 후 다시 시도해 주세요.');
    }
    return () => clearInterval(timer);
  }, [isCodeSent, isVerified, timeLeft]);

  // 분 타이머 포맷 변환
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setPhone(value);
    setPhoneError('');
  };

  const handleAuthCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setAuthCode(value);
    setAuthError('');
  };

  const handleRequestCode = () => {
    if (phone.length < 10) {
      setPhoneError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }
    
    setPhoneError('');
    setAuthError('');
    setIsCodeSent(true);
    setAuthCode('');
    setIsVerified(false);
    setTimeLeft(180);

    setTimeout(() => {
      if (authInputRef.current) {
        authInputRef.current.focus();
      }
    }, 10);
  };

  const handleVerifyComplete = () => {
    if (timeLeft === 0) {
      setAuthError('인증 시간이 만료되었습니다. 재전송 후 다시 시도해 주세요.');
      return;
    }

    if (authCode === '123456') {
      setIsVerified(true);
      setAuthError('');
      
      navigate('/signup', { 
        state: { 
          formData: { 
            ...formData, 
            name, 
            phone 
          }, 
          verified: true 
        } 
      });
    } else {
      setAuthError('인증번호가 일치하지 않습니다. (테스트용: 123456)');
      setAuthCode('');
    }
  };

  return (
    <AppLayout 
      showHeader={true} 
      title="휴대폰 본인인증" 
      showBack={true} 
      showActions={false} 
      showNav={false}
      onBack={() => navigate('/signup', { state: { formData, verified: location.state?.verified || false } })}
    >
      <div className="verify-container">
        <div className="form-content">
          <div className="input-group">
            <label className="input-label">이름</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="실명 입력" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isVerified}
            />
          </div>

          <div className="input-group">
            <label className="input-label">휴대폰 번호</label>
            <div className="telecom-select-wrapper">
              <select className="input-field select-field" disabled={isVerified}>
                <option value="SKT">SKT</option>
                <option value="KT">KT</option>
                <option value="LGU+">LG U+</option>
                <option value="MVNO">알뜰폰</option>
              </select>
            </div>

            <div className="input-with-btn">
              <input 
                type="tel" 
                className="input-field" 
                placeholder="'-' 없이 숫자만 입력" 
                value={phone}
                onChange={handlePhoneChange}
                disabled={isVerified}
              />
              <button 
                className={`auth-req-btn ${isCodeSent ? 'sent' : ''}`} 
                onClick={handleRequestCode}
                disabled={isVerified}
              >
                {isCodeSent ? '재전송' : '인증요청'}
              </button>
            </div>
            {phoneError && <span className="error-msg">{phoneError}</span>}
          </div>

          {isCodeSent && (
            <div className="input-group">
              <label className="input-label">인증번호 (테스트: 123456)</label>
              <div className="input-with-timer">
                <input 
                  ref={authInputRef}
                  type="tel" 
                  className="input-field" 
                  placeholder="인증번호 6자리 입력" 
                  value={authCode}
                  onChange={handleAuthCodeChange}
                  disabled={isVerified || timeLeft === 0}
                />
                {!isVerified && (
                  <span className={`timer-text ${timeLeft === 0 ? 'expired' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
              {authError && <span className="error-msg">{authError}</span>}
            </div>
          )}
        </div>

        <div className="bottom-btn-area">
          <button 
            className={`submit-btn ${authCode.length === 6 && timeLeft > 0 ? 'active' : ''}`} 
            disabled={authCode.length !== 6 || isVerified || timeLeft === 0}
            onClick={handleVerifyComplete}
          >
            {isVerified ? '인증 완료 ✓' : '인증 완료'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}