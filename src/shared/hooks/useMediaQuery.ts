import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);

    const apply = () => setMatches(mq.matches);
    apply();

    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }

    // legacy
    // @ts-ignore
    mq.addListener(apply);
    // @ts-ignore
    return () => mq.removeListener(apply);
  }, [query]);

  return matches;
}