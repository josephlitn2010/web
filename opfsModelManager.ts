import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import { ModelType, MODEL_CONFIGS } from './modelConfig';

export interface ModelDownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ModelInfo {
  name: string;
  size: number;
  url: string;
  checksum?: string;
}

export interface StoredModelInfo {
  modelId: ModelType;
  fileName: string;
  size: number;
  downloadedAt: number;
  checksum?: string;
}

/**
 * 獲取 OPFS 根目錄
 */
async function getOPFSRoot(): Promise<FileSystemDirectoryHandle> {
  const storage = (navigator as any).storage;
  if (!storage || !storage.getDirectory) {
    throw new Error('OPFS 不支援');
  }
  return storage.getDirectory();
}

/**
 * 獲取或建立模型目錄
 */
async function getModelDirectory(): Promise<FileSystemDirectoryHandle> {
  const root = await getOPFSRoot();
  try {
    return await root.getDirectoryHandle('models', { create: true });
  } catch (error) {
    throw new Error(`無法建立模型目錄：${error}`);
  }
}

/**
 * 檢查模型是否已存在
 */
export async function checkModelExists(modelName: string): Promise<boolean> {
  try {
    const modelDir = await getModelDirectory();
    const fileHandle = await modelDir.getFileHandle(modelName);
    const file = await fileHandle.getFile();
    return file.size > 0;
  } catch (error) {
    return false;
  }
}

/**
 * 下載模型到 OPFS（支持重試和詳細錯誤信息）
 */
export async function downloadModelToOPFS(
  modelName: string,
  url: string,
  onProgress?: (progress: ModelDownloadProgress) => void,
  signal?: AbortSignal,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<void> {
  try {
    console.log(`📥 開始下載模型: ${modelName} (嘗試 ${retryCount + 1}/${maxRetries + 1})`);
    
    const modelDir = await getModelDirectory();
    
    // 開始下載
    let response: Response;
    try {
      response = await fetch(url, { 
        signal,
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
    } catch (fetchError) {
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
        throw new Error('網路連接失敗或 CORS 錯誤。請檢查網路連接或嘗試使用代理。');
      }
      throw fetchError;
    }

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(`訪問被拒絕 (403)。可能需要使用代理或 VPN。`);
      } else if (response.status === 404) {
        throw new Error(`模型不存在 (404)。請檢查下載連結是否正確。`);
      } else if (response.status === 429) {
        throw new Error(`請求過於頻繁 (429)。請稍後重試。`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    console.log(`📊 模型大小: ${total > 0 ? (total / 1024 / 1024 / 1024).toFixed(2) + ' GB' : '未知'}`);

    // 建立文件
    const fileHandle = await modelDir.getFileHandle(modelName, { create: true });
    const writable = await fileHandle.createWritable();

    try {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('無法讀取回應流');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          try {
            await writable.write(value);
          } catch (writeError) {
            if (writeError instanceof Error && writeError.message.includes('QuotaExceededError')) {
              throw new Error('儲存空間不足。請清理設備空間後重試。');
            }
            throw writeError;
          }
          
          loaded += value.length;
          
          if (onProgress) {
            onProgress({
              loaded,
              total,
              percentage: total > 0 ? Math.round((loaded / total) * 100) : 0
            });
          }
        }
      }

      await writable.close();
      console.log(`✅ 模型下載完成: ${modelName}`);
    } catch (error) {
      await writable.close();
      // 清理失敗的文件
      try {
        await modelDir.removeEntry(modelName);
      } catch (e) {
        console.warn('無法清理失敗的文件');
      }
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    console.error(`❌ 模型下載失敗: ${errorMessage}`);
    
    // 自動重試
    if (retryCount < maxRetries) {
      console.log(`⏳ ${retryCount + 1} 秒後進行第 ${retryCount + 2} 次嘗試...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return downloadModelToOPFS(modelName, url, onProgress, signal, retryCount + 1, maxRetries);
    }
    
    throw new Error(`模型下載失敗（已重試 ${maxRetries} 次）：${errorMessage}`);
  }
}

/**
 * 從 OPFS 讀取模型
 */
export async function loadModelFromOPFS(modelName: string): Promise<ArrayBuffer> {
  try {
    const modelDir = await getModelDirectory();
    const fileHandle = await modelDir.getFileHandle(modelName);
    const file = await fileHandle.getFile();
    const buffer = await file.arrayBuffer();
    console.log(`✅ 模型已從 OPFS 加載: ${modelName} (${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
    return buffer;
  } catch (error) {
    throw new Error(`無法讀取模型：${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 刪除模型
 */
export async function deleteModel(modelName: string): Promise<void> {
  try {
    const modelDir = await getModelDirectory();
    await modelDir.removeEntry(modelName);
    console.log(`🗑️ 模型已刪除: ${modelName}`);
  } catch (error) {
    throw new Error(`無法刪除模型：${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 獲取模型大小
 */
export async function getModelSize(modelName: string): Promise<number> {
  try {
    const modelDir = await getModelDirectory();
    const fileHandle = await modelDir.getFileHandle(modelName);
    const file = await fileHandle.getFile();
    return file.size;
  } catch (error) {
    return 0;
  }
}

/**
 * 獲取模型信息
 */
export function getModelInfo(modelKey: keyof typeof MODELS): ModelInfo {
  return MODELS[modelKey];
}

export { MODELS };
