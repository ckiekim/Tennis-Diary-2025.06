export const createPlaceInfo = (formData) => {
  const { place, placeSelection } = formData;
  
  // Autocomplete에서 코트 객체를 선택한 경우
  if (placeSelection?.court) {
    const { court, type } = placeSelection;
    const detail = court.details?.find(d => d.type === type) || {};
    return {
      courtId: court.id,
      courtName: court.name,
      courtType: type,
      fullAddress: court.location || '',
      courtPhotoUrl: detail.photo || ''
    };
  }
  
  // 사용자가 코트 이름을 직접 입력한 경우 (하위 호환성)
  if (place) {
    return {
      courtId: '',
      courtName: place,
      courtType: '',
      fullAddress: '',
      courtPhotoUrl: ''
    };
  }

  return null; // 장소 정보가 없는 경우
};