import type { MouseEvent } from "@opentui/core";
import { MouseButton } from "@opentui/core";
import { useRenderer } from "@opentui/react";
import { useCallback } from "react";
import { IS_WIN } from "../core/platform/index.js";
import { copyToClipboard as nativeCopyToClipboard } from "../utils/clipboard.js";

export interface CopySelectionHandlers {
  copySelection: () => boolean;
  onMouseDown: (evt: MouseEvent) => void;
  onMouseUp: (() => void) | undefined;
}

export function useCopySelection(): CopySelectionHandlers {
  const renderer = useRenderer();

  const copySelection = useCallback((): boolean => {
    const sel = renderer.getSelection();
    if (!sel) return false;
    const text = sel.getSelectedText();
    if (!text) return false;
    const focus = renderer.currentFocusedRenderable as
      | { getClipboardText?: (text: string) => string }
      | null
      | undefined;
    const clipboardText =
      focus?.getClipboardText && sel.selectedRenderables.includes(focus as never)
        ? focus.getClipboardText(text)
        : text;
    renderer.copyToClipboardOSC52(clipboardText);
    nativeCopyToClipboard(clipboardText);
    renderer.clearSelection();
    return true;
  }, [renderer]);

  const onMouseDown = useCallback(
    (evt: MouseEvent) => {
      if (IS_WIN) return;
      if (evt.button !== MouseButton.RIGHT) return;
      if (!copySelection()) return;
      evt.preventDefault();
      evt.stopPropagation();
    },
    [copySelection],
  );

  const onMouseUp = IS_WIN ? undefined : copySelection;

  return { copySelection, onMouseDown, onMouseUp };
}
