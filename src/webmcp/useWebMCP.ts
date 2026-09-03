import { useEffect, useRef } from 'react';
import { ModelContextTool } from './types';
import { webMCPManager } from './manager';

export function useWebMCP(tool: ModelContextTool | null, dependencies: any[] = []) {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!tool) return;

    // Create AbortController for clean lifecycle management per WebMCP § 4.2.3
    const controller = new AbortController();
    abortControllerRef.current = controller;

    webMCPManager.registerTool(tool, { signal: controller.signal }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.error(`[useWebMCP] Error registering tool "${tool.name}":`, err);
      }
    });

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.name, ...dependencies]);
}
