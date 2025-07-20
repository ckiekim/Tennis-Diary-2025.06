const formatDay = (dateStr) => {
  const date = new Date(dateStr);
  const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return day;
};

export default formatDay;
