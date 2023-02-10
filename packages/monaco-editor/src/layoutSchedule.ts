import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export interface IEditor {
  layout(dimension?: monaco.editor.IDimension): void;
  isContainerHidden(): boolean;
}

const editorsInSchedule: Map<IEditor, monaco.editor.IDimension | undefined> = new Map();
let layoutTimer: ReturnType<typeof requestAnimationFrame> | null = null;

function executeLayout() {
  layoutTimer = null;
  const editorsToLayout = [];
  for (const [editor, layout] of editorsInSchedule) {
    if (!editor.isContainerHidden()) {
      editorsToLayout.push([editor, layout]);
    }
  }

  for (const [editor, layout] of editorsToLayout) {
    (editor as IEditor).layout(layout as monaco.editor.IDimension | undefined);
  }

  editorsInSchedule.clear();
}

/**
 * For monaco editors, we need to call layout() on any editors that might have changed size otherwise the view will look off.
 * These updates often happen together with other editors, such as when the window resizes.
 * In order to avoid layout thrashing, we batch these layout calls together and perform them all at once in a RAF timeout.
 */
export function scheduleEditorForLayout(editor: IEditor, layout: monaco.editor.IDimension | undefined) {
  editorsInSchedule.set(editor, layout);
  if (!layoutTimer) {
    // Using RAF here ensures that the layout will happen on the next frame.
    layoutTimer = requestAnimationFrame(executeLayout);
  }
}
