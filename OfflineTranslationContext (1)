import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectWebGPU, detectOPFS } from '@/lib/webgpuDetector';
import { checkModelExists, downloadModelToOPFS, ModelDownloadProgress, MODELS } from '@/lib/opfsModelManager';
import { initializeLLM, isLLMInitialized, switchToRealMode } from '@/lib/mediapipeLLM';

export interface OfflineTranslationContextType {
  // 功能狀態
  webgpuSupported: boolean;
  opfsSupported: boolean;
  modelLoaded: boolean;
  translationMode: 'local' | 'manual';
  
  // 下載狀態
  isDownloading: boolean;
  downloadProgress: ModelDownloadProgress | null;
  downloadError: string | null;
  
  // 操作
  downloadModel: () => Promise<void>;
  cancelDownload: () => void;
  switchTranslationMode: (mode: 'local' | 'manual') => void;
  
  // 信息
  statusMessage: string;
  webgpuMessage: string;
}

const OfflineTranslationContext = createContext<OfflineTranslationContextType | undefined>(undefined);

export function OfflineTranslationProvider({ children }: { children: ReactNode }) {
  const [webgpuSupported, setWebgpuSupported] = useState(false);
  const [opfsSupported, setOpfsSupported] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [translationMode, setTranslationMode] = useState<'local' | 'manual'>('local');
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<ModelDownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  
  const [statusMessage, setStatusMessage] = useState('');
  const [webgpuMessage, setWebgpuMessage] = useState('');
  
  let abortController: AbortController | null = null;

  // 初始化檢測
  useEffect(() => {
    (async () => {
      // 檢測 WebGPU
      const gpuCapabilities = await detectWebGPU();
      setWebgpuSupported(gpuCapabilities.isSupported);
      setWebgpuMessage(gpuCapabilities.message);

      if (!gpuCapabilities.isSupported) {
        setTranslationMode('manual');
        return;
      }

      // 檢測 OPFS
      const opfsAvailable = await detectOPFS();
      setOpfsSupported(opfsAvailable);

      // 檢查模型是否已存在
      const modelExists = await checkModelExists('gemma-4-E2B-it-web.task');
      if (modelExists) {
        try {
          console.log('🔍 檢測到已存在的模型，開始初始化...');
          // 自動初始化已存在的模型
          const initialized = await initializeLLM({
            modelPath: 'gemma-4-E2B-it-web.task'
          });
          if (initialized) {
            switchToRealMode();
            setModelLoaded(true);
            setStatusMessage('✅ 本地模型已加載（真實推理模式）');
            console.log('✅ 模型已自動加載並初始化');
          }
        } catch (error) {
          console.error('❌ 模型初始化失敗:', error);
          setStatusMessage('⚠️ 模型加載失敗，請重新下載');
        }
      }
    })();
  }, []);

  // 下載模型
  const downloadModel = async () => {
    if (!webgpuSupported) {
      setDownloadError('❌ 你的設備不支援 WebGPU');
      return;
    }

    if (!opfsSupported) {
      setDownloadError('❌ 你的瀏覽器不支援 OPFS');
      return;
    }

    // 顯示下載前警告
    const confirmed = window.confirm(
      '⚠️ 模型下載警告\n\n' +
      '• 模型大小：約 2.5 GB\n' +
      '• 下載時間：取決於網速（可能需要 5-30 分鐘）\n' +
      '• 建議：使用 Wi-Fi 並確保有足夠儲存空間\n' +
      '• 下載過程中請勿關閉此頁面\n\n' +
      '確認要繼續下載嗎？'
    );

    if (!confirmed) {
      setDownloadError('⚠️ 用戶取消下載');
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress(null);
    setStatusMessage('⏳ 正在下載 Gemma 4 E2B 模型...');
    abortController = new AbortController();

    try {
      const modelInfo = MODELS.GEMMA_4_E2B;
      
      console.log('📥 開始下載模型...');
      
      await downloadModelToOPFS(
        'gemma-4-E2B-it-web.task',
        modelInfo.url,
        (progress) => {
          setDownloadProgress(progress);
          const mbLoaded = (progress.loaded / 1024 / 1024).toFixed(1);
          const mbTotal = (progress.total / 1024 / 1024).toFixed(1);
          setStatusMessage(`⏳ 下載中... ${progress.percentage}% (${mbLoaded}MB / ${mbTotal}MB)`);
        },
        abortController.signal
      );

      // 下載完成，開始初始化
      setStatusMessage('⏳ 正在初始化 Gemma 4 E2B 模型...（約 5-15 秒）');
      console.log('📦 下載完成，開始初始化模型...');

      // 初始化 LLM
      const initialized = await initializeLLM({
        modelPath: 'gemma-4-E2B-it-web.task'
      });

      if (initialized) {
        // 切換到真實推理模式
        switchToRealMode();
        setModelLoaded(true);
        setStatusMessage('✅ 本地模型已成功加載（真實推理模式）');
        setDownloadProgress(null);
        console.log('🚀 模型下載完成，已切換到真實推理模式');
      } else {
        setDownloadError('❌ 模型初始化失敗。請檢查瀏覽器是否支援 WebGPU。');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setDownloadError('⚠️ 下載已取消');
        setStatusMessage('下載已取消');
      } else {
        const errorMsg = error instanceof Error ? error.message : '未知錯誤';
        console.error('❌ 下載失敗:', errorMsg);
        setDownloadError(`❌ 下載失敗：${errorMsg}`);
        setStatusMessage('下載失敗，請重試');
      }
    } finally {
      setIsDownloading(false);
      abortController = null;
    }
  };

  // 取消下載
  const cancelDownload = () => {
    if (abortController) {
      abortController.abort();
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  // 切換翻譯模式
  const switchTranslationMode = (mode: 'local' | 'manual') => {
    if (mode === 'local' && !modelLoaded) {
      setDownloadError('❌ 本地模型未加載，請先下載');
      return;
    }
    setTranslationMode(mode);
  };

  const value: OfflineTranslationContextType = {
    webgpuSupported,
    opfsSupported,
    modelLoaded,
    translationMode,
    isDownloading,
    downloadProgress,
    downloadError,
    downloadModel,
    cancelDownload,
    switchTranslationMode,
    statusMessage,
    webgpuMessage
  };

  return (
    <OfflineTranslationContext.Provider value={value}>
      {children}
    </OfflineTranslationContext.Provider>
  );
}

export function useOfflineTranslation() {
  const context = useContext(OfflineTranslationContext);
  if (!context) {
    throw new Error('useOfflineTranslation 必須在 OfflineTranslationProvider 內使用');
  }
  return context;
}
