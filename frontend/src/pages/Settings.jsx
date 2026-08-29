import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/Settings.css';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <AppLayout showHeader={true} title="설정" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>
      <div className="settings-container">
        <div className="settings-list">
          
          {/* 그룹 1: 내 정보 */}
          <div className="setting-section">
            <div className="setting-group-title">내 정보</div>
            <div className="setting-box">
              <div className="setting-item" onClick={() => navigate('/mypage/edit')}>
                <div className="item-text">프로필 편집</div>
                <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
              </div>
              <div className="setting-item" onClick={() => navigate('/mypage/account')}>
                <div className="item-text">계정</div>
                <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
              </div>
            </div>
          </div>

          {/* 그룹 2: 앱 설정 */}
          <div className="setting-section">
            <div className="setting-group-title">앱 설정</div>
            <div className="setting-box">
              <div className="setting-item" onClick={() => navigate('/mypage/permission')}>
                <div className="item-text">앱 권한</div>
                <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
              </div>
              <div className="setting-item" onClick={() => navigate('/mypage/screen')}>
                <div className="item-text">화면</div>
                <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
              </div>
            </div>
          </div>

          {/* 그룹 3: 정보 및 정책 */}
          <div className="setting-section">
            <div className="setting-group-title">정보 및 정책</div>
            <div className="setting-box">
              <div className="setting-item" onClick={() => navigate('/mypage/terms')}>
                <div className="item-text">서비스 이용약관</div>
                <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
              </div>
              <div className="setting-item" onClick={() => navigate('/mypage/privacy')}>
                <div className="item-text">개인정보 처리방침</div>
                <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
              </div>
            </div>
          </div>

        </div>

        {/* 하단 버전 정보 및 로그아웃 */}
        <div className="settings-footer">
          <div className="version-info">
            <span>버전</span>
            <span>1.16</span>
          </div>
          <div className="logout-btn" onClick={() => navigate('/login')}>로그아웃</div>
        </div>

      </div>
    </AppLayout>
  );
}