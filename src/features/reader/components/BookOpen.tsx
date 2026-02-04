import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { getBookById } from "../../../shared/bible/books";
import LanguagePicker from "../../settings/components/LanguagePicker";
import BottomSheet from "../../../shared/ui/BottomSheet";
import { useChapter } from "../hooks/useChapter";
import { useAnchoredPagination } from "../pagination/useAnchoredPagination";
import Verse from "./Verse";
import VerseSliceView from "./VerseSliceView";

function lsGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  onOpenNav: () => void;
}) {
  const res = useChapter(props);
  const [langOpen, setLangOpen] = useState(false);

  // URL: ?p=
  const [sp, setSp] = useSearchParams();

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 880px)");
    const apply = () => setIsMobile(mq.matches);
    apply();

    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }

    // compat
    // @ts-ignore
    mq.addListener(apply);
    // @ts-ignore
    return () => mq.removeListener(apply);
  }, []);

  const title = useMemo(() => {
    const b = getBookById(props.book);
    const name = b?.names[props.translation] ?? props.book;
    return `${name} ${props.chapter}`;
  }, [props.translation, props.book, props.chapter]);

  // medir viewport real da página
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // ✅ FIX: não pode ser deps [] porque no primeiro render ainda não existe bodyRef (loading)
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    let raf = 0;
    let stopped = false;

    const commit = (w: number, h: number) => {
      const nw = Math.max(0, Math.floor(w));
      const nh = Math.max(0, Math.floor(h));
      setDims((prev) => (prev.w === nw && prev.h === nh ? prev : { w: nw, h: nh }));
    };

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      commit(cr.width, cr.height);
    });

    ro.observe(el);

    raf = requestAnimationFrame(() => {
      if (stopped) return;
      const r = el.getBoundingClientRect();
      commit(r.width, r.height);
    });

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [res.data, isMobile]);

  const chapterKey = `${props.translation}:${props.book}:${props.chapter}`;

  const layoutKey = useMemo(() => {
    const fontScale = 1;
    const lineHeight = 1.4;
    return `${isMobile ? 1 : 0}|${dims.w}|${fontScale}|${lineHeight}`;
  }, [isMobile, dims.w]);

  const lastPageKey = useMemo(
    () => `bible:lastPage:${chapterKey}:${layoutKey}`,
    [chapterKey, layoutKey]
  );

  // estado da página (controlado por URL + fallback localStorage)
  const [pageIndex, setPageIndex] = useState(0);

  // URL ?p= tem prioridade, senão lastPage salvo, senão 0
  useEffect(() => {
    const pRaw = sp.get("p");
    const pUrl = pRaw != null ? Number(pRaw) : NaN;

    if (Number.isFinite(pUrl) && pUrl >= 0) {
      setPageIndex(Math.floor(pUrl));
      return;
    }

    const saved = lsGet(lastPageKey);
    const pSaved = saved != null ? Number(saved) : NaN;

    if (Number.isFinite(pSaved) && pSaved >= 0) {
      setPageIndex(Math.floor(pSaved));
    } else {
      setPageIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterKey, layoutKey]);

  // sempre que pageIndex muda, escreve ?p= e localStorage
  useEffect(() => {
    lsSet(lastPageKey, String(pageIndex));

    const next = new URLSearchParams(sp);
    next.set("p", String(pageIndex));
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, lastPageKey]);

  const verses = res.data?.verses ?? [];
  const paginationEnabled = !!res.data && dims.w > 0 && dims.h > 0;

  // host invisível que renderiza todos os versos (pra coletar offsets)
  const measureHostRef = useRef<HTMLDivElement | null>(null);

  const { pages, breaks } = useAnchoredPagination({
    verses,
    enabled: paginationEnabled,
    pageHeightPx: dims.h,
    chapterKey,
    layoutKey,
    hostRef: measureHostRef,
  });

  const totalPages = pages?.length ?? (breaks ? Math.max(0, breaks.length - 1) : 0);

  // clamp quando pages chegam
  useEffect(() => {
    if (!pages) return;
    setPageIndex((p) => {
      const max = Math.max(0, pages.length - 1);
      return Math.min(Math.max(0, p), max);
    });
  }, [pages]);

  const leftIndex = pageIndex;
  const rightIndex = pageIndex + 1;

  if (res.loading) return <div className="glass">Loading…</div>;
  if (res.error) return <div className="glass">Error: {res.error}</div>;
  if (!res.data) return null;

  return (
    <div className="book-spread">
      <div className="book-gutter" />

      {/* Host invisível (mesmo DOM do Verse), só pra medir offsets */}
      <div
        ref={measureHostRef}
        aria-hidden="true"
        className="chapter-body paging-measure-host"
        style={{ width: dims.w || 600 }}
      >
        {verses.map((v, idx) => (
          <Verse
            key={v.verse}
            refObj={{
              translation: props.translation,
              book: props.book,
              chapter: props.chapter,
              verse: v.verse,
            }}
            text={v.text}
            highlighted={false}
            onToggleHighlight={() => {}}
            dataIndex={idx}
          />
        ))}
      </div>

      <div className="book-spread-inner">
        {/* Página esquerda */}
        <section className="page page-left page-col">
          <header className="page-header">
            <button className="page-nav-btn" onClick={props.onOpenNav}>
              ☰
            </button>
            <div>
              <h2>{title}</h2>
              <div className="page-sub">
                {pages ? `Page: ${pageIndex + 1} of ${totalPages}` : ""}
              </div>
            </div>
          </header>

          {/* ✅ O ref precisa estar num elemento que realmente recebe altura */}
          <div ref={bodyRef} className="page-viewport">
            <div className="chapter-body chapter-body--paged">
              {!pages ? (
                <div className="paging-loading">Calculando páginas…</div>
              ) : pages[leftIndex] ? (
                <VerseSliceView
                  translation={props.translation}
                  book={props.book}
                  chapter={props.chapter}
                  verses={pages[leftIndex]}
                />
              ) : null}
            </div>
          </div>
        </section>

        {/* Página direita (desktop) */}
        {!isMobile && (
          <section className="page page-right page-col">
            <div className="chapter-body">
              {!pages ? null : pages[rightIndex] ? (
                <VerseSliceView
                  translation={props.translation}
                  book={props.book}
                  chapter={props.chapter}
                  verses={pages[rightIndex]}
                />
              ) : (
                <div style={{ opacity: 0.35 }} />
              )}
            </div>
          </section>
        )}
      </div>

      {/* underbar */}
      <div className="book-underbar">
        <button className="lang-pill" onClick={() => setLangOpen(true)}>
          Translation: {props.translation.toUpperCase()} ▴
        </button>
      </div>

      <BottomSheet open={langOpen} onClose={() => setLangOpen(false)} title="Select translation">
        <LanguagePicker
          translation={props.translation}
          bookId={props.book}
          chapter={props.chapter}
          onDone={() => setLangOpen(false)}
        />
      </BottomSheet>
    </div>
  );
}
