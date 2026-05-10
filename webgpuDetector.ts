/**
 * WebGPU 檢測和相關工具函數
 */

// WebGPU 類型定義
declare global {
  interface Navigator {
    gpu?: GPU;
  }
  interface GPU {
    requestAdapter(): Promise<GPUAdapter | null>;
  }
  interface GPUAdapter {
    requestDevice(): Promise<GPUDevice>;
  }
  interface GPUDevice {}
}

export interface WebGPUCapabilities {
  isSupported: boolean;
  isChrome: boolean;
  message: string;
}

/**
 * 檢測 WebGPU 支援情況
 */
export async function detectWebGPU(): Promise<WebGPUCapabilities> {
  const isChrome = /Chrome|Chromium|Edge/.test(navigator.userAgent);
  
  if (!isChrome) {
    return {
      isSupported: false,
      isChrome: false,
      message: '請使用 Chrome、Edge 或 Chromium 瀏覽器以啟用完整的離線翻譯功能。'
    };
  }

  // 檢測 WebGPU API
  const gpu = (navigator as any).gpu;
  if (!gpu) {
    return {
      isSupported: false,
      isChrome: true,
      message: '你的瀏覽器不支援 WebGPU。請更新到最新版本的 Chrome 或 Edge（113+）。'
    };
  }

  try {
    // 嘗試請求 GPU 適配器
    const gpu = (navigator as any).gpu;
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return {
        isSupported: false,
        isChrome: true,
        message: '你的設備不支援 WebGPU。請確保你的 GPU 驅動程式已更新。'
      };
    }

    return {
      isSupported: true,
      isChrome: true,
      message: 'WebGPU 已支援！即將啟用離線翻譯功能。'
    };
  } catch (error) {
    return {
      isSupported: false,
      isChrome: true,
      message: `WebGPU 檢測失敗：${error instanceof Error ? error.message : '未知錯誤'}`
    };
  }
}

/**
 * 檢測 OPFS 支援情況
 */
export async function detectOPFS(): Promise<boolean> {
  try {
    const storage = (navigator as any).storage;
    if (!storage || !('getDirectory' in storage)) {
      return false;
    }
    
    const root = await storage.getDirectory();
    return !!root;
  } catch (error) {
    console.warn('OPFS 不支援：', error);
    return false;
  }
}

/**
 * 檢測 IndexedDB 支援情況
 */
export function detectIndexedDB(): boolean {
  return !!(window as any).indexedDB;
}
