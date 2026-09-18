import { useMemo } from "react";
import { Image as ImageIcon, Sparkles } from "lucide-react";

/**
 * Parses ratio strings like "8 × 10", "10x12", "4 x 6" to a CSS aspect-ratio value.
 * Default is 4/5 (8 × 10).
 */
export function getAspectRatio(ratioString) {
  if (!ratioString) return "4 / 5";
  const match = ratioString.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    if (w > 0 && h > 0) {
      return `${w} / ${h}`;
    }
  }
  return "4 / 5";
}

/**
 * Extracts numeric width and height components from ratio strings.
 */
export function parseRatioDimensions(ratioString) {
  if (!ratioString) return { width: 4, height: 5, aspect: 4 / 5 };
  const match = ratioString.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    if (w > 0 && h > 0) {
      return { width: w, height: h, aspect: w / h };
    }
  }
  return { width: 4, height: 5, aspect: 4 / 5 };
}

/**
 * Color stops for realistic fallback wood grain rendering across screen CSS & canvas.
 */
export function getWoodColorStops(woodName = "") {
  const name = (woodName || "").toLowerCase();
  if (name.includes("rose")) return ["#4A1E18", "#30130F", "#1F0B08"];
  if (name.includes("teak")) return ["#8B5A2B", "#653E1B", "#47290F"];
  if (name.includes("pine")) return ["#D8B27C", "#B88E52", "#94713E"];
  if (name.includes("black")) return ["#2D2B29", "#1A1918", "#0F0E0E"];
  if (name.includes("walnut")) return ["#42291B", "#2D1A10", "#1B0F08"];
  return ["#6E4723", "#4D3016", "#331E0C"];
}

/**
 * Get fallback wood gradient and base styling when no texture image is available
 */
export function getWoodFallbackStyle(woodName = "") {
  const colors = getWoodColorStops(woodName);
  const name = (woodName || "").toLowerCase();
  return {
    background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
    color: name.includes("pine") ? "#1C1B19" : "#F8F6F2",
  };
}

/**
 * Returns specific design profile styling (Classic Gold, Modern Black, Vintage Brown, Minimal White)
 * Controls border thickness, inner bevel, outer border, finish, accent color, and decorative profile.
 */
export function getDesignProfileStyle(designName = "") {
  const name = (designName || "").toLowerCase();
  if (name.includes("gold")) {
    return {
      borderWidth: "4px",
      innerBorder: "2.5px solid #C9A669",
      outerBorder: "1px solid #9C7B3D",
      innerBorderColor: "#C9A669",
      outerBorderColor: "#9C7B3D",
      boxShadow: "inset 0 0 8px rgba(201,166,105,0.65), 0 0 5px rgba(156,123,61,0.4)",
      finishOverlay: "linear-gradient(135deg, rgba(201,166,105,0.25) 0%, rgba(156,123,61,0.08) 100%)",
      finishColors: ["rgba(201,166,105,0.25)", "rgba(156,123,61,0.08)"],
      matBackground: "#FAF8F5",
      accentTitle: "Classic Gold Foil Lip",
    };
  }
  if (name.includes("black")) {
    return {
      borderWidth: "3px",
      innerBorder: "2px solid #141312",
      outerBorder: "1px solid #2B2B2B",
      innerBorderColor: "#141312",
      outerBorderColor: "#2B2B2B",
      boxShadow: "inset 0 2px 6px rgba(0,0,0,0.85)",
      finishOverlay: "linear-gradient(135deg, rgba(20,20,20,0.4) 0%, rgba(0,0,0,0.7) 100%)",
      finishColors: ["rgba(20,20,20,0.4)", "rgba(0,0,0,0.7)"],
      matBackground: "#F5F3ED",
      accentTitle: "Matte Ebony Bevel",
    };
  }
  if (name.includes("vintage")) {
    return {
      borderWidth: "6px",
      innerBorder: "3.5px double #523520",
      outerBorder: "2px solid #3E2413",
      innerBorderColor: "#523520",
      outerBorderColor: "#3E2413",
      boxShadow: "inset 0 0 10px rgba(0,0,0,0.75), inset 0 2px 4px rgba(255,255,255,0.18)",
      finishOverlay: "linear-gradient(135deg, rgba(82,53,32,0.35) 0%, rgba(30,15,8,0.6) 100%)",
      finishColors: ["rgba(82,53,32,0.35)", "rgba(30,15,8,0.6)"],
      matBackground: "#EFEAE1",
      accentTitle: "Antique Heritage Patina",
    };
  }
  if (name.includes("white")) {
    return {
      borderWidth: "3px",
      innerBorder: "2px solid #EAE5D9",
      outerBorder: "1px solid #DCD3C0",
      innerBorderColor: "#EAE5D9",
      outerBorderColor: "#DCD3C0",
      boxShadow: "inset 0 1px 4px rgba(0,0,0,0.15)",
      finishOverlay: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(245,242,235,0.3) 100%)",
      finishColors: ["rgba(255,255,255,0.7)", "rgba(245,242,235,0.3)"],
      matBackground: "#FFFFFF",
      accentTitle: "Gallery White Lip",
    };
  }
  return {
    borderWidth: "3px",
    innerBorder: "2px solid #DCD3C0",
    outerBorder: "1px solid #C4BAA3",
    innerBorderColor: "#DCD3C0",
    outerBorderColor: "#C4BAA3",
    boxShadow: "inset 0 1px 4px rgba(0,0,0,0.3)",
    finishOverlay: "transparent",
    finishColors: null,
    matBackground: "#FAF8F5",
    accentTitle: "Standard Finish",
  };
}

/**
 * Resilient image preloader with CORS tolerance.
 */
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin if local or data URL triggered CORS block
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = () => resolve(null);
      fallback.src = src;
    };
    img.src = src;
  });
}

/**
 * Canvas drawing helper that replicates CSS object-fit: cover
 */
function drawImageCover(ctx, img, x, y, w, h) {
  if (!img) return;
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const targetAspect = w / h;
  const imgAspect = imgW / imgH;

  let sx = 0;
  let sy = 0;
  let sWidth = imgW;
  let sHeight = imgH;

  if (imgAspect > targetAspect) {
    sWidth = imgH * targetAspect;
    sx = (imgW - sWidth) / 2;
  } else {
    sHeight = imgW / targetAspect;
    sy = (imgH - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

/**
 * Canvas rounded rectangle helper compatible with all browsers
 */
function drawRoundRect(ctx, x, y, w, h, radius) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Single source of truth for high-resolution frame image generation.
 * Composes wood timber texture, design profile, customer photo, and ratio onto an HTMLCanvasElement
 * and triggers download of a high-resolution PNG artwork file.
 */
export async function exportFrameImage(order, woodTypes = [], designs = []) {
  if (!order) throw new Error("No order provided for frame export");

  // 1. Resolve matching wood timber and design profile items
  const matchedWood = (woodTypes || []).find(
    (w) =>
      (w.name || "").trim().toLowerCase() === (order.woodType || "").trim().toLowerCase() ||
      (w.id || "").trim().toLowerCase() === (order.woodId || "").trim().toLowerCase()
  );

  const matchedDesign = (designs || []).find(
    (d) =>
      (d.name || "").trim().toLowerCase() === (order.frameDesign || "").trim().toLowerCase() ||
      (d.id || "").trim().toLowerCase() === (order.designId || "").trim().toLowerCase()
  );

  const woodTextureUrl = matchedWood?.image || "";
  const designTextureUrl = matchedDesign?.image || "";
  const photoUrl = order.photoUrl || "";

  // 2. Preload assets asynchronously
  const [woodImg, designImg, photoImg] = await Promise.all([
    loadImage(woodTextureUrl),
    loadImage(designTextureUrl),
    loadImage(photoUrl),
  ]);

  // 3. Compute high-resolution canvas dimensions respecting selected ratio
  const { width: rw, height: rh } = parseRatioDimensions(order.frameRatio);

  const MOULDING = 90;       // Outer wood timber moulding thickness (px)
  const PROFILE = 24;        // Design profile border thickness (px)
  const MAT = 46;            // Archival museum matboard border thickness (px)
  const TOTAL_BORDER = MOULDING + PROFILE + MAT; // 160px per side -> 320px total
  const SHADOW_MARGIN = 32;  // Ambient wall drop shadow padding (px)

  let photoW = 1000;
  let photoH = 1000;

  if (rw <= rh) {
    // Portrait or square
    photoW = 1000;
    photoH = Math.round(1000 * (rh / rw));
  } else {
    // Landscape
    photoH = 1000;
    photoW = Math.round(1000 * (rw / rh));
  }

  const frameW = photoW + TOTAL_BORDER * 2;
  const frameH = photoH + TOTAL_BORDER * 2;

  const canvasW = frameW + SHADOW_MARGIN * 2;
  const canvasH = frameH + SHADOW_MARGIN * 2;

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const frameX = SHADOW_MARGIN;
  const frameY = SHADOW_MARGIN;

  // ----------------------------------------------------
  // LAYER 1: Ambient Wall Drop Shadow
  // ----------------------------------------------------
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 38;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#1A1918";
  drawRoundRect(ctx, frameX, frameY, frameW, frameH, 6);
  ctx.fill();
  ctx.restore();

  // ----------------------------------------------------
  // LAYER 2 & 3: Outer Timber Frame & Wood Texture
  // ----------------------------------------------------
  ctx.save();
  drawRoundRect(ctx, frameX, frameY, frameW, frameH, 6);
  ctx.clip();

  if (woodImg) {
    drawImageCover(ctx, woodImg, frameX, frameY, frameW, frameH);
  } else {
    const woodColors = getWoodColorStops(order.woodType);
    const woodGrad = ctx.createLinearGradient(
      frameX,
      frameY,
      frameX + frameW,
      frameY + frameH
    );
    woodGrad.addColorStop(0, woodColors[0]);
    woodGrad.addColorStop(0.5, woodColors[1]);
    woodGrad.addColorStop(1, woodColors[2]);
    ctx.fillStyle = woodGrad;
    ctx.fillRect(frameX, frameY, frameW, frameH);
  }

  // Mitered Outer Bevel Lighting & Shading Overlay
  const bevelGrad = ctx.createLinearGradient(
    frameX,
    frameY,
    frameX + frameW,
    frameY + frameH
  );
  bevelGrad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
  bevelGrad.addColorStop(0.25, "rgba(255, 255, 255, 0.04)");
  bevelGrad.addColorStop(0.7, "transparent");
  bevelGrad.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = bevelGrad;
  ctx.fillRect(frameX, frameY, frameW, frameH);

  // Subtle outer edge relief highlight
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, frameX + 1, frameY + 1, frameW - 2, frameH - 2, 5);
  ctx.stroke();

  ctx.restore();

  // ----------------------------------------------------
  // LAYER 4: Design Profile Layer & Accent Inlay
  // ----------------------------------------------------
  const profileX = frameX + MOULDING;
  const profileY = frameY + MOULDING;
  const profileW = frameW - MOULDING * 2;
  const profileH = frameH - MOULDING * 2;

  const designProfile = getDesignProfileStyle(order.frameDesign);

  ctx.save();
  drawRoundRect(ctx, profileX, profileY, profileW, profileH, 4);
  ctx.clip();

  // Mat background base
  ctx.fillStyle = designProfile.matBackground || "#FAF8F5";
  ctx.fillRect(profileX, profileY, profileW, profileH);

  // Design texture image or finish gradient overlay
  if (designImg) {
    ctx.globalAlpha = 0.28;
    ctx.globalCompositeOperation = "multiply";
    drawImageCover(ctx, designImg, profileX, profileY, profileW, profileH);
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";
  } else if (designProfile.finishColors) {
    const finishGrad = ctx.createLinearGradient(
      profileX,
      profileY,
      profileX + profileW,
      profileY + profileH
    );
    finishGrad.addColorStop(0, designProfile.finishColors[0]);
    finishGrad.addColorStop(1, designProfile.finishColors[1]);
    ctx.fillStyle = finishGrad;
    ctx.fillRect(profileX, profileY, profileW, profileH);
  }

  // Inner border shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = designProfile.innerBorderColor || "#C9A669";
  ctx.lineWidth = 3;
  drawRoundRect(ctx, profileX, profileY, profileW, profileH, 4);
  ctx.stroke();

  ctx.restore();

  // ----------------------------------------------------
  // LAYER 5: Museum Matboard Opening & 45° Bevel Cut Shadow
  // ----------------------------------------------------
  const photoBoxX = profileX + PROFILE + MAT;
  const photoBoxY = profileY + PROFILE + MAT;
  const photoBoxW = photoW;
  const photoBoxH = photoH;

  const matX = profileX + PROFILE;
  const matY = profileY + PROFILE;
  const matW = profileW - PROFILE * 2;
  const matH = profileH - PROFILE * 2;

  ctx.save();
  ctx.fillStyle = designProfile.matBackground || "#FAF8F5";
  ctx.fillRect(matX, matY, matW, matH);

  // Archival matboard outer accent line
  ctx.strokeStyle = designProfile.outerBorderColor || "#DCD3C0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(matX, matY, matW, matH);
  ctx.restore();

  // ----------------------------------------------------
  // LAYER 6: Customer Photo
  // ----------------------------------------------------
  ctx.save();
  ctx.beginPath();
  ctx.rect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);
  ctx.clip();

  if (photoImg) {
    drawImageCover(ctx, photoImg, photoBoxX, photoBoxY, photoBoxW, photoBoxH);
  } else {
    // Elegant fallback if no photo URL is available
    ctx.fillStyle = "#F4EFE6";
    ctx.fillRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);
    ctx.fillStyle = "#8C6D32";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Customer Photo Placeholder", photoBoxX + photoBoxW / 2, photoBoxY + photoBoxH / 2);
  }

  // ----------------------------------------------------
  // LAYER 7: Protective Art Glass Reflection Overlay
  // ----------------------------------------------------
  const glassGrad = ctx.createLinearGradient(
    photoBoxX,
    photoBoxY,
    photoBoxX + photoBoxW * 0.65,
    photoBoxY + photoBoxH * 0.65
  );
  glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.42)");
  glassGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.05)");
  glassGrad.addColorStop(0.55, "transparent");
  glassGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glassGrad;
  ctx.fillRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);

  ctx.restore();

  // 45° Bevel Cut Shadow onto the photo window
  ctx.save();
  ctx.strokeStyle = "#E0D9CC";
  ctx.lineWidth = 1;
  ctx.strokeRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH);

  const shadowDepth = 12;
  const topShadow = ctx.createLinearGradient(photoBoxX, photoBoxY, photoBoxX, photoBoxY + shadowDepth);
  topShadow.addColorStop(0, "rgba(0, 0, 0, 0.35)");
  topShadow.addColorStop(1, "transparent");
  ctx.fillStyle = topShadow;
  ctx.fillRect(photoBoxX, photoBoxY, photoBoxW, shadowDepth);

  const leftShadow = ctx.createLinearGradient(photoBoxX, photoBoxY, photoBoxX + shadowDepth, photoBoxY);
  leftShadow.addColorStop(0, "rgba(0, 0, 0, 0.3)");
  leftShadow.addColorStop(1, "transparent");
  ctx.fillStyle = leftShadow;
  ctx.fillRect(photoBoxX, photoBoxY, shadowDepth, photoBoxH);
  ctx.restore();

  // ----------------------------------------------------
  // GENERATE PNG & TRIGGER DOWNLOAD
  // ----------------------------------------------------
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        return reject(new Error("Failed to generate image blob from canvas"));
      }
      const filename = `Subash-Studio-Frame-${order.id || "order"}.png`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve(filename);
      }, 200);
    }, "image/png");
  });
}

/**
 * Resolves the file extension and MIME type for a customer order image.
 */
export function getCustomerImageDetails(order) {
  if (!order || !order.photoUrl) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  const url = order.photoUrl;

  // Case 1: Data URL e.g. data:image/png;base64,...
  if (url.startsWith("data:")) {
    const mimeMatch = url.match(/^data:([^;,]+)/);
    const mime = mimeMatch ? mimeMatch[1].toLowerCase() : "image/jpeg";
    if (mime.includes("png")) return { extension: "png", mimeType: "image/png" };
    if (mime.includes("webp")) return { extension: "webp", mimeType: "image/webp" };
    if (mime.includes("gif")) return { extension: "gif", mimeType: "image/gif" };
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  // Case 2: Inspect order.photoName if available
  if (order.photoName) {
    const extMatch = order.photoName.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase();
      const cleanExt = ext === "jpeg" ? "jpg" : ext;
      const mime = cleanExt === "png" ? "image/png" : cleanExt === "webp" ? "image/webp" : "image/jpeg";
      return { extension: cleanExt, mimeType: mime };
    }
  }

  // Case 3: URL path extension
  try {
    const pathname = url.split("?")[0].split("#")[0];
    const extMatch = pathname.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase();
      const cleanExt = ext === "jpeg" ? "jpg" : ext;
      const mime = cleanExt === "png" ? "image/png" : cleanExt === "webp" ? "image/webp" : "image/jpeg";
      return { extension: cleanExt, mimeType: mime };
    }
  } catch {
    // Fallback
  }

  return { extension: "jpg", mimeType: "image/jpeg" };
}

/**
 * Downloads the customer's original uploaded photograph directly.
 * Does NOT run through canvas, does NOT apply frame/wood/design/effects,
 * does NOT crop or resize the image.
 */
export async function downloadOriginalFrameOrderImage(order) {
  if (!order) throw new Error("No order provided");
  if (!order.photoUrl) throw new Error("No customer photograph associated with this order");

  const { extension } = getCustomerImageDetails(order);
  const filename = `Subash-Studio-Original-${order.id || "order"}.${extension}`;
  const photoUrl = order.photoUrl;

  // Helper to trigger browser file download via anchor
  const triggerDownload = (downloadUrl) => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 300);
  };

  // If photoUrl is a base64 data URL:
  if (photoUrl.startsWith("data:")) {
    try {
      const res = await fetch(photoUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
      return filename;
    } catch {
      // Direct download fallback
      triggerDownload(photoUrl);
      return filename;
    }
  }

  // If photoUrl is a relative or remote URL path:
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    triggerDownload(blobUrl);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    return filename;
  } catch {
    // Direct href download fallback
    triggerDownload(photoUrl);
    return filename;
  }
}

export default function FrameOrderPreview({
  order,
  woodTypes = [],
  designs = [],
  className = "",
}) {
  // Resolve matching wood timber item
  const matchedWood = useMemo(() => {
    if (!order) return null;
    return (woodTypes || []).find(
      (w) =>
        (w.name || "").trim().toLowerCase() === (order.woodType || "").trim().toLowerCase() ||
        (w.id || "").trim().toLowerCase() === (order.woodId || "").trim().toLowerCase()
    );
  }, [woodTypes, order]);

  // Resolve matching design profile item
  const matchedDesign = useMemo(() => {
    if (!order) return null;
    return (designs || []).find(
      (d) =>
        (d.name || "").trim().toLowerCase() === (order.frameDesign || "").trim().toLowerCase() ||
        (d.id || "").trim().toLowerCase() === (order.designId || "").trim().toLowerCase()
    );
  }, [designs, order]);

  if (!order) return null;

  const aspectRatio = getAspectRatio(order.frameRatio);
  const woodTexture = matchedWood?.image || "";
  const designTexture = matchedDesign?.image || "";
  const woodFallback = getWoodFallbackStyle(order.woodType);
  const designProfile = getDesignProfileStyle(order.frameDesign);

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Top Label */}
      <div className="flex items-center justify-center gap-1.5 text-center">
        <Sparkles className="w-3.5 h-3.5 text-[#C9A669]" />
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C6D32]">
          Ordered Frame Preview
        </span>
      </div>

      {/* Frame Wall Stage Container */}
      <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-[#FAF8F5] to-[#ECE7DC] border border-[#E7E0D2] flex items-center justify-center shadow-inner">
        {/* Realistic Outer Timber Frame */}
        <div
          className="relative max-w-[240px] sm:max-w-[280px] lg:max-w-[300px] w-full rounded-sm p-3.5 sm:p-4 transition-all duration-300"
          style={{
            ...woodFallback,
            ...(woodTexture
              ? {
                  backgroundImage: `url(${woodTexture})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {}),
            boxShadow:
              "0 20px 40px -12px rgba(0, 0, 0, 0.45), 0 8px 16px -4px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.35), inset -1px -1px 3px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Outer Frame Wood Bevel & Shading Overlay */}
          <div className="absolute inset-0 rounded-sm pointer-events-none bg-gradient-to-br from-white/15 via-transparent to-black/35" />

          {/* Design Profile Layer & Accent Inlay */}
          <div
            className="relative rounded-sm p-1.5 sm:p-2 transition-all overflow-hidden"
            style={{
              backgroundColor: designProfile.matBackground,
              border: designProfile.innerBorder,
              boxShadow: designProfile.boxShadow,
            }}
          >
            {/* Optional Design Profile Texture / Finish Overlay */}
            {designTexture ? (
              <div
                className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply"
                style={{
                  backgroundImage: `url(${designTexture})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background: designProfile.finishOverlay,
                }}
              />
            )}

            {/* Museum Matboard Opening with 45° Bevel Cut Shadow */}
            <div
              className="relative w-full overflow-hidden bg-black/5 shadow-[inset_0_3px_6px_rgba(0,0,0,0.35)] border border-[#E0D9CC]"
              style={{
                aspectRatio,
              }}
            >
              {/* Customer Photo */}
              {order.photoUrl ? (
                <img
                  src={order.photoUrl}
                  alt={order.photoName || "Customer uploaded photo"}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F4EFE6] text-[#8C6D32]">
                  <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-[11px] font-semibold">No Image Uploaded</span>
                </div>
              )}

              {/* Protective Art Glass Reflection Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                style={{
                  background:
                    "linear-gradient(130deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.05) 45%, transparent 60%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Frame Specifications Caption */}
      <div className="text-center space-y-1">
        <div className="text-xs sm:text-sm font-bold text-[#1C1B19]">
          {order.woodType} &bull; {order.frameDesign} &bull; {order.frameRatio}
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#8C6D32] italic max-w-xs mx-auto leading-tight">
          Visual representation based on the customer&apos;s selected frame configuration.
        </p>
      </div>
    </div>
  );
}
