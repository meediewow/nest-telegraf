export const getRandomInt = (min, max): number => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.round(Math.random() * (maxFloor - minCeil) + minCeil);
};

export const generateId = (): string => {
  const timestamp = (new Date().getTime() / 1000 || 0).toString(16);
  return (
    timestamp +
    'xxxxxxxxxxxxxxxx'
      .replace(/x/g, () => (Math.random() * 16 || 0).toString(16))
      .toLowerCase()
  );
};
