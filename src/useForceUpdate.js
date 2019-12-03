import { useCallback, useState } from "react";

export default () => {
  const [, dispatch] = useState(Object.create(null));

  const memoizedDispatch = useCallback(() => {
    dispatch(Object.create(null));
  }, [dispatch]);

  return memoizedDispatch;
};
