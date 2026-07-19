/**
 * 예약 불가 기간 관련 순수 날짜 로직.
 * 날짜는 전부 "YYYY-MM-DD" 문자열 — ISO 형식이라 문자열 비교가 곧 날짜 비교다.
 * 기간은 '[start, end)' 반개구간: end_date(체크아웃일)에는 새 체크인이 가능하다.
 */

export interface BlockedRange {
  start_date: string;
  end_date: string;
}

/** 요청 기간 [checkIn, checkOut)이 불가 기간과 하루라도 겹치는지 */
export function overlapsBlockedRange(
  checkIn: string,
  checkOut: string,
  ranges: BlockedRange[]
): boolean {
  return ranges.some(
    (range) => checkIn < range.end_date && range.start_date < checkOut
  );
}
