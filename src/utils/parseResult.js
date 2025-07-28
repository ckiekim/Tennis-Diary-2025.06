// export default function parseResult(result) {
//   const [event, w, d, l] = result.split(/[\s-]+/);
//   return {
//     event,
//     win: parseInt(w, 10),
//     draw: parseInt(d, 10),
//     loss: parseInt(l, 10),
//   };
// }

const parseResult = (resultStr) => {
  const parts = resultStr.split(' ');
  if (parts.length !== 2) return null;

  const eventType = parts[0];
  const [win, draw, loss] = parts[1].split('-').map(Number);
  return { eventType, win, draw, loss };
};

export default parseResult;
