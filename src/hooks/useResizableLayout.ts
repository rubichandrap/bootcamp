'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function getEventPosition(e: MouseEvent | TouchEvent): { clientX: number; clientY: number } | null {
  if ('touches' in e && e.touches && e.touches.length > 0) {
    return {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
    };
  }
  if ('clientX' in e && typeof e.clientX === 'number') {
    return {
      clientX: e.clientX,
      clientY: e.clientY,
    };
  }
  return null;
}

export function calculateSidebarWidth(clientX: number, min = 180, max = 480): number {
  return Math.min(Math.max(clientX, min), max);
}

export function calculateWorkspaceSplit(
  clientX: number,
  containerLeft: number,
  containerWidth: number,
  min = 20,
  max = 80
): number {
  if (containerWidth <= 0) return 50;
  const offsetX = clientX - containerLeft;
  const percent = (offsetX / containerWidth) * 100;
  return Math.min(Math.max(percent, min), max);
}

export function calculateConsoleHeight(
  clientY: number,
  containerBottom: number,
  containerHeight: number,
  min = 100,
  maxMargin = 120
): number {
  const max = Math.max(containerHeight - maxMargin, min);
  const newHeight = containerBottom - clientY;
  return Math.min(Math.max(newHeight, min), max);
}

export function useResizableLayout() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [workspaceSplit, setWorkspaceSplit] = useState<number>(50); // percentage for left pane
  const [consoleHeight, setConsoleHeight] = useState<number>(220);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const isDraggingSidebar = useRef(false);
  const isDraggingWorkspace = useRef(false);
  const isDraggingConsole = useRef(false);

  // Responsive breakpoint tracking
  useEffect(() => {
    const checkDesktop = () => {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= 768);
      }
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Load saved sizes from localStorage
  useEffect(() => {
    try {
      const savedSidebar = localStorage.getItem('bootcamp_sidebar_width');
      if (savedSidebar) setSidebarWidth(Number(savedSidebar));

      const savedSplit = localStorage.getItem('bootcamp_workspace_split');
      if (savedSplit) setWorkspaceSplit(Number(savedSplit));

      const savedConsole = localStorage.getItem('bootcamp_console_height');
      if (savedConsole) setConsoleHeight(Number(savedConsole));
    } catch {
      // ignore localStorage errors in non-browser envs
    }
  }, []);

  const handleSidebarStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleWorkspaceStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingWorkspace.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleConsoleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingConsole.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const pos = getEventPosition(e);
      if (!pos) return;

      if (isDraggingSidebar.current) {
        const newWidth = calculateSidebarWidth(pos.clientX);
        setSidebarWidth(newWidth);
        try {
          localStorage.setItem('bootcamp_sidebar_width', String(newWidth));
        } catch {}
      } else if (isDraggingWorkspace.current) {
        const container = document.getElementById('workspace-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const percent = calculateWorkspaceSplit(pos.clientX, rect.left, rect.width);
          setWorkspaceSplit(percent);
          try {
            localStorage.setItem('bootcamp_workspace_split', String(percent));
          } catch {}
        }
      } else if (isDraggingConsole.current) {
        const rightPane = document.getElementById('right-pane-container');
        if (rightPane) {
          const rect = rightPane.getBoundingClientRect();
          const newHeight = calculateConsoleHeight(pos.clientY, rect.bottom, rect.height);
          setConsoleHeight(newHeight);
          try {
            localStorage.setItem('bootcamp_console_height', String(newHeight));
          } catch {}
        }
      }
    };

    const handleEnd = () => {
      if (isDraggingSidebar.current || isDraggingWorkspace.current || isDraggingConsole.current) {
        isDraggingSidebar.current = false;
        isDraggingWorkspace.current = false;
        isDraggingConsole.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  return {
    sidebarWidth,
    workspaceSplit,
    consoleHeight,
    isDesktop,
    handleSidebarMouseDown: handleSidebarStart,
    handleSidebarTouchStart: handleSidebarStart,
    handleWorkspaceMouseDown: handleWorkspaceStart,
    handleWorkspaceTouchStart: handleWorkspaceStart,
    handleConsoleMouseDown: handleConsoleStart,
    handleConsoleTouchStart: handleConsoleStart,
  };
}
