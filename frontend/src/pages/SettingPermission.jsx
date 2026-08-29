import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/SettingAccount.css'; 
import '../styles/Toggle.css';

export default function SettingPermission() {
  const navigate = useNavigate();
  
  const [locationAuth, setLocationAuth] = useState(true);
  const [cameraAuth, setCameraAuth] = useState(false);
  const [mediaAuth, setMediaAuth] = useState(false); 

  const [isNotiExpanded, setIsNotiExpanded] = useState(false);
  
  const [pushAuth, setPushAuth] = useState(true);
  const [marketingAuth, setMarketingAuth] = useState(false);

  return (
    <AppLayout showHeader={true} title="앱 권한" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>

        <div className="setting-content">
          <div className="setting-section">
            <div className="setting-group-title">접근 권한 설정</div>
            <div className="setting-box">
              
              {/* 1. 위치 정보 */}
              <div className="setting-item non-clickable">
                <div className="item-text">위치 정보</div>
                <div className={`toggle-switch ${locationAuth ? 'on' : ''}`} onClick={() => setLocationAuth(!locationAuth)}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
              
              {/* 2. 카메라 */}
              <div className="setting-item non-clickable">
                <div className="item-text">카메라</div>
                <div className={`toggle-switch ${cameraAuth ? 'on' : ''}`} onClick={() => setCameraAuth(!cameraAuth)}>
                  <div className="toggle-knob"></div>
                </div>
              </div>

              {/* 3. 사진과 동영상 */}
              <div className="setting-item non-clickable">
                <div className="item-text">사진과 동영상</div>
                <div className={`toggle-switch ${mediaAuth ? 'on' : ''}`} onClick={() => setMediaAuth(!mediaAuth)}>
                  <div className="toggle-knob"></div>
                </div>
              </div>

              {/* 4. 알림 (클릭 시 하위 메뉴 펼침) */}
              <div 
                className="setting-item" 
                onClick={() => setIsNotiExpanded(!isNotiExpanded)}
                style={{ borderBottom: isNotiExpanded ? 'none' : '' }}
              >
                <div className="item-text">알림</div>
                {/* 열림/닫힘 상태에 따라 화살표 회전 */}
                <div 
                  className="arrow-icon" 
                  style={{ 
                    transform: isNotiExpanded ? 'rotate(90deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.2s ease',
                    display: 'inline-block'
                  }}
                >
                  ›
                </div>
              </div>

              {/* 4-1. 알림 하위 메뉴 (기존 '마이페이지-알림' 내용)[cite: 24] */}
              {isNotiExpanded && (
                <div style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #f0f0f0' }}>
                  <div className="setting-item non-clickable" style={{ paddingLeft: '24px', borderBottom: '1px solid #f0f0f0' }}>
                    <div className="item-text" style={{ fontSize: '13px', color: '#555' }}>서비스 알림 (코스 정보, 배지 획득 등)</div>
                    <div className={`toggle-switch ${pushAuth ? 'on' : ''}`} onClick={() => setPushAuth(!pushAuth)}>
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                  <div className="setting-item non-clickable" style={{ paddingLeft: '24px' }}>
                    <div className="item-text" style={{ fontSize: '13px', color: '#555' }}>마케팅 정보 수신 동의</div>
                    <div className={`toggle-switch ${marketingAuth ? 'on' : ''}`} onClick={() => setMarketingAuth(!marketingAuth)}>
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                </div>
              )}

            </div>
            <p className="setting-desc">※ 시스템 설정 애플리케이션 가이드라인에 따라 기기 설정에서도 권한을 변경할 수 있습니다.</p>
          </div>
        </div>
    </AppLayout>
  );
}