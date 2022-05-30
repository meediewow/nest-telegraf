import { useAsyncForEach } from '../helpers.util';

describe('Utils', () => {
  it('useAsyncForEach should work', async () => {
    const LENGTH = 5;
    const items = Array.from({ length: LENGTH }, () => ({}));
    const callback = jest.fn();

    await useAsyncForEach(callback, items);

    expect(callback).toHaveBeenCalledTimes(LENGTH);
  });

  it('useAsyncForEach should work with error', async () => {
    const LENGTH = 5;
    const items = Array.from({ length: LENGTH }, () => ({}));
    const callback = jest.fn().mockRejectedValue(new Error('Async error'));
    const onError = jest.fn();

    await useAsyncForEach(callback, items, onError);

    expect(callback).toHaveBeenCalledTimes(LENGTH);
    expect(onError).toHaveBeenCalledTimes(LENGTH);
  });
});
