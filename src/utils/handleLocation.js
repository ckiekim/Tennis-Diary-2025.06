/**
 * 전체 주소 문자열을 '광역시/도'와 '시/군/구'로 분리합니다.
 * @param {string} locationString - 예: "경기도 용인시 수지구"
 * @returns {{province: string, city: string}} - 예: { province: '경기도', city: '용인시 수지구' }
 */
export const parseLocation = (locationString) => {
  if (!locationString) {
    return { province: '', city: '' };
  }

  const firstSpaceIndex = locationString.indexOf(' ');

  // 공백이 없는 경우 (예: '세종특별자치시'), province와 city를 동일하게 설정
  if (firstSpaceIndex === -1) {
    return { province: locationString, city: locationString };
  }

  // 첫 번째 공백을 기준으로 province와 city를 분리
  const province = locationString.substring(0, firstSpaceIndex);
  const city = locationString.substring(firstSpaceIndex + 1);

  return { province, city };
};

/**
 * '광역시/도'와 '시/군/구'를 전체 주소 문자열로 합칩니다.
 * @param {string} province - 예: "경기도"
 * @param {string} city - 예: "용인시 수지구"
 * @returns {string} - 예: "경기도 용인시 수지구"
 */
export const joinLocation = (province, city) => {
  if (!province || !city) {
    return '';
  }
  
  // '세종특별자치시' 처럼 두 값이 같은 경우, 하나만 반환
  if (province === city) {
    return province;
  }
  
  return `${province} ${city}`;
};