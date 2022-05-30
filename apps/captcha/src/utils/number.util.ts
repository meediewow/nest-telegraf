export const getRandomInt = (min, max): number => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.round(Math.random() * (maxFloor - minCeil) + minCeil);
};

export const parseExpression = (
  first: number | string,
  second: number | string,
  operator: '+' | '-',
) => {
  // eslint-disable-next-line default-case
  switch (operator) {
    case '+': {
      return {
        result: Number(first) + Number(second),
        text: `${first} + ${second}`,
      };
    }
    case '-': {
      return {
        result: Number(first) - Number(second),
        text: `${first} - ${second}`,
      };
    }
  }
};
