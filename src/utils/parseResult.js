// const parseResult = (resultStr) => {
//   const parts = resultStr.split(' ');
//   if (parts.length !== 2) return null;

//   const eventType = parts[0];
//   const [win, draw, loss] = parts[1].split('-').map(Number);
//   return { eventType, win, draw, loss };
// };

const parseSingleResult = (resultStr) => {
  const parts = resultStr.trim().split(' ');
  if (parts.length !== 2) return null;

  const eventType = parts[0];
  const scoreParts = parts[1].split('-');
  if (scoreParts.length !== 3) return null;

  const [win, draw, loss] = scoreParts.map(Number);
  if (isNaN(win) || isNaN(draw) || isNaN(loss)) return null;

  return { eventType, win, draw, loss };
};

const parseResult = (resultStr) => {
  if (!resultStr) return [];
  return resultStr.split(',').map(parseSingleResult).filter(Boolean); // , 로 분리하고, null 값은 제거
};

export default parseResult;
