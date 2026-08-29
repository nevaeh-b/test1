import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/AppLayout'
import '../styles/common.css'
import '../styles/Splash.css';

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); 
    }, 2500); // 임시로 2.5초로 설정 (이후 수정할 것!)
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="splash-brand">
        <div className="logo-wrapper">
          <img className="splash-logo" src="/images/로고.png" alt="앱 로고" />
        </div>
      </div>

      <div className="splash-loader-wrapper">
        <div className="progress-track">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default Splash;