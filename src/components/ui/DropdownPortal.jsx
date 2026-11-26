import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 4;

const computeStyle = (anchor, maxHeight) => {
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  // Open upward when there isn't room below and there's more room above
  const opensUp = spaceBelow < maxHeight && rect.top > spaceBelow;
  return {
    position: "fixed",
    left: rect.left,
    width: rect.width,
    zIndex: 60,
    ...(opensUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
  };
};

/**
 * Renders a dropdown panel on document.body at the anchor's position, so it isn't clipped
 * by scrolling containers such as modal bodies. Mount it only while open.
 */
const DropdownPortal = ({ anchorRef, panelRef, maxHeight = 288, children }) => {
  // Hidden until measured: the anchor's position is read after mount, never during render
  const [style, setStyle] = useState(null);

  useEffect(() => {
    const update = () => anchorRef.current && setStyle(computeStyle(anchorRef.current, maxHeight));
    const frame = requestAnimationFrame(update);
    // Capture phase catches scrolling of any ancestor (e.g. the modal body)
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, maxHeight]);

  return createPortal(
    <div ref={panelRef} style={style ?? { position: "fixed", visibility: "hidden" }}>
      {children}
    </div>,
    document.body,
  );
};

export default DropdownPortal;
