import { VocabularyEntry, Category, addVocabulary, addCategory, getAllCategories } from './db';

// Sample linking words data with all required fields
export const SAMPLE_LINKING_WORDS: Array<Omit<VocabularyEntry, 'id' | 'createdAt' | 'reviewCount' | 'lastReviewedAt' | 'updatedAt'>> = [
  // Additive connectors
  { english: 'Furthermore', chinese: '此外；而且', exampleSentence: 'The project is cost-effective. Furthermore, it has environmental benefits.', category: 'Linking Words', tags: ['additive', 'formal'], mastery: 0 },
  { english: 'Moreover', chinese: '而且；此外', exampleSentence: 'The new policy is efficient. Moreover, it is easy to implement.', category: 'Linking Words', tags: ['additive', 'formal'], mastery: 0 },
  { english: 'In addition', chinese: '另外；此外', exampleSentence: 'The course covers theory. In addition, it includes practical training.', category: 'Linking Words', tags: ['additive'], mastery: 0 },
  { english: 'Additionally', chinese: '此外；而且', exampleSentence: 'The software is user-friendly. Additionally, it is very affordable.', category: 'Linking Words', tags: ['additive'], mastery: 0 },
  { english: 'Also', chinese: '也；同样', exampleSentence: 'The product is durable. Also, it comes with a warranty.', category: 'Linking Words', tags: ['additive'], mastery: 0 },

  // Contrast connectors
  { english: 'However', chinese: '然而；但是', exampleSentence: 'The plan is ambitious. However, it requires significant resources.', category: 'Linking Words', tags: ['contrast'], mastery: 0 },
  { english: 'Nevertheless', chinese: '然而；尽管如此', exampleSentence: 'The challenges are significant. Nevertheless, the team remains optimistic.', category: 'Linking Words', tags: ['contrast', 'formal'], mastery: 0 },
  { english: 'On the other hand', chinese: '另一方面；相反地', exampleSentence: 'Urban areas offer opportunities. On the other hand, they are crowded.', category: 'Linking Words', tags: ['contrast'], mastery: 0 },
  { english: 'In contrast', chinese: '相比之下；形成对比', exampleSentence: 'Traditional methods are slow. In contrast, modern technology is efficient.', category: 'Linking Words', tags: ['contrast'], mastery: 0 },
  { english: 'Conversely', chinese: '相反地；反之', exampleSentence: 'Some people prefer cities. Conversely, others prefer rural areas.', category: 'Linking Words', tags: ['contrast', 'formal'], mastery: 0 },

  // Cause and effect
  { english: 'Therefore', chinese: '因此；所以', exampleSentence: 'The demand is high. Therefore, prices have increased.', category: 'Linking Words', tags: ['cause-effect'], mastery: 0 },
  { english: 'Consequently', chinese: '因此；所以', exampleSentence: 'The factory closed. Consequently, many workers lost their jobs.', category: 'Linking Words', tags: ['cause-effect', 'formal'], mastery: 0 },
  { english: 'As a result', chinese: '结果；因此', exampleSentence: 'The government invested in education. As a result, literacy rates improved.', category: 'Linking Words', tags: ['cause-effect'], mastery: 0 },
  { english: 'Thus', chinese: '因此；所以', exampleSentence: 'The evidence is clear. Thus, the conclusion is justified.', category: 'Linking Words', tags: ['cause-effect', 'formal'], mastery: 0 },
  { english: 'Hence', chinese: '因此；所以', exampleSentence: 'The study was comprehensive. Hence, the findings are reliable.', category: 'Linking Words', tags: ['cause-effect', 'formal'], mastery: 0 },

  // Exemplification
  { english: 'For example', chinese: '例如；比如', exampleSentence: 'Many animals migrate. For example, birds fly south in winter.', category: 'Linking Words', tags: ['example'], mastery: 0 },
  { english: 'For instance', chinese: '例如；比如', exampleSentence: 'Some sports are dangerous. For instance, mountaineering requires skill.', category: 'Linking Words', tags: ['example'], mastery: 0 },
  { english: 'Such as', chinese: '例如；像', exampleSentence: 'Many fruits are healthy, such as apples and oranges.', category: 'Linking Words', tags: ['example'], mastery: 0 },
  { english: 'In particular', chinese: '特别是；尤其是', exampleSentence: 'The report is detailed. In particular, the financial analysis is thorough.', category: 'Linking Words', tags: ['example'], mastery: 0 },
  { english: 'Namely', chinese: '即；也就是说', exampleSentence: 'The main issue is clear, namely, insufficient funding.', category: 'Linking Words', tags: ['example', 'formal'], mastery: 0 },

  // Sequencing
  { english: 'First', chinese: '首先；第一', exampleSentence: 'First, prepare the ingredients. Then, mix them together.', category: 'Linking Words', tags: ['sequence'], mastery: 0 },
  { english: 'Secondly', chinese: '其次；第二', exampleSentence: 'The plan has advantages. Secondly, it is cost-effective.', category: 'Linking Words', tags: ['sequence'], mastery: 0 },
  { english: 'Finally', chinese: '最后；最终', exampleSentence: 'We analyzed the data. Finally, we reached a conclusion.', category: 'Linking Words', tags: ['sequence'], mastery: 0 },
  { english: 'Subsequently', chinese: '随后；之后', exampleSentence: 'The company was founded in 2000. Subsequently, it expanded globally.', category: 'Linking Words', tags: ['sequence', 'formal'], mastery: 0 },
  { english: 'Meanwhile', chinese: '同时；与此同时', exampleSentence: 'The team worked on the project. Meanwhile, others prepared the presentation.', category: 'Linking Words', tags: ['sequence'], mastery: 0 },

  // Summarizing
  { english: 'In summary', chinese: '总之；总结一下', exampleSentence: 'We discussed many points. In summary, the project is viable.', category: 'Linking Words', tags: ['summary'], mastery: 0 },
  { english: 'In conclusion', chinese: '总之；最后', exampleSentence: 'The evidence is compelling. In conclusion, the theory is valid.', category: 'Linking Words', tags: ['summary'], mastery: 0 },
  { english: 'To sum up', chinese: '总之；概括地说', exampleSentence: 'We covered many topics. To sum up, all are important.', category: 'Linking Words', tags: ['summary'], mastery: 0 },
  { english: 'Overall', chinese: '总的来说；总体上', exampleSentence: 'The results were mixed. Overall, the experiment was successful.', category: 'Linking Words', tags: ['summary'], mastery: 0 },
  { english: 'In general', chinese: '总的来说；一般来说', exampleSentence: 'People have different opinions. In general, most agree on this point.', category: 'Linking Words', tags: ['summary'], mastery: 0 },
];

/**
 * Initialize sample data with linking words category and vocabulary
 */
export async function initializeSampleData(): Promise<void> {
  try {
    // Check if sample data already exists
    const linkingWordsCategory = await (async () => {
      const db = (window as any).vocabDB;
      if (!db) return null;
      
      const tx = db.transaction('categories', 'readonly');
      const store = tx.objectStore('categories');
      return new Promise((resolve) => {
        const request = store.get('Linking Words');
        request.onsuccess = () => resolve(request.result || null);
      });
    })();

    if (linkingWordsCategory) {
      console.log('Sample data already exists');
      return;
    }

    // Add Linking Words category
    await addCategory('Linking Words', '#059669');

    // Add all sample vocabulary entries
    for (const word of SAMPLE_LINKING_WORDS) {
      await addVocabulary(word);
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize sample data:', error);
    throw error;
  }
}

/**
 * Check if sample data exists
 */
export async function hasSampleData(): Promise<boolean> {
  try {
    const allCategories = await getAllCategories();
    return allCategories.some(cat => cat.name === 'Linking Words');
  } catch (error) {
    console.error('Failed to check sample data:', error);
    return false;
  }
}
