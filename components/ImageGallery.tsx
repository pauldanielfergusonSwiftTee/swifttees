"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type GalleryImage = {
  src: string;
  alt?: string;
};

type ImageGalleryProps = {
  images: GalleryImage[];
  title?: string;
};

export default function ImageGallery({
  images,
  title,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const selectedImage =
    selectedIndex !== null
      ? images[selectedIndex]
      : null;

  function closeGallery() {
    setSelectedIndex(null);
  }

  function showPrevious() {
    if (selectedIndex === null) {
      return;
    }

    setSelectedIndex(
      selectedIndex === 0
        ? images.length - 1
        : selectedIndex - 1
    );
  }

  function showNext() {
    if (selectedIndex === null) {
      return;
    }

    setSelectedIndex(
      selectedIndex === images.length - 1
        ? 0
        : selectedIndex + 1
    );
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    touchEndX.current = null;
    touchStartX.current =
      event.targetTouches[0].clientX;
  }

  function handleTouchMove(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    touchEndX.current =
      event.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (
      touchStartX.current === null ||
      touchEndX.current === null
    ) {
      return;
    }

    const distance =
      touchStartX.current - touchEndX.current;

    const minimumSwipeDistance = 50;

    if (distance > minimumSwipeDistance) {
      showNext();
    }

    if (distance < -minimumSwipeDistance) {
      showPrevious();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedIndex]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <section>
        {title && (
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-900">
              {title}
            </h2>

            <p className="text-sm font-bold text-slate-500">
              {images.length} photos
            </p>
          </div>
        )}

       <div className="grid grid-cols-2 gap-3 md:gap-4">
  {images.map((image, index) => (
    <button
      type="button"
      key={`${image.src}-${index}`}
      onClick={() => setSelectedIndex(index)}
      aria-label={`Open image ${index + 1} of ${images.length}`}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 p-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg md:rounded-3xl ${
        index === 0
          ? "col-span-2 aspect-[16/10]"
          : "aspect-square"
      }`}
    >
      <Image
        src={image.src}
        alt={image.alt ?? `Gallery image ${index + 1}`}
        fill
        sizes={
          index === 0
            ? "(max-width: 768px) 100vw, 1100px"
            : "(max-width: 768px) 50vw, 550px"
        }
        className="object-cover transition duration-500 group-hover:scale-105"
      />
    </button>
  ))}
</div>
      </section>

      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image"
          onClick={closeGallery}
        >
          <div
            className="relative h-[88vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={selectedImage.src}
              alt={
                selectedImage.alt ??
                `Gallery image ${selectedIndex + 1}`
              }
              fill
              priority
              sizes="100vw"
              className="object-contain drop-shadow-2xl"
            />

            <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur">
              {selectedIndex + 1} / {images.length}
            </div>

            <button
              type="button"
              onClick={closeGallery}
              aria-label="Close image"
              className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/65 text-2xl text-white shadow-lg backdrop-blur transition hover:bg-white hover:text-black md:right-0 md:top-0"
            >
              ×
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevious}
                  aria-label="Previous image"
                  className="absolute left-1 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-3xl text-white shadow-lg backdrop-blur transition hover:bg-white hover:text-black md:left-3"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next image"
                  className="absolute right-1 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-3xl text-white shadow-lg backdrop-blur transition hover:bg-white hover:text-black md:right-3"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}