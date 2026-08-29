import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import '../styles/common.css';
import '../styles/PointConversion.css';

export default function PointConversion() {

  const [balance, setBalance] = useState(0);
  const [convertAmount, setConvertAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', isError: false });

  // 포인트 보유 조회
  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const res = await fetch('http://localhost:3000/rewards/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance ?? 0);
      }
    } catch (error) {
      console.error('포인트 잔액 조회 중 오류:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // 포인트 전환
  const handleConvert = async () => {
    setStatusMessage({ text: '', isError: false });
    const amountNum = Number(convertAmount);

    if (!amountNum || amountNum <= 0) {
      setStatusMessage({ text: '전환 금액은 0보다 커야 합니다.', isError: true });
      return;
    }

    if (amountNum > balance) {
      setStatusMessage({ text: '리워드 잔액이 부족합니다.', isError: true });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:3000/rewards/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amountNum })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '전환 중 오류가 발생했습니다.');
      }

      setBalance(data.balance);
      setConvertAmount('');
      setStatusMessage({
        text: `${data.converted.toLocaleString()} 포인트가 성공적으로 전환되었습니다!`,
        isError: false
      });
    } catch (error) {
      setStatusMessage({
        text: error.message || '전환 처리 실패했습니다.',
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout showActions={false} showNav={false} showBack={true} title="지역화폐 전환">
      <div className="point-container">
        <div className="point-content">
          {/* 보유 포인트 박스 */}
          <div className="my-point-box">
            <span className="box-title">보유 포인트</span>
            <div className="point-value">
              <img className="point-icon" src="/icons/포인트.png" alt="P" />
              <span>{balance.toLocaleString()}</span>
            </div>
          </div>

          <div className="input-section">
            <p className="input-title">전환하실 포인트를 입력해 주세요</p>
            <div className="input-wrapper">
              <input 
                type="number" 
                className="point-input" 
                placeholder="최소 1,000 포인트 이상" 
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
              />
              <button className="all-btn" onClick={handleConvert} disabled={loading}>
                {loading ? '처리중' : '전환'}
              </button>
            </div>
            {statusMessage.text && (
              <p style={{
                marginTop: '8px',
                fontSize: '13px',
                color: statusMessage.isError ? '#e53935' : '#2e7d32'
              }}>
                {statusMessage.text}
              </p>
            )}
          </div>

          <div className="divider-bar"></div>

          <div className="store-section">
            <div className="store-header">
              <span className="store-title">사용가능한 가맹처</span>
              <img src="/icons/앞으로.png" alt="더보기" className="arrow-icon" />
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}