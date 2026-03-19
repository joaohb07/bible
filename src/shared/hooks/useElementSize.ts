import { useCallback, useEffect, useState } from "react";

type Size = { width: number; height: number };

/**
 * Measures an element using ResizeObserver.
 *
 * Uses a callback ref so it still works when the element is mounted later
 * (e.g., after a loading screen). This prevents "stuck calculating pages"
 * when the first render does not include the measured node.
 */
export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  // Callback ref lets us react immediately when the DOM node becomes available.
  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  useEffect(() => {
    if (!node) return;

    let raf = 0;
    let stopped = false;

    const commit = (w: number, h: number) => {
      const nw = Math.max(0, Math.floor(w));
      const nh = Math.max(0, Math.floor(h));
      setSize((prev) =>
        prev.width === nw && prev.height === nh ? prev : { width: nw, height: nh }
      );
    };

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      commit(cr.width, cr.height);
    });

    ro.observe(node);

    // Initial measure so pagination can start without waiting for the first RO callback.
    raf = requestAnimationFrame(() => {
      if (stopped) return;
      const r = node.getBoundingClientRect();
      commit(r.width, r.height);
    });

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [node]);

  return { ref, width: size.width, height: size.height };
}