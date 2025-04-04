import { useCallback, useMemo } from 'react';

export function useCurrency(isoCode: string) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: isoCode,
      }),
    [isoCode],
  );

  return useCallback(
    (units: number) => formatter.format(units / 1000),
    [formatter],
  );
}
