import React from "react";
import DomeGallery from "./DomeGallery";

const Gallery = () => {
  return (
    <section className="w-full">
      <div className="mx-auto w-full pt-20 pb-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Photo Gallery
          </h1>
        </div>

        <div className="relative mt-10 overflow-visible">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />

          <div className="h-[85vh] min-h-[640px] w-full">
            <DomeGallery
              fit={1}
              minRadius={520}
              maxVerticalRotationDeg={6}
              segments={34}
              dragDampening={1}
              grayscale={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
