import { noop } from 'lodash';

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const useAsyncForEach = async <T>(
  cb: (item: T) => Promise<void>,
  items: T[],
  onError = noop,
): Promise<void> => {
  return new Promise(async (resolve) => {
    for (const item of items) {
      try {
        await cb(item);
      } catch (error: unknown) {
        onError(error);
      }
    }
    resolve();
  });
};
