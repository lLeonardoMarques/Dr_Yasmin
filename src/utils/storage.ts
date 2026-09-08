// src/utils/storage.ts
// Armazenamento local seguro com prevenção contra QuotaExceededError e limpeza de caches pesados

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn(`[SafeStorage] Erro ao ler ${key}:`, err);
      return null;
    }
  },

  getParsed: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (err) {
      console.warn(`[SafeStorage] Erro ao parsear JSON de ${key}:`, err);
      return fallback;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      console.warn(`[SafeStorage] QuotaExceededError ou falha ao salvar ${key}. Limpando caches legados...`, err);
      try {
        // Evict duplicate or heavy historical cache keys to restore browser quota
        const legacyKeys = [
          'yasmin_anamneses',
          'yasmin_questions',
          'yasmin_appointments',
          'yasmin_evolutions',
          'toque_prod_evolutions',
          'toque_prod_anamneses',
          'toque_prod_patients'
        ];

        for (const k of legacyKeys) {
          if (k !== key) {
            try {
              localStorage.removeItem(k);
            } catch {}
          }
        }

        // Try writing again after eviction
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error(`[SafeStorage] Impossível persistir ${key} no localStorage:`, retryErr);
        return false;
      }
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[SafeStorage] Erro ao remover ${key}:`, err);
    }
  },

  setJson: (key: string, data: any): boolean => {
    try {
      const serialized = JSON.stringify(data);
      return safeStorage.setItem(key, serialized);
    } catch (err) {
      console.warn(`[SafeStorage] Falha ao serializar para ${key}:`, err);
      return false;
    }
  },

  // Limpa chaves duplicadas antigas que sobrecarregam o navegador
  cleanupRedundantCaches: (): void => {
    const redundant = [
      'yasmin_anamneses',
      'yasmin_questions',
      'yasmin_appointments',
      'yasmin_evolutions'
    ];
    redundant.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
  }
};

// Remove base64 pesados de arquivos de exames antes de salvar no localStorage
// (Mantém metadados: título, data, nome do arquivo, tamanho, etc.)
export function sanitizePatientsForCache<T extends { exams?: any[] }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    if (!item || !Array.isArray(item.exams) || item.exams.length === 0) return item;
    return {
      ...item,
      exams: item.exams.map(exam => ({
        ...exam,
        // Limpa base64 pesado para evitar QuotaExceededError;
        // Os arquivos reais continuam salvos no MongoDB e são carregados sob demanda
        fileUrl: exam.fileUrl && exam.fileUrl.startsWith('data:') ? '' : exam.fileUrl
      }))
    };
  });
}

export function sanitizeSinglePatientForCache<T extends { exams?: any[] }>(item: T | null): T | null {
  if (!item) return null;
  if (!Array.isArray(item.exams) || item.exams.length === 0) return item;
  return {
    ...item,
    exams: item.exams.map(exam => ({
      ...exam,
      fileUrl: exam.fileUrl && exam.fileUrl.startsWith('data:') ? '' : exam.fileUrl
    }))
  };
}
