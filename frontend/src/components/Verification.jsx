// 장소 인증 로직 (함수 분리)
export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function verifyPlaceLocation({ place, currentCoords, coursePlaceId = null }) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!currentCoords) {
    throw new Error('현재 위치 정보를 가져오지 못했습니다. GPS를 확인해 주세요.');
  }

  const placeLat = place.lat || place.mapy || 36.3276;
  const placeLng = place.lng || place.mapx || 127.4273;

  // 200m 이내 반경 검증
  const distance = getDistanceInMeters(currentCoords.lat, currentCoords.lng, placeLat, placeLng);
  const isVerifiedByGps = distance <= 200;

  const res = await fetch('http://localhost:3000/place-visit/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      placeId: Number(place.id),
      verified: isVerifiedByGps,
      ...(coursePlaceId && { coursePlaceId: Number(coursePlaceId) })
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || '위치 인증 처리에 실패했습니다.');
  }

  return data;
}