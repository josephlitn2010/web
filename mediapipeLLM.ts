import { FilesetResolver, LlmInference } from '@mediapipe/tasks-genai';
import { loadModelFromOPFS } from './opfsModelManager';

/**
 * 翻譯結果接口
 */
export interface TranslationResult {
  success: boolean;
  translation?: string;
  examples?: string[];
  error?: string;
  mode: 'local' | 'fallback';
  inferenceTime?: number;
}

/**
 * LLM 初始化選項
 */
export interface LLMInitOptions {
  modelPath: string;
  useWebGPU?: boolean;
}

// 全局 LLM 實例
let llmInstance: LlmInference | null = null;
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;
let isRealMode = false; // 真實推理模式標誌

/**
 * 初始化 LLM - 強制使用真實推理
 */
export async function initializeLLM(options: LLMInitOptions): Promise<boolean> {
  if (isInitialized && isRealMode) {
    console.log('✅ LLM 已初始化，使用真實推理模式');
    return true;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // 檢查 WebGPU 支持
      if (!('gpu' in navigator)) {
        console.error('❌ WebGPU 不支持，無法初始化真實推理');
        isInitialized = true;
        isRealMode = false;
        return false;
      }

      console.log('📦 開始加載模型...');

      // 從 OPFS 加載模型
      let modelBuffer: ArrayBuffer | null = null;
      try {
        modelBuffer = await loadModelFromOPFS(options.modelPath);
        console.log('✅ 模型已從 OPFS 加載');
      } catch (error) {
        console.error('❌ 無法從 OPFS 加載模型:', error);
        isInitialized = true;
        isRealMode = false;
        return false;
      }

      if (!modelBuffer || modelBuffer.byteLength === 0) {
        console.error('❌ 模型 Buffer 為空或無效');
        isInitialized = true;
        isRealMode = false;
        return false;
      }

      console.log(`📊 模型大小: ${(modelBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

      // 初始化 MediaPipe LLM
      try {
        console.log('🔧 初始化 MediaPipe LLM...');
        
        // 獲取 Wasm 文件集
        const wasmFileset = await FilesetResolver.forGenAiTasks();
        console.log('✅ Wasm 文件集已加載');

        // 使用 createFromModelBuffer 初始化
        llmInstance = await LlmInference.createFromModelBuffer(
          wasmFileset,
          new Uint8Array(modelBuffer)
        );

        isRealMode = true;
        isInitialized = true;
        console.log('🚀 MediaPipe LLM 初始化成功！已切換到真實推理模式');
        return true;
      } catch (error) {
        console.error('❌ MediaPipe LLM 初始化失敗:', error);
        isInitialized = true;
        isRealMode = false;
        return false;
      }
    } catch (error) {
      console.error('❌ LLM 初始化過程出錯:', error);
      isInitialized = true;
      isRealMode = false;
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

/**
 * 翻譯單詞 - 主入口（強制真實推理）
 */
export async function translateWord(
  word: string,
  sourceLanguage: 'en' | 'zh' = 'en',
  targetLanguage: 'en' | 'zh' = sourceLanguage === 'en' ? 'zh' : 'en'
): Promise<TranslationResult> {
  if (!isInitialized) {
    return {
      success: false,
      error: 'LLM 未初始化，請先下載模型',
      mode: 'fallback'
    };
  }

  if (!isRealMode || !llmInstance) {
    return {
      success: false,
      error: '真實推理模式未啟用，請下載模型以啟用離線翻譯',
      mode: 'fallback'
    };
  }

  try {
    return await translateWordReal(word, sourceLanguage, targetLanguage);
  } catch (error) {
    console.error('❌ 翻譯失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '翻譯失敗',
      mode: 'fallback'
    };
  }
}

/**
 * 真實 MediaPipe 翻譯實現 - 使用專業 Prompt 格式
 */
async function translateWordReal(
  word: string,
  sourceLanguage: 'en' | 'zh',
  targetLanguage: 'en' | 'zh'
): Promise<TranslationResult> {
  if (!llmInstance) {
    throw new Error('LLM 實例未初始化');
  }

  const startTime = Date.now();

  try {
    const sourceLangName = sourceLanguage === 'en' ? 'English' : 'Chinese';
    const targetLangName = targetLanguage === 'en' ? 'English' : 'Chinese';

    // 使用專業 Prompt 格式（您提供的格式）
    const prompt = `你是專業的中英雙語翻譯助手。

將以下 ${sourceLangName} 翻譯成 ${targetLangName}，並提供 1-2 句自然的例句。

單字/句子：${word}

請只以下列格式輸出，不要加入任何解釋：
翻譯：xxx
例句1：xxx
例句2：xxx`;

    console.log(`🔄 發送翻譯請求到 Gemma 4 E2B:`, { word, sourceLanguage, targetLanguage });

    // 調用 MediaPipe LLM 推理
    const response = await llmInstance.generateResponse(prompt);
    const inferenceTime = Date.now() - startTime;

    console.log('📝 LLM 原始響應:', response);

    // 解析結果
    const parsedResult = parseTranslationResponse(response);

    if (!parsedResult.translation) {
      throw new Error('無法解析翻譯結果');
    }

    console.log(`✅ 翻譯成功 (${inferenceTime}ms):`, parsedResult);

    return {
      success: true,
      translation: parsedResult.translation,
      examples: parsedResult.examples,
      mode: 'local',
      inferenceTime
    };
  } catch (error) {
    console.error('❌ 真實推理失敗:', error);
    throw error;
  }
}

/**
 * 解析 LLM 響應 - 提取翻譯和例句
 */
function parseTranslationResponse(response: string): {
  translation: string;
  examples: string[];
} {
  const lines = response.trim().split('\n').map(line => line.trim()).filter(line => line);

  let translation = '';
  const examples: string[] = [];

  for (const line of lines) {
    if (line.startsWith('翻譯：')) {
      translation = line.replace('翻譯：', '').trim();
    } else if (line.startsWith('例句1：')) {
      const example = line.replace('例句1：', '').trim();
      if (example) examples.push(example);
    } else if (line.startsWith('例句2：')) {
      const example = line.replace('例句2：', '').trim();
      if (example) examples.push(example);
    } else if (line.startsWith('例句')) {
      // 處理其他格式的例句
      const example = line.replace(/例句\d+：/, '').trim();
      if (example && !examples.includes(example)) {
        examples.push(example);
      }
    }
  }

  // 如果沒有找到翻譯，使用第一行
  if (!translation && lines.length > 0) {
    translation = lines[0];
  }

  return { translation, examples };
}

/**
 * 翻譯短例句 - 強制真實推理
 */
export async function translateSentence(
  sentence: string,
  sourceLanguage: 'en' | 'zh' = 'en',
  targetLanguage: 'en' | 'zh' = sourceLanguage === 'en' ? 'zh' : 'en'
): Promise<TranslationResult> {
  if (!isInitialized) {
    return {
      success: false,
      error: 'LLM 未初始化',
      mode: 'fallback'
    };
  }

  if (!isRealMode || !llmInstance) {
    return {
      success: false,
      error: '真實推理模式未啟用',
      mode: 'fallback'
    };
  }

  try {
    return await translateSentenceReal(sentence, sourceLanguage, targetLanguage);
  } catch (error) {
    console.error('❌ 例句翻譯失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '翻譯失敗',
      mode: 'fallback'
    };
  }
}

/**
 * 真實例句翻譯
 */
async function translateSentenceReal(
  sentence: string,
  sourceLanguage: 'en' | 'zh',
  targetLanguage: 'en' | 'zh'
): Promise<TranslationResult> {
  if (!llmInstance) {
    throw new Error('LLM 實例未初始化');
  }

  const startTime = Date.now();

  try {
    const sourceLangName = sourceLanguage === 'en' ? 'English' : 'Chinese';
    const targetLangName = targetLanguage === 'en' ? 'English' : 'Chinese';

    const prompt = `你是專業的中英雙語翻譯助手。

將以下 ${sourceLangName} 句子翻譯成 ${targetLangName}。

句子：${sentence}

請只輸出翻譯結果，不要加入任何解釋。`;

    const response = await llmInstance.generateResponse(prompt);
    const inferenceTime = Date.now() - startTime;

    return {
      success: true,
      translation: response.trim(),
      mode: 'local',
      inferenceTime
    };
  } catch (error) {
    console.error('❌ 例句翻譯失敗:', error);
    throw error;
  }
}

/**
 * 獲取當前模式
 */
export function getCurrentMode(): 'local' | 'fallback' {
  return isRealMode ? 'local' : 'fallback';
}

/**
 * 檢查 LLM 是否已初始化
 */
export function isLLMInitialized(): boolean {
  return isInitialized && isRealMode;
}

/**
 * 檢查是否在真實推理模式
 */
export function isRealModeActive(): boolean {
  return isRealMode && llmInstance !== null;
}

/**
 * 切換到真實模式（由 Context 調用）
 */
export function switchToRealMode(): void {
  if (isRealMode && llmInstance) {
    console.log('✅ 已切換到真實推理模式');
  }
}

/**
 * 獲取模型狀態信息
 */
export function getModelStatus(): {
  isInitialized: boolean;
  isRealMode: boolean;
  hasLLMInstance: boolean;
  statusText: string;
} {
  const status = {
    isInitialized,
    isRealMode,
    hasLLMInstance: llmInstance !== null,
    statusText: ''
  };

  if (isRealMode && llmInstance) {
    status.statusText = '✅ 已載入真實 Gemma 4 E2B - 完全離線推理';
  } else if (isInitialized) {
    status.statusText = '⭕ 等待下載真實模型';
  } else {
    status.statusText = '⭕ LLM 未初始化';
  }

  return status;
}
