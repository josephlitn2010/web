import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { useOfflineTranslation } from '@/contexts/OfflineTranslationContext';
import { translateWord, getCurrentMode, isRealModeActive, getModelStatus } from '@/lib/mediapipeLLM';
type ModelStatusType = ReturnType<typeof getModelStatus>;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader,
  Zap,
  Clock,
  Plus,
  Copy,
  Check
} from 'lucide-react';
const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${title}: ${description}`);
};

export function OfflineTranslationPanel() {
  const context = useOfflineTranslation();
  const [modelStatus, setModelStatus] = useState(getModelStatus());

  // 定期更新模型狀態
  useEffect(() => {
    const interval = setInterval(() => {
      setModelStatus(getModelStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // 翻譯狀態
  const [sourceLanguage, setSourceLanguage] = useState<'en' | 'zh'>('en');
  const [inputWord, setInputWord] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<any>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [copiedExample, setCopiedExample] = useState<number | null>(null);

  // 處理翻譯
  const handleTranslate = useCallback(async () => {
    if (!inputWord.trim()) {
      setTranslationError('請輸入要翻譯的詞彙');
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);
    setTranslationResult(null);

    try {
      const targetLanguage = sourceLanguage === 'en' ? 'zh' : 'en';
      const result = await translateWord(inputWord, sourceLanguage, targetLanguage);

      if (result.success) {
        setTranslationResult(result);
      } else {
        setTranslationError(result.error || '翻譯失敗');
      }
    } catch (error) {
      setTranslationError(error instanceof Error ? error.message : '翻譯過程出錯');
    } finally {
      setIsTranslating(false);
    }
  }, [inputWord, sourceLanguage]);

  // 鍵盤快捷鍵
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isTranslating) {
      handleTranslate();
    }
  };

  // 下載模型
  const handleDownloadModel = async () => {
    try {
      await context.downloadModel();
    } catch (error) {
      console.error('下載模型失敗:', error);
    }
  };

  // 添加詞彙到詞彙本
  const handleAddWord = async () => {
    if (!translationResult || !translationResult.translation) {
      showToast('錯誤', '沒有翻譯結果可添加', 'error');
      alert('沒有翻譯結果可添加');
      return;
    }

    setIsAddingWord(true);
    try {
      // 構建詞彙對象
      const newWord = {
        word: inputWord,
        translation: translationResult.translation,
        sourceLanguage,
        targetLanguage: sourceLanguage === 'en' ? 'zh' : 'en',
        examples: translationResult.examples || [],
        mode: translationResult.mode,
        inferenceTime: translationResult.inferenceTime,
        createdAt: new Date().toISOString()
      };

      // 從 localStorage 獲取現有詞彙
      const existingVocab = JSON.parse(localStorage.getItem('vocab_library') || '[]');
      
      // 檢查是否已存在
      const isDuplicate = existingVocab.some((v: any) => 
        v.word.toLowerCase() === inputWord.toLowerCase() && 
        v.sourceLanguage === sourceLanguage
      );

      if (isDuplicate) {
      showToast('提示', '該詞彙已存在於詞彙本');
      alert('該詞彙已存在於詞彙本');
        setIsAddingWord(false);
        return;
      }

      // 添加新詞彙
      existingVocab.push(newWord);
      localStorage.setItem('vocab_library', JSON.stringify(existingVocab));

      showToast('✅ 成功', `「${inputWord}」已添加到詞彙本`);
      alert(`「${inputWord}」已添加到詞彙本`);

      // 清空輸入框和結果
      setInputWord('');
      setTranslationResult(null);
      setTranslationError(null);

    } catch (error) {
      console.error('添加詞彙失敗:', error);
      showToast('錯誤', error instanceof Error ? error.message : '添加失敗', 'error');
      alert('添加失敗：' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setIsAddingWord(false);
    }
  };

  // 複製例句
  const handleCopyExample = (example: string, index: number) => {
    navigator.clipboard.writeText(example);
    setCopiedExample(index);
    setTimeout(() => setCopiedExample(null), 2000);
    showToast('✅ 已複製', '例句已複製到剪貼板');
    console.log('例句已複製到剪貼板');
  };

  // 渲染 WebGPU 狀態
  const renderWebGPUStatus = () => {
    if (!context.webgpuSupported) {
      return (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-600">WebGPU 不支援</p>
            <p className="text-sm text-amber-600/80 mt-1">{context.webgpuMessage}</p>
            <p className="text-sm text-amber-600/80 mt-2">
              💡 提示：請使用最新版本的 Chrome、Edge 或 Opera 瀏覽器
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-600">WebGPU 已支援</p>
          <p className="text-sm text-green-600/80 mt-1">你的設備支援本地離線翻譯</p>
        </div>
      </div>
    );
  };

  // 渲染模型狀態
  const renderModelStatus = () => {
    if (context.modelLoaded) {
      const mode = getCurrentMode();
      const isReal = isRealModeActive();
      
      return (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-600">Gemma 4 E2B 模型已加載</p>
            <p className="text-sm text-green-600/80 mt-1">
              {isReal ? '🚀 模式：真實推理 - 完全離線' : '⭕ 模式：等待初始化'}
            </p>
            {!isReal && (
              <p className="text-xs text-amber-600 mt-2">
                ℹ️ 模型初始化中...下載完成後將自動切換到離線推理。
              </p>
            )}
          </div>
        </div>
      );
    }

    if (context.isDownloading) {
      return (
        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Loader className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
          <div className="flex-1">
            <p className="font-semibold text-blue-600">正在下載模型...</p>
            {context.downloadProgress && (
              <>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${context.downloadProgress.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-blue-600/80 mt-2">
                  {context.downloadProgress.percentage}% 
                  ({Math.round(context.downloadProgress.loaded / 1024 / 1024)}MB / {Math.round(context.downloadProgress.total / 1024 / 1024)}MB)
                </p>
                {context.downloadProgress.loaded > 0 && (
                  <p className="text-xs text-blue-600/60 mt-1">
                    ⏱️ 預計時間：{Math.ceil((context.downloadProgress.total - context.downloadProgress.loaded) / (context.downloadProgress.loaded / (Date.now() / 1000)) / 60)}分鐘
                  </p>
                )}
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={context.cancelDownload}
              className="mt-3"
            >
              取消下載
            </Button>
          </div>
        </div>
      );
    }

    if (context.downloadError) {
      return (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-destructive">下載出錯</p>
            <p className="text-sm text-destructive/80 mt-1">{context.downloadError}</p>
            <Button
              size="sm"
              onClick={handleDownloadModel}
              className="mt-3"
            >
              重試下載
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-amber-600">Gemma 4 E2B 模型未加載</p>
          <p className="text-sm text-amber-600/80 mt-1">
            下載官方優化版本（~2.5GB）以啟用本地離線翻譯
          </p>
          <p className="text-xs text-amber-600/70 mt-2">
            ℹ️ 下載後會存儲到瀏覽器本地存儲，下次自動加載
          </p>
          <a
            href="https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/blob/main/gemma-4-E2B-it-web.task"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-600 underline mt-2 inline-block hover:text-amber-700"
          >
            📖 查看 Hugging Face 連結
          </a>
          <Button
            onClick={handleDownloadModel}
            disabled={!context.webgpuSupported || !context.opfsSupported}
            className="mt-3 w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            下載模型
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 模型狀態指示器 */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            modelStatus.isRealMode ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <span className="text-sm font-semibold text-gray-700">
            {modelStatus.statusText}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {modelStatus.isRealMode ? '🚀 完全離線' : '⭕ 等待模型'}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            本地離線翻譯
          </CardTitle>
          <CardDescription>
            使用 Gemma 4 E2B 模型進行完全離線翻譯，無需網絡連接
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WebGPU 狀態 */}
          {renderWebGPUStatus()}

          {/* 模型狀態 */}
          <div className="mt-4">
            {renderModelStatus()}
          </div>

          {/* 翻譯界面 */}
          {context.modelLoaded && (
            <div className="mt-6 space-y-4 p-4 bg-background/50 rounded-lg border">
              {/* 語言選擇 */}
              <div>
                <label className="block text-sm font-medium mb-2">翻譯方向</label>
                <div className="flex gap-2">
                  <Button
                    variant={sourceLanguage === 'en' ? 'default' : 'outline'}
                    onClick={() => {
                      setSourceLanguage('en');
                      setTranslationResult(null);
                      setTranslationError(null);
                    }}
                    size="sm"
                    className="flex-1"
                  >
                    英文 → 中文
                  </Button>
                  <Button
                    variant={sourceLanguage === 'zh' ? 'default' : 'outline'}
                    onClick={() => {
                      setSourceLanguage('zh');
                      setTranslationResult(null);
                      setTranslationError(null);
                    }}
                    size="sm"
                    className="flex-1"
                  >
                    中文 → 英文
                  </Button>
                </div>
              </div>

              {/* 輸入框 */}
              <div>
                <label className="block text-sm font-medium mb-2">輸入詞彙</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={sourceLanguage === 'en' ? '輸入英文詞彙...' : '輸入中文詞彙...'}
                    disabled={isTranslating}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                  />
                  <Button
                    onClick={handleTranslate}
                    disabled={isTranslating || !inputWord.trim()}
                    size="sm"
                  >
              {isTranslating ? (
                <>
                  <Loader className="w-4 h-4 mr-1 animate-spin" />
                  {isRealModeActive() ? 'Gemma 4 推理中' : '翻譯中'}
                </>
              ) : (
                '翻譯'
              )}
                  </Button>
                </div>
              </div>

              {/* 錯誤信息 */}
              {translationError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{translationError}</span>
                </div>
              )}

              {/* 翻譯結果 */}
              {translationResult && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-green-600">翻譯結果</p>
                    <p className="text-lg font-bold mt-1 text-foreground">
                      {translationResult.translation}
                    </p>
                  </div>

                  {translationResult.examples && translationResult.examples.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-green-600">例句</p>
                      <ul className="mt-2 space-y-2">
                        {translationResult.examples.map((example: string, idx: number) => (
                          <li key={idx} className="text-sm text-foreground/80 flex items-start justify-between gap-2 p-2 bg-background/50 rounded">
                            <span className="flex-1">
                              <span className="text-green-600 font-semibold">•</span> {example}
                            </span>
                            <button
                              onClick={() => handleCopyExample(example, idx)}
                              className="flex-shrink-0 p-1 hover:bg-background rounded transition-colors"
                              title="複製例句"
                            >
                              {copiedExample === idx ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-green-600/60 mt-3 pt-3 border-t border-green-500/20">
                    <span>
                      {translationResult.mode === 'local' ? '🔒 本地離線' : '⚠️ 降級模式'}
                    </span>
                    {translationResult.inferenceTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {translationResult.inferenceTime}ms
                      </span>
                    )}
                  </div>

                  {/* 添加到詞彙本按鈕 */}
                  <Button
                    onClick={handleAddWord}
                    disabled={isAddingWord}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700"
                  >
                    {isAddingWord ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        添加中...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        加入詞彙本
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Loading 狀態提示 */}
              {isTranslating && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-600 flex gap-2">
                  <Loader className="w-4 h-4 flex-shrink-0 mt-0.5 animate-spin" />
                  <span>
                    {isRealModeActive() ? '🚀 Gemma 4 E2B 正在推理...' : '⭕ 等待模型初始化...'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 未加載模型時的提示 */}
          {!context.modelLoaded && !context.isDownloading && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                下載模型後即可開始使用離線翻譯功能
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
