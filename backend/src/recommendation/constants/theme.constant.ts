// 테마별 tag.id 매핑
export const THEME_TAG_IDS: Record<string, number[]> = {
  HISTORY_CULTURE: [22, 23, 24, 25, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
  NATURE: [30, 31, 32, 33, 34],
  FOOD: [17, 18, 19, 20, 21],
  SCIENCE_EXPERIENCE: [10, 11, 12, 13, 14, 15, 16],
};

// 야간 테마 식별 코드
export const NIGHT_THEME_CODE = 'NIGHT';

// 무장애 유형별 테이블 컬럼 매핑
export const BARRIER_FREE_TYPE_COLUMN: Record<string, string> = {
  INFANT: 'infant',
  BLIND: 'blind',
  DEAF: 'deaf',
  WHEELCHAIR: 'pt_pwd',
};

// 무장애 유형별 상세 정보 컬럼 매핑
export const BARRIER_FREE_DETAIL_COLUMNS: Record<string, string[]> = {
  WHEELCHAIR: ['route', 'wheelchair', 'exit', 'elevator', 'restroom', 'handicapetc'],
  BLIND: ['guidesystem', 'blindhandicapetc', 'signguide', 'braileblock', 'guidehuman', 'audioguide', 'bigprint', 'brailepromotion'],
  DEAF: ['hearingroom', 'hearinghandicapetc', 'videoguide', 'guidehuman'],
  INFANT: ['stroller', 'lactationroom', 'babysparechair', 'infantsfamilyetc'],
};

// 무장애 공통 시설 컬럼
export const COMMON_BARRIER_FREE_COLUMNS = [
  'parking',
  'publictransport',
  'ticketoffice',
  'promotion',
];

export const THEME_LABELS: Record<string, string> = {
  HISTORY_CULTURE: '역사/문화유산',
  NATURE: '자연',
  FOOD: '맛집',
  SCIENCE_EXPERIENCE: '과학/체험',
  NIGHT: '야간',
};