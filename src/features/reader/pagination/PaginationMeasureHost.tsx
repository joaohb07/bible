import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { VerseData } from "./types";

export type VerseMeasurerRef = {
  measure: (slice: VerseData[]) => Promise<number>;
};

type Props = {
  widthPx: number; // largura útil da página (conteúdo)
};

const PaginationMeasureHost = forwardRef<VerseMeasurerRef, Props>(
  function PaginationMeasureHost({ widthPx }, ref) {
    const boxRef = useRef<HTMLDivElement | null>(null);

    const [pending, setPending] = useState<{
      slice: VerseData[];
      resolve: (h: number) => void;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      measure: (slice) =>
        new Promise<number>((resolve) => {
          setPending({ slice, resolve });
        }),
    }));

    useLayoutEffect(() => {
      if (!pending) return;

      // espera 2 frames pra garantir layout final (font + CSS)
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          const el = boxRef.current;
          const h = el ? el.scrollHeight : 0;
          pending.resolve(h);
          setPending(null);
        });
        return () => cancelAnimationFrame(raf2);
      });

      return () => cancelAnimationFrame(raf1);
    }, [pending]);

    return (
      <div
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          width: widthPx,
          pointerEvents: "none",
          opacity: 0,
          zIndex: -1,
        }}
        aria-hidden="true"
      >
        {/* IMPORTANT: usa chapter-body pra herdar tipografia do teu CSS */}
        <div ref={boxRef} className="chapter-body" style={{ overflow: "visible" }}>
          {pending?.slice.map((v) => (
            <div key={v.verse} className="verse-line">
              <span className="verse-num">{v.verse}</span>
              <span className="verse-text">{v.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default PaginationMeasureHost;
