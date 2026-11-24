import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let frame = 0;
let lastHeight = 0;

const pageHeight = () => document.documentElement.scrollHeight;

function refreshNow() {
  gsap.registerPlugin(ScrollTrigger);
  if (!ScrollTrigger.getAll().length) return; // reduced motion: there are no scenes to move
  ScrollTrigger.refresh();
  lastHeight = pageHeight();
}

/**
 * The pinned scroll scenes measure where they start and end once. If the page above them gets longer or shorter
 * (opening the full swaps grid, a tab, a filter), they have to measure again, or a scene stays pinned over its old
 * scroll range and floats on top of the recipe cards. Call this after anything like that has rendered.
 */
export function remeasureScroll() {
  if (typeof window === "undefined") return;
  cancelAnimationFrame(frame);
  // two frames: React has put the new cards in and the browser has laid them out
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(refreshNow);
  });
}

/**
 * Safety net for every other cause (late images, fonts, anything else that changes the page height):
 * once the height has been steady for a moment and nobody is mid-scroll, the scenes measure again.
 */
export function watchPageHeight() {
  lastHeight = pageHeight();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const check = () => {
    if (ScrollTrigger.isScrolling()) {
      timer = setTimeout(check, 250);
      return;
    }
    if (Math.abs(pageHeight() - lastHeight) >= 4) refreshNow();
  };
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(check, 250);
  });
  ro.observe(document.body);
  return () => {
    clearTimeout(timer);
    ro.disconnect();
  };
}
