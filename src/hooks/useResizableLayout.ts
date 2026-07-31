'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useResizableLayout() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [workspaceSplit, setWorkspaceSplit] = useState<number>(50); // percentage for left pane
  const [consoleHeight, setConsoleHeight] = useState<number>(220);

  const isDraggingSidebar = useRef(false);
  const isDraggingWorkspace = useRef(false);
  const isDraggingConsole = useRef(false);

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

  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleWorkspaceMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingWorkspace.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleConsoleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingConsole.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSidebar.current) {
        const newWidth = Math.min(Math.max(e.clientX, 180), 480);
        setSidebarWidth(newWidth);
        try {
          localStorage.setItem('bootcamp_sidebar_width', String(newWidth));
        } catch {}
      } else if (isDraggingWorkspace.current) {
        const container = document.getElementById('workspace-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const percent = Math.min(Math.max((offsetX / rect.width) * 100, 20), 80);
          setWorkspaceSplit(percent);
          try {
            localStorage.setItem('bootcamp_workspace_split', String(percent));
          } catch {}
        }
      } else if (isDraggingConsole.current) {
        const rightPane = document.getElementById('right-pane-container');
        if (rightPane) {
          const rect = rightPane.getBoundingClientRect();
          const newHeight = Math.min(Math.max(rect.bottom - e.clientY, 100), rect.height - 120);
          setConsoleHeight(newHeight);
          try {
            localStorage.setItem('bootcamp_console_height', String(newHeight));
          } catch {}
        }
      }
    };

    const handleMouseUp = () => {
      if (isDraggingSidebar.current || isDraggingWorkspace.current || isDraggingConsole.current) {
        isDraggingSidebar.current = false;
        isDraggingWorkspace.current = false;
        isDraggingConsole.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return {
    sidebarWidth,
    workspaceSplit,
    consoleHeight,
    handleSidebarMouseDown,
    handleWorkspaceMouseDown,
    handleConsoleMouseDown,
  };
}
