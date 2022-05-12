export const getActionPrefix = (prefix: string): RegExp => {
  return new RegExp(`^${prefix}_`);
};

export const parseCbData = <T>(actionPrefix: string, cbData: string): T => {
  return JSON.parse(cbData.replace(`${actionPrefix}_`, ''));
};

export const createCbData = (
  actionPrefix: string,
  cbData: Record<string, unknown>,
): string => {
  return `${actionPrefix}_${JSON.stringify(cbData)}`;
};
