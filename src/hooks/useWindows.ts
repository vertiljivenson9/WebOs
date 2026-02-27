import { useEffect, useState } from 'react';
import type { WindowState } from '@/types';
import { windowManager } from '@/core/WindowManager';

export function useWindows() {
  const [windows, setWindows] = useState<WindowState[]>(windowManager.getAllWindows());

  useEffect(() => {
    return windowManager.subscribe(setWindows);
  }, []);

  return windows;
}

export function useWindow(id: string) {
  const [window, setWindow] = useState<WindowState | undefined>(windowManager.getWindow(id));

  useEffect(() => {
    return windowManager.subscribe((windows) => {
      setWindow(windows.find(w => w.id === id));
    });
  }, [id]);

  return window;
}

export function useFocusedWindow() {
  const [focusedWindow, setFocusedWindow] = useState<WindowState | null>(windowManager.getFocusedWindow());

  useEffect(() => {
    return windowManager.subscribe((windows) => {
      setFocusedWindow(windows.find(w => w.isFocused) || null);
    });
  }, []);

  return focusedWindow;
}
