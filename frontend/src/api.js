import { supabase } from './supabaseClient'

// 코스 장소 목록 가져오기 (course_place)
export async function getCoursePlaces(courseId) {
  const { data, error } = await supabase
    .from('course_place')
    .select('*')
    .eq('course_id', courseId)
    .order('order_no', { ascending: true }) // 순서대로 가져오기

  if (error) console.error('코스 장소 조회 실패:', error)
  return data
}

// 코스 진행 상태 시작/업데이트 (course_run)
export async function startCourseRun(userId, courseId) {
  const { data, error } = await supabase
    .from('course_run')
    .insert([
      { user_id: userId, course_id: courseId, status: 'RUNNING', started_at: new Date() }
    ])
    .select()

  if (error) console.error('코스 시작 실패:', error)
  return data
}

// 배리어프리 편의시설 정보 가져오기 (barrier_free_type)
export async function getBarrierFreeInfo(placeCode) {
  const { data, error } = await supabase
    .from('barrier_free_type')
    .select('*')
    .eq('place_code', placeCode)

  if (error) console.error('배리어프리 정보 조회 실패:', error)
  return data
}

// 유저 스탬프 획득 처리 (user_stamps)
export async function addStamp(userId, challengeId) {
  const { data, error } = await supabase
    .from('user_stamps')
    .insert([
      { user_id: userId, challenge_id: challengeId, achieved_at: new Date() }
    ])

  if (error) console.error('스탬프 저장 실패:', error)
  return data
}

// 요런 식으로 필요한 함수 체크 후 추가할 예정