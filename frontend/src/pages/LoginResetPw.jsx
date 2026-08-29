import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/LoginResetPw.css';

export default function LoginResetPw() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 유효성 검사: 둘 다 입력되었고 서로 일치하는지 확인
  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const isFormValid = password.trim().length >= 8 && password === passwordConfirm;

  const handleResetComplete = () => {
    if (!isFormValid) return;
    alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
    navigate('/login');
  };

  return (
    <AppLayout 
      showHeader={true} 
      title="비밀번호 재설정" 
      showBack={true} 
      showActions={false} 
      showNav={false}
      onBack={() => navigate(-1)}
    >
      <div className="reset-pw-container">
        <div className="form-content">

          {/* 새 비밀번호 입력 */}
          <div className="input-group">
            <label className="input-label">새 비밀번호</label>
            <div className="input-with-icon">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-field" 
                placeholder="영문, 숫자 조합 8~16자" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <img 
                className="pw-eye-icon" 
                src={showPassword ? '/icons/뜬눈.png' : '/icons/감은눈.png'} 
                alt="비밀번호 보기" 
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="input-group">
            <label className="input-label">새 비밀번호 확인</label>
            <div className="input-with-icon">
              <input 
                type={showPasswordConfirm ? 'text' : 'password'} 
                className="input-field" 
                placeholder="비밀번호를 한 번 더 입력해주세요" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
              <img 
                className="pw-eye-icon" 
                src={showPasswordConfirm ? '/icons/뜬눈.png' : '/icons/감은눈.png'} 
                alt="비밀번호 확인 보기" 
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              />
            </div>
            {isPasswordMismatch && (
              <span className="error-msg">비밀번호가 일치하지 않습니다.</span>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="bottom-btn-area">
          <button 
            className={`submit-btn ${isFormValid ? 'active' : ''}`} 
            disabled={!isFormValid}
            onClick={handleResetComplete}
          >
            변경 완료
          </button>
        </div>
      </div>
    </AppLayout>
  );
}