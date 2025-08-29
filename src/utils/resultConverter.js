import { v4 as uuidv4 } from 'uuid';

// 종목 전체 이름 <=> 약어 변환 맵
const TYPE_MAP = {
  '남성 단식': '남단',
  '여성 단식': '여단',
  '남성 복식': '남복',
  '여성 복식': '여복',
  '혼합 복식': '혼복',
};

// 약어 => 전체 이름으로 변환하기 위한 역순 맵 (자동 생성)
const REVERSE_TYPE_MAP = Object.fromEntries(
  Object.entries(TYPE_MAP).map(([key, value]) => [value, key])
);

/**
 * results 배열을 DB 저장용 문자열로 변환합니다.
 * @param {Array<Object>} results - { type, win, draw, loss } 형태의 객체 배열
 * @returns {string} "남복 2-0-1, 남단 1-0-0" 형태의 문자열
 */
export const resultsToString = (results) => {
  if (!results || results.length === 0) {
    return '';
  }

  return results
    .map(r => {
      // 맵에 없는 종목일 경우 원래 이름을 그대로 사용
      const typeAbbreviation = TYPE_MAP[r.type] || r.type;
      return `${typeAbbreviation} ${r.win || 0}-${r.draw || 0}-${r.loss || 0}`;
    })
    .join(', ');
};

/**
 * DB에 저장된 문자열을 results 배열 형태로 변환합니다.
 * @param {string} resultString - "남복 2-0-1, 남단 1-0-0" 형태의 문자열
 * @returns {Array<Object>} UI 상태에 맞는 results 배열
 */
export const stringToResults = (resultString) => {
  // 입력 문자열이 없거나 비어있으면 기본값(빈 입력창 1개) 반환
  if (!resultString) {
    return [{ id: uuidv4(), type: '', win: '', draw: '', loss: '' }];
  }

  try {
    return resultString.split(', ').map(part => {
      const firstSpaceIndex = part.indexOf(' ');
      const typeAbbreviation = part.substring(0, firstSpaceIndex);
      const scores = part.substring(firstSpaceIndex + 1);
      
      const [win, draw, loss] = scores.split('-');

      return {
        id: uuidv4(),
        // 맵에 없는 약어일 경우 그대로 사용
        type: REVERSE_TYPE_MAP[typeAbbreviation] || typeAbbreviation,
        win,
        draw,
        loss,
      };
    });
  } catch (error) {
    console.error("결과 문자열 파싱 실패:", error);
    // 파싱에 실패할 경우에도 기본값을 반환하여 UI 오류 방지
    return [{ id: uuidv4(), type: '', win: '', draw: '', loss: '' }];
  }
};