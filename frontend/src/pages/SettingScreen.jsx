import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/SettingScreen.css'; 

export default function SettingScreen() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  return (
    <AppLayout showHeader={true} title="화면" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>

        <div className="setting-content">
          <div className="setting-section">
            <div className="setting-group-title">테마 설정</div>
            <div className="setting-box">
              <div className="setting-item" onClick={() => setTheme('light')}>
                <div className="item-text">라이트 모드</div>
                {theme === 'light' && <div className="item-value text-blue">✓</div>}
              </div>
              <div className="setting-item" onClick={() => setTheme('dark')}>
                <div className="item-text">다크 모드</div>
                {theme === 'dark' && <div className="item-value text-blue">✓</div>}
              </div>
              <div className="setting-item" onClick={() => setTheme('system')}>
                <div className="item-text">기기 설정 따름</div>
                {theme === 'system' && <div className="item-value text-blue">✓</div>}
              </div>
            </div>
          </div>
        </div>

    </AppLayout>
  );
}