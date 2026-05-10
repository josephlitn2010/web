/**
 * 模型配置 - 支持多個 LLM 模型
 */

export type ModelType = 'gemma-4-e2b' | 'gemma-2-2b' | 'phi-3' | 'gemma-2b';

export interface ModelConfig {
  id: ModelType;
  name: string;
  description: string;
  size: string; // 模型大小（MB）
  downloadUrl: string;
  fileName: string;
  estimatedDownloadTime: string; // 預計下載時間
  estimatedInitTime: string; // 預計初始化時間
  inferenceSpeed: 'fast' | 'medium' | 'slow'; // 推理速度
  quality: 'high' | 'medium' | 'low'; // 翻譯質量
  recommended?: boolean; // 是否推薦
}

export const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
  'gemma-4-e2b': {
    id: 'gemma-4-e2b',
    name: 'Gemma 4 E2B (推薦)',
    description: '最新最強的開源模型，翻譯質量最高，支持複雜句子',
    size: '2.5 GB',
    downloadUrl: 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task',
    fileName: 'gemma-4-E2B-it-web.task',
    estimatedDownloadTime: '5-30 分鐘',
    estimatedInitTime: '5-15 秒',
    inferenceSpeed: 'medium',
    quality: 'high',
    recommended: true,
  },
  'gemma-2-2b': {
    id: 'gemma-2-2b',
    name: 'Gemma 2 2B Web',
    description: '輕量級模型，下載快速，適合低端設備',
    size: '1.2 GB',
    downloadUrl: 'https://huggingface.co/litert-community/gemma-2-2b-it-litert-lm/resolve/main/gemma-2-2b-it-web.task',
    fileName: 'gemma-2-2b-it-web.task',
    estimatedDownloadTime: '3-15 分鐘',
    estimatedInitTime: '3-8 秒',
    inferenceSpeed: 'fast',
    quality: 'medium',
  },
  'phi-3': {
    id: 'phi-3',
    name: 'Phi-3 Mini',
    description: 'Microsoft 開發，小巧高效，推理速度快',
    size: '1.5 GB',
    downloadUrl: 'https://huggingface.co/litert-community/phi-3-mini-it-litert-lm/resolve/main/phi-3-mini-it-web.task',
    fileName: 'phi-3-mini-it-web.task',
    estimatedDownloadTime: '3-20 分鐘',
    estimatedInitTime: '3-10 秒',
    inferenceSpeed: 'fast',
    quality: 'medium',
  },
  'gemma-2b': {
    id: 'gemma-2b',
    name: 'Gemma 2B',
    description: '最輕量級，適合極低端設備，翻譯質量一般',
    size: '0.8 GB',
    downloadUrl: 'https://huggingface.co/litert-community/gemma-2b-it-litert-lm/resolve/main/gemma-2b-it-web.task',
    fileName: 'gemma-2b-it-web.task',
    estimatedDownloadTime: '2-10 分鐘',
    estimatedInitTime: '2-5 秒',
    inferenceSpeed: 'fast',
    quality: 'low',
  },
};

export const DEFAULT_MODEL: ModelType = 'gemma-4-e2b';

/**
 * 根據模型 ID 獲取配置
 */
export function getModelConfig(modelId: ModelType): ModelConfig {
  return MODEL_CONFIGS[modelId];
}

/**
 * 獲取所有模型配置列表
 */
export function getAllModels(): ModelConfig[] {
  return Object.values(MODEL_CONFIGS);
}

/**
 * 獲取推薦模型
 */
export function getRecommendedModel(): ModelConfig {
  const recommended = Object.values(MODEL_CONFIGS).find(m => m.recommended);
  return recommended || MODEL_CONFIGS[DEFAULT_MODEL];
}
