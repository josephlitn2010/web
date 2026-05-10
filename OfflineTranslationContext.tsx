import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// 修改處：將原本的 @/lib/ 改為 ./ 並補上副檔名
import { detectWebGPU, detectOPFS } from './webgpuDetector.ts';
import { checkModelExists, downloadModelToOPFS, type ModelDownloadProgress, MODELS } from './opfsModelManager.ts';
import { initializeLLM, switchToRealMode } from './mediapipeLLM.ts';

export interface OfflineTranslationContextType {
  webgpuSupported: boolean;
  opfsSupported: boolean;
  modelLoaded: boolean;
  translationMode: 'local' | 'manual';
  isDownloading: boolean;
  downloadProgress: ModelDownloadProgress | null;
  downloadError: string | null;
  downloadModel: () => Promise<void>;
  cancelDownload: () => void;
  switchTranslationMode: (mode: 'local' | 'manual') => void;
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
  
  // 使用 useRef 避免重新渲染時遺失
  const abortControllerRef = React.useRef<AbortController | null>(null);

  useEffect(() => {
    const initDetection = async () => {
      const gpuCapabilities = await detectWebGPU();
      setWebgpuSupported(gpuCapabilities.isSupported);
      setWebgpuMessage(gpuCapabilities.message);

      if (!gpuCapabilities.isSupported) {
        setTranslationMode('manual');
        return;
      }

      const opfsAvailable = await detectOPFS();
      setOpfsSupported(opfsAvailable);

      const modelExists = await checkModelExists('gemma-4-E2B-it-web.task');
      if (modelExists) {
        try {
          const initialized = await initializeLLM({
            modelPath: 'gemma-4-E2B-it-web.task'
          });
          if (initialized) {
            switchToRealMode();
            setModelLoaded(true);
            setStatusMessage('✅ 本地模型已加載');
          }
        } catch (error) {
          console.error('❌ 初始化失敗:', error);
          setStatusMessage('⚠️ 模型加載失敗，請重新下載');
        }
      }
    };
    initDetection();
  }, []);

  const downloadModel = async () => {
    if (!webgpuSupported || !opfsSupported) {
      setDownloadError('❌ 設備不支援所需技術');
      return;
    }

    const confirmed = window.confirm('確認要下載 2.5 GB 的模型嗎？');
    if (!confirmed) return;

    setIsDownloading(true);
    setDownloadError(null);
    setStatusMessage('⏳ 正在下載模型...');
    
    abortControllerRef.current = new AbortController();

    try {
      const modelInfo = MODELS.GEMMA_4_E2B;
      await downloadModelToOPFS(
        'gemma-4-E2B-it-web.task',
        modelInfo.url,
        (progress) => {
          setDownloadProgress(progress);
          setStatusMessage(`⏳ 下載中... ${progress.percentage}%`);
        },
        abortControllerRef.current.signal
      );

      const initialized = await initializeLLM({
        modelPath: 'gemma-4-E2B-it-web.task'
      });

      if (initialized) {
        switchToRealMode();
        setModelLoaded(true);
        setStatusMessage('✅ 本地模型已成功加載');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setDownloadError('⚠️ 下載已取消');
      } else {
        setDownloadError(`❌ 下載失敗：${error.message}`);
      }
    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  };

  const cancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const switchTranslationMode = (mode: 'local' | 'manual') => {
    if (mode === 'local' && !modelLoaded) {
      setDownloadError('❌ 本地模型未加載');
      return;
    }
    setTranslationMode(mode);
  };

  const value = {
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
  if (!context) throw new Error('Provider missing');
  return context;
}
