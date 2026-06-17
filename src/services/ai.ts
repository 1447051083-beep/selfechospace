import type { EchoAnalysis } from '../data/types';

const fallbackAnalysis: EchoAnalysis = {
  summary: '你似乎在这段关系回应中感到不安。',
  focusPoints: ['期待回应', '被忽略感', '关系不确定'],
  emotions: ['委屈', '紧张', '疲惫'],
  triggers: ['对方回复变慢', '没有得到确认'],
  boundaryHint: '你可以先把注意力放回自己的真实感受。',
  reflectionQuestion: '这件事里，你最希望被理解的是什么？',
};

const normalizeAnalysis = (value: Partial<EchoAnalysis>): EchoAnalysis => ({
  summary: typeof value.summary === 'string' ? value.summary : fallbackAnalysis.summary,
  focusPoints: Array.isArray(value.focusPoints) ? value.focusPoints.map(String).slice(0, 6) : fallbackAnalysis.focusPoints,
  emotions: Array.isArray(value.emotions) ? value.emotions.map(String).slice(0, 6) : fallbackAnalysis.emotions,
  triggers: Array.isArray(value.triggers) ? value.triggers.map(String).slice(0, 4) : fallbackAnalysis.triggers,
  boundaryHint: typeof value.boundaryHint === 'string' ? value.boundaryHint : fallbackAnalysis.boundaryHint,
  reflectionQuestion:
    typeof value.reflectionQuestion === 'string' ? value.reflectionQuestion : fallbackAnalysis.reflectionQuestion,
});

export async function analyzeEcho(content: string, selectedTags: string[]): Promise<EchoAnalysis> {
  try {
    const response = await fetch('http://localhost:3001/api/analyze-echo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, selectedTags }),
    });

    if (!response.ok) {
      return fallbackAnalysis;
    }

    const data = (await response.json()) as Partial<EchoAnalysis>;
    return normalizeAnalysis(data);
  } catch {
    return fallbackAnalysis;
  }
}

export const generateEchoAnalysis = analyzeEcho;
