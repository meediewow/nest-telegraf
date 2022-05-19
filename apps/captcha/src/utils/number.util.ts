export const getRandomInt = (min, max): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.round(Math.random() * (max - min) + min);
};

export const parseExpression = (
  first: number | string,
  second: number | string,
  operator: '+' | '-',
) => {
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
