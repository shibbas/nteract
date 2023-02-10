/**
 * This module is responsible for monitoring elements and call the resizable components.
 */

/**
 * Interface for resizable components.
 */
export interface IResizable {
  onResize(): void;
}

/**
 * ResizeObserver that monitors the size of the element and calls the resizable component.
 */
const monitoredResizables = new Map<Element, IResizable>();

/**
 * ResizeObserver that monitors the size of the element and calls the resizable component.
 */
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (monitoredResizables.has(entry.target)) {
      const editor = monitoredResizables.get(entry.target);
      editor?.onResize();
    }
  }
});

/**
 * Observe the element for resize events.
 */
export function observe(resizable: IResizable, element: HTMLDivElement) {
  monitoredResizables.set(element, resizable);
  resizeObserver.observe(element);
}

/**
 * Unobserve the element for resize events.
 */
export function unobserve(element: HTMLDivElement) {
  resizeObserver.unobserve(element);
  monitoredResizables.delete(element);
}
