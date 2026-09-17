import type { ImageType } from "../../types";

export function getImageSizes(type: ImageType): string {
  if (type === "hero") {
    return (
      "(max-width: 768px) 100vw, " + "(max-width: 1280px) 90vw, " + "1200px"
    );
  }

  if (type === "gallery") {
    return (
      "(max-width: 768px) 100vw, " + "(max-width: 1024px) 50vw, " + "600px"
    );
  }

  if (type === "room") {
    return (
      "(max-width: 768px) 100vw, " + "(max-width: 1024px) 50vw, " + "600px"
    );
  }

  return "(max-width: 768px) 100vw, " + "(max-width: 1280px) 50vw, " + "600px";
}
