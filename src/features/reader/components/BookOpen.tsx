import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { BookId, TranslationId } from "../../../shared/bible/refs";
import { getBookById, BIBLE_BOOKS } from "../../../shared/bible/books";
import { t } from "../../../shared/i18n/ui";
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

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(Math.floor(n), min), max);
}

function bookIndex(bookId: string) {
  return BIBLE_BOOKS.findIndex((b) => b.id === bookId);
}

function nextChapterRef(bookId: string, chapter: number) {
  const bi = bookIndex(bookId);
  const b = bi >= 0 ? BIBLE_BOOKS[bi] : null;
  if (!b) return { book: "genesis", chapter: 1 };

  if (chapter < b.chapters) return { book: b.id, chapter: chapter + 1 };

  const nb = BIBLE_BOOKS[bi + 1];
  if (nb) return { book: nb.id, chapter: 1 };

  return { book: b.id, chapter: b.chapters };
}

function prevChapterRef(bookId: string, chapter: number) {
  const bi = bookIndex(bookId);
  const b = bi >= 0 ? BIBLE_BOOKS[bi] : null;
  if (!b) return { book: "genesis", chapter: 1 };

  if (chapter > 1) return { book: b.id, chapter: chapter - 1 };

  const pb = BIBLE_BOOKS[bi - 1];
  if (pb) return { book: pb.id, chapter: pb.chapters };

  return { book: b.id, chapter: 1 };
}

function getSavedLastPage(params: {
  translation: TranslationId;
  book: string;
  chapter: number;
  layoutKey: string;
}) {
  const chapterKey = `${params.translation}:${params.book}:${params.chapter}`;
  const lastKey = `bible:lastPage:${chapterKey}:${params.layoutKey}`;
  const saved = lsGet(lastKey);
  const pSaved = saved != null ? Number(saved) : NaN;
  if (Number.isFinite(pSaved) && pSaved >= 0) return Math.floor(pSaved);

  // fallback: se tiver paging cache com pages, usa última
  const pagingKey = `bible:paging:${chapterKey}:${params.layoutKey}`;
  const raw = lsGet(pagingKey);
  try {
    const obj = raw ? JSON.parse(raw) : null;
    const pages = obj?.pages;
    if (Number.isFinite(pages) && pages > 0) return Math.max(0, Math.floor(pages) - 1);
  } catch {
    // ignore
  }

  return 0;
}

export default function BookOpen(props: {
  translation: TranslationId;
  book: BookId;
  chapter: number;
  onOpenNav: () => void;
}) {
  const nav = useNavigate();
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

  // estado da página (controlado por URL + fallback localStorage)
  const [pageIndex, setPageIndex] = useState(0);

  // 🔒 evita loop URL->state->URL
  const syncingRef = useRef(false);

  // 1) URL / localStorage -> state
  useEffect(() => {
    const max = Math.max(0, (pages?.length ?? 1) - 1);

    const pRaw = sp.get("p");
    const pUrl = pRaw != null ? Number(pRaw) : NaN;

    if (Number.isFinite(pUrl) && pUrl >= 0) {
      const clamped = clampInt(pUrl, 0, max);
      syncingRef.current = true;
      setPageIndex(clamped);
      return;
    }

    const saved = lsGet(lastPageKey);
    const pSaved = saved != null ? Number(saved) : NaN;

    const next = Number.isFinite(pSaved) && pSaved >= 0 ? Math.floor(pSaved) : 0;
    syncingRef.current = true;
    setPageIndex(clampInt(next, 0, max));
  }, [sp, lastPageKey, pages]);

  // 2) state -> URL + localStorage
  useEffect(() => {
    const max = Math.max(0, (pages?.length ?? 1) - 1);
    const clamped = clampInt(pageIndex, 0, max);

    if (clamped !== pageIndex) {
      setPageIndex(clamped);
      return;
    }

    lsSet(lastPageKey, String(clamped));

    if (syncingRef.current) {
      syncingRef.current = false;
      return;
    }

    const currentP = sp.get("p");
    if (currentP === String(clamped)) return;

    const next = new URLSearchParams(sp);
    next.set("p", String(clamped));
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, lastPageKey, pages]);

  const leftIndex = pageIndex;
  const rightIndex = pageIndex + 1;

  function goTo(book: string, chapter: number, p?: number) {
    const qs = new URLSearchParams();
    if (p != null) qs.set("p", String(Math.max(0, Math.floor(p))));
    const q = qs.toString();
    nav(`/read/${props.translation}/${book}/${chapter}${q ? `?${q}` : ""}`);
  }

  const step = isMobile ? 1 : 2;

  function onNext() {
    if (!pages || totalPages <= 0) return;

    const nextP = pageIndex + step;
    if (nextP <= totalPages - 1) {
      setPageIndex(nextP);
      return;
    }

    const nxt = nextChapterRef(props.book, props.chapter);
    goTo(nxt.book, nxt.chapter, 0);
  }

  function onPrev() {
    if (!pages || totalPages <= 0) return;

    const prevP = pageIndex - step;
    if (prevP >= 0) {
      setPageIndex(prevP);
      return;
    }

    const prv = prevChapterRef(props.book, props.chapter);
    const last = getSavedLastPage({
      translation: props.translation,
      book: prv.book,
      chapter: prv.chapter,
      layoutKey,
    });

    goTo(prv.book, prv.chapter, last);
  }

  if (res.loading) return <div className="glass">{t(props.translation, "app.loading")}</div>;
  if (res.error)
    return (
      <div className="glass">
        {t(props.translation, "app.error", { msg: res.error })}
      </div>
    );
  if (!res.data) return null;

  return (
    <div className="book-spread">
      <div className="book-gutter" />

      {/* Host invisível: mede com o MESMO layout do paginado */}
      <div
        ref={measureHostRef}
        aria-hidden="true"
        className="chapter-body chapter-body--paged paging-measure-host"
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
            dataIndex={idx}
          />
        ))}
      </div>

      <div className="book-spread-inner">
        {/* Página esquerda */}
        <section className="page page-left page-col">
          <header className="page-header">
            <button
              className="page-nav-btn"
              onClick={props.onOpenNav}
              title={t(props.translation, "reader.menu")}
              type="button"
            >
              ☰
            </button>

            <div className="page-header-text">
              <div className="page-header-center">
                <h2>{title}</h2>
                <div className="page-sub">
                  {pages
                    ? t(props.translation, "reader.totalPages", { total: totalPages })
                    : ""}
                </div>
              </div>

              <button
                type="button"
                className="page-close-btn"
                onClick={() => nav("/")}
                title={t(props.translation, "reader.closeBook")}
              >
                {t(props.translation, "reader.closeBook")}
              </button>
            </div>
          </header>

          <div ref={bodyRef} className="page-viewport">
            <div className="chapter-body chapter-body--paged">
              {!pages ? (
                <div className="paging-loading">
                  {t(props.translation, "reader.calculatingPages")}
                </div>
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

          <div className="page-sub">
            {pages ? t(props.translation, "reader.pageSingle", { page: pageIndex + 1 }) : ""}
          </div>
        </section>

        {/* Página direita (desktop) */}
        {!isMobile && (
          <section className="page page-right page-col">
            <div className="chapter-body chapter-body--paged">
              {!pages ? null : pages[rightIndex] ? (
                <VerseSliceView
                  translation={props.translation}
                  book={props.book}
                  chapter={props.chapter}
                  verses={pages[rightIndex]}
                />
              ) : (
                <div className="chapter-body--unpaged" />
              )}
            </div>

            <div className="page-sub">
              {pages ? t(props.translation, "reader.pageSingle", { page: pageIndex + 2 }) : ""}
            </div>
          </section>
        )}
      </div>

      {/* underbar */}
      <div className="book-underbar">
        <button
          className="lang-pill"
          onClick={onPrev}
          title={t(props.translation, "reader.prev")}
          type="button"
        >
          {t(props.translation, "reader.prev")}
        </button>

        <button className="lang-pill" onClick={() => setLangOpen(true)} type="button">
          {t(props.translation, "reader.translationPill", {
            id: props.translation.toUpperCase(),
          })}
        </button>

        <button
          className="lang-pill"
          onClick={onNext}
          title={t(props.translation, "reader.next")}
          type="button"
        >
          {t(props.translation, "reader.next")}
        </button>
      </div>

      <BottomSheet
        open={langOpen}
        onClose={() => setLangOpen(false)}
        title={t(props.translation, "reader.selectTranslation")}
      >
        <LanguagePicker
          value={props.translation}
          onSelect={(next) => {
            const qs = new URLSearchParams(window.location.search);
            qs.delete("p"); // evita carregar página inválida na nova tradução
            const q = qs.toString();

            nav(`/read/${next}/${props.book}/${props.chapter}${q ? `?${q}` : ""}`);
            setLangOpen(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}
