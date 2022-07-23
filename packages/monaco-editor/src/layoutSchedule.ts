
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

const editorsToLayout: Map<monaco.editor.IEditor, monaco.editor.IDimension | undefined> = new Map();
let layoutTimer: ReturnType<typeof requestAnimationFrame> | null = null;

/**
 * For monaco editors, we need to call layout() on any editors that might have changed size otherwise the view will look off.
 * These updates often happen together with other editors, such as when the window resizes.
 * In order to avoid layout thrashing, we batch these layout calls together and perform them all at once in a RAF timeout.
 */
export function scheduleEditorForLayout(editor: monaco.editor.IEditor, layout: monaco.editor.IDimension | undefined) {
  editorsToLayout.set(editor, layout);
  if (!layoutTimer) {
    // Using RAF here ensures that the layout will happen on the next frame.
    layoutTimer = requestAnimationFrame(() => {
      layoutTimer = null;
      editorsToLayout.forEach((layout, ed) => {
        ed.layout(layout);
      });
      editorsToLayout.clear();
    });
  }
}