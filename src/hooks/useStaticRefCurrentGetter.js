import {
  useCallback,
} from 'react';

export default function useStaticRefCurrentGetter(ref, initialize) {
  console.log(ref, initialize)
  return useCallback(
    () => getCurrent(ref, initialize),
    [],
  );
}

function getCurrent(ref, initialize) {
  if (!ref.current) {
    ref.current = initialize();
  }

  return ref.current;
}