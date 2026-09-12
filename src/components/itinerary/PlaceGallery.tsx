"use client";

import { useState, useEffect, useCallback } from "react";

interface PlaceGalleryProps {
  placeName: string;
  /** Only show for scenic/tourist places — skip transport hubs */
  placeType: "activity" | "stay" | "food";
}

export default function PlaceGallery({ placeName, placeType }: PlaceGalleryProps) {
  const [thumb, setThumb] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [modalPhotos, setModalPhotos] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Build a smart search query — skip generic words for food
  const buildQuery = () => {
    if (placeType === "food") return `${placeName} restaurant`;
    if (placeType === "stay") return `${placeName} scenic view`;
    return placeName;
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/places?query=${encodeURIComponent(buildQuery())}&limit=1`)
      .then((r) => r.json())
      .then((d) => {
        if (d.photos?.[0]) setThumb(d.photos[0]);
      })
      .finally(() => setLoading(false));
  }, [placeName]);

  const openGallery = async () => {
    setShowModal(true);
    if (modalPhotos.length === 0) {
      setLoadingMore(true);
      const res = await fetch(
        `/api/places?query=${encodeURIComponent(buildQuery())}&limit=20`
      );
      const data = await res.json();
      setModalPhotos(data.photos || []);
      setLoadingMore(false);
    }
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
    setLightbox(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (lightbox !== null) {
        if (e.key === "ArrowRight") setLightbox((i) => Math.min((i ?? 0) + 1, modalPhotos.length - 1));
        if (e.key === "ArrowLeft") setLightbox((i) => Math.max((i ?? 0) - 1, 0));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal, lightbox, modalPhotos.length, closeModal]);

  if (loading) {
    return (
      <div className="mt-3 h-40 rounded-xl bg-slate-100 animate-pulse" />
    );
  }

  if (!thumb) return null;

  return (
    <>
      {/* Thumbnail Strip */}
      <div className="mt-3 relative rounded-xl overflow-hidden group cursor-pointer" onClick={openGallery}>
        <img
          src={thumb}
          alt={placeName}
          className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center justify-between">
          <span className="text-white text-xs font-semibold drop-shadow truncate max-w-[70%]">
            {placeName}
          </span>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold hover:bg-white/30 transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">photo_library</span>
            View Photos
          </button>
        </div>
      </div>

      {/* Modal Gallery */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal Card */}
          <div className="relative w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[85vh] bg-white sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl overflow-hidden animate-[fadeSlideUp_0.25s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900">{placeName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {loadingMore ? "Loading photos..." : `${modalPhotos.length} photos`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-600">close</span>
              </button>
            </div>

            {/* Photo Grid */}
            <div className="overflow-y-auto p-4">
              {loadingMore ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`rounded-xl bg-slate-100 animate-pulse ${i === 0 ? "col-span-2 sm:col-span-1 h-48" : "h-36"}`} />
                  ))}
                </div>
              ) : modalPhotos.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl block mb-2">image_not_supported</span>
                  No photos available
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {modalPhotos.map((url, i) => (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                        i === 0 ? "col-span-2 sm:col-span-1 row-span-2" : ""
                      }`}
                      style={{ height: i === 0 ? "240px" : "112px" }}
                      onClick={() => setLightbox(i)}
                    >
                      <img
                        src={url}
                        alt={`${placeName} photo ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                          zoom_in
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              className="absolute left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          <img
            src={modalPhotos[lightbox]}
            alt={placeName}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {lightbox < modalPhotos.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              className="absolute right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">
            {lightbox + 1} / {modalPhotos.length}
          </div>
        </div>
      )}
    </>
  );
}
