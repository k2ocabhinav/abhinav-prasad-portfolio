// One shared IntersectionObserver for every reveal on the page. Elements are
// marked `data-in="true"` once, the first time they come into view, and then
// unobserved, so reveals never replay and cost nothing after they run.

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.in = "true";
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
  );
  return observer;
}

export function observeReveal(element: Element): () => void {
  const io = getObserver();
  io.observe(element);
  return () => io.unobserve(element);
}
