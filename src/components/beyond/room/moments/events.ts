export const FOCUS_MOMENT_EVENT = "beyond:focus-moment";
export const OPEN_MOMENTS_LIST_EVENT = "beyond:open-moments-list";

export function requestMomentFocus(id: string): void {
  window.dispatchEvent(new CustomEvent(FOCUS_MOMENT_EVENT, { detail: { id } }));
}

export function requestMomentsList(): void {
  window.dispatchEvent(new Event(OPEN_MOMENTS_LIST_EVENT));
}
