import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import '../styles/SettingAccount.css'; 
import '../styles/SettingPrivacy.css'; 

export default function SettingPrivacy() {
  const navigate = useNavigate();

  return (
    <AppLayout showHeader={true} title="개인정보 처리방침" showNav={false} showActions={false} showBack={true} onBack={() => navigate(-1)}>
        <div className="setting-content">
          <div className="policy-box">
            <h4>제 1조 (목적)</h4>
            <p>본 방침은 '어디가유'가 제공하는 서비스와 관련하여 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 제정되었습니다.</p>
            
            <h4>제 2조 (수집하는 개인정보 항목)</h4>
            <p>회사는 회원가입, 상담, 서비스 신청 등을 위해 아래와 같은 개인정보를 수집하고 있습니다.<br/>- 필수항목: 이름, 이메일, 비밀번호</p>

            <h4>제 3조 (개인정보의 보유 및 이용기간)</h4>
            <p>원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정한 기간 동안 회원정보를 보관합니다.</p>
          </div>
        </div>
    </AppLayout>
  );
}