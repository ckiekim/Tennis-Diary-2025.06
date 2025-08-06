// ✨ 숫자만 입력받아 숫자를 반환하는 핸들러
export const handleNumericInputChange = (value) => {
	return value.replace(/[^0-9]/g, '');
};

// 시간 입력시 숫자와 콜론(:), 물결(~) 만 입력받는 핸들러
export const handleTimeInputChange = (value) => {
  return value.replace(/[^0-9:~]/g, '');
};
