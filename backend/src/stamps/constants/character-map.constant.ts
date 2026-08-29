// 설문조사 결과 코드(T-P-A 등) -> Supabase Storage 'stamps-image' 버킷 내 폴더명
export const CHARACTER_CODE_MAP: Record<string, string> = {
  'T-P-A': 'Chef',
  'T-P-C': 'Critic',
  'T-F-A': 'Reporter',
  'T-F-C': 'Barista',
  'N-P-C': 'Gardener',
  'N-F-A': 'Explorer',
  'N-F-C': 'Photographer',
  'E-P-A': 'Scientist',
  'E-P-C': 'Writer',
  'E-F-A': 'Detective',
  'E-F-C': 'Curator',
};