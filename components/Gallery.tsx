import React from "react";

import DomeGallery from "./DomeGallery";

const Gallery = () => {
  return (
    <div className="w-full h-[80vh] object-fill">
      <DomeGallery
        fit={1}
        minRadius={800}
        maxVerticalRotationDeg={3}
        segments={34}
        dragDampening={1}
        grayscale={false}
      />
    </div>
  );
};

export default Gallery;
