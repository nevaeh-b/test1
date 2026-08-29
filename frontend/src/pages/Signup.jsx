import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/Signup.css';

export default function SignupForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const savedForm = location.state?.formData || {};
  const isVerified = location.state?.verified || false;

  const [, setActiveTerm] = useState(null); 
  const [email, setEmail] = useState(savedForm.email || '');
  const [password, setPassword] = useState(savedForm.password || '');
  const [passwordConfirm, setPasswordConfirm] = useState(savedForm.passwordConfirm || '');
  const [name, setName] = useState(savedForm.name || '');
  const [phone, setPhone] = useState(savedForm.phone || '');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 백엔드 통신 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');

  const [terms, setTerms] = useState(savedForm.terms || {
    use: false, privacy: false, location: false, age: false, marketing: false
  });

  const isPasswordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;
  const isRequiredTermsAgreed = terms.use && terms.privacy && terms.location && terms.age;
  
  // 모든 필수 입력 조건 + 본인인증 완료 여부 체크
  const isFormValid = 
    email.trim() !== '' &&
    password.trim() !== '' &&
    passwordConfirm.trim() !== '' &&
    !isPasswordMismatch &&
    name.trim() !== '' &&
    isVerified &&
    isRequiredTermsAgreed;

  const isAllChecked = Object.values(terms).every(Boolean);

  const handleAllAgree = (e) => {
    const checked = e.target.checked;
    setTerms({ use: checked, privacy: checked, location: checked, age: checked, marketing: checked });
  };

  const handleTermChange = (key) => {
    setTerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDetailClick = (e, termKey) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveTerm(termKey);
  };

  const handleGoToVerify = () => {
    const currentFormData = { email, password, passwordConfirm, name, phone, terms };
    navigate('/signup/idverify', { state: { formData: currentFormData, name, verified: isVerified } });
  };

  // 백엔드 연결 (회원가입)
  const handleSignup = async () => {
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3000/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          nickname: name,
          // phone: phone, // phone 속성 일단 예외 처리
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      } else if (data.token) {
        localStorage.setItem('accessToken', data.token);
      }
        navigate('/signup/profile-img', { state: { email, name } });
      } else {
        const msg = Array.isArray(data.message) ? data.message[0] : data.message;
        setErrorMessage(msg || '회원가입 요청에 실패했습니다.');
      }
    } catch (error) {
      setErrorMessage('서버와 연결할 수 없습니다. 백엔드 실행 상태를 확인해주세요.');
    }
  };

  return (
    <AppLayout 
      showHeader={true} 
      title="회원가입" 
      showBack={true} 
      showActions={false} 
      showNav={false}
      onBack={() => navigate('/login')}
    >
      <div className="signup-container">
        <div className="form-content">
          {/* 이메일 */}
          <div className="input-group">
            <label className="input-label">이메일 <span className="required">*</span></label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="예) abc@gmail.com" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage('');
              }}
            />
            {errorMessage && (
              <span className="error-msg">{errorMessage}</span>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <label className="input-label">비밀번호 <span className="required">*</span></label>
            <div className="input-with-icon">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="영문, 숫자 조합 8~16자" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <img 
                className="pw-eye-icon" 
                src={showPassword ? "/icons/뜬눈.png" : "/icons/감은눈.png"} 
                alt="보기" 
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="input-group">
            <label className="input-label">비밀번호 확인 <span className="required">*</span></label>
            <div className="input-with-icon">
              <input 
                type={showPasswordConfirm ? "text" : "password"} 
                className="input-field" 
                placeholder="비밀번호를 한 번 더 입력해주세요" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
              <img 
                className="pw-eye-icon" 
                src={showPasswordConfirm ? "/icons/뜬눈.png" : "/icons/감은눈.png"} 
                alt="확인 보기" 
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              />
            </div>
            {isPasswordMismatch && (
              <span className="error-msg">비밀번호가 일치하지 않습니다.</span>
            )}
          </div>

          {/* 이름 */}
          <div className="input-group">
            <label className="input-label">이름 <span className="required">*</span></label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="예) 홍길동" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 휴대폰 인증 */}
          <div className="input-group">
            <label className="input-label">휴대폰번호 본인인증 <span className="required">*</span></label>
            <button 
              className={`auth-btn full-btn ${isVerified ? 'verified' : ''}`} 
              onClick={handleGoToVerify}
            >
              {isVerified ? '인증 완료 ✓' : '인증하기'}
            </button>
          </div>

          {/* 약관 동의 */}
          <div className="terms-group">
            <label className="term-item all-agree">
              <input 
                type="checkbox" 
                checked={isAllChecked}
                onChange={handleAllAgree}
              />
              <span>아래 약관에 모두 동의합니다.</span>
            </label>
            <div className="term-list">
              <label className="term-item">
                <input type="checkbox" checked={terms.use} onChange={() => handleTermChange('use')} />
                <span>이용약관 동의(필수)</span>
                <span className="term-detail" onClick={(e) => handleDetailClick(e, '이용약관')}>자세히 보기</span>
              </label>
              <label className="term-item">
                <input type="checkbox" checked={terms.privacy} onChange={() => handleTermChange('privacy')} />
                <span>개인정보 처리방침 동의(필수)</span>
                <span className="term-detail" onClick={(e) => handleDetailClick(e, '개인정보')}>자세히 보기</span>
              </label>
              <label className="term-item">
                <input type="checkbox" checked={terms.location} onChange={() => handleTermChange('location')} />
                <span>위치정보 이용 약관 동의(필수)</span>
                <span className="term-detail" onClick={(e) => handleDetailClick(e, '위치정보')}>자세히 보기</span>
              </label>
              <label className="term-item">
                <input type="checkbox" checked={terms.age} onChange={() => handleTermChange('age')} />
                <span>만 14세 이상임에 동의(필수)</span>
                <span className="term-detail" onClick={(e) => handleDetailClick(e, '14')}>자세히 보기</span>
              </label>
              <label className="term-item">
                <input type="checkbox" checked={terms.marketing} onChange={() => handleTermChange('marketing')} />
                <span>마케팅 정보 수신 동의(선택)</span>
                <span className="term-detail" onClick={(e) => handleDetailClick(e, '마케팅')}>자세히 보기</span>
              </label>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="bottom-btn-area">
          <button 
            className={`submit-btn ${isFormValid ? 'active' : ''}`} 
            disabled={!isFormValid}
            onClick={handleSignup}
          >
            다음
          </button>
        </div>
      </div>
    </AppLayout>
  );
}