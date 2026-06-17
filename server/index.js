import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const fallbackAnalysis = {
  summary: '你似乎在这段关系回应中感到不安。',
  focusPoints: ['期待回应', '被忽略感', '关系不确定'],
  emotions: ['委屈', '紧张', '疲惫'],
  triggers: ['对方回复变慢', '没有得到确认'],
  boundaryHint: '你可以先把注意力放回自己的真实感受。',
  reflectionQuestion: '这件事里，你最希望被理解的是什么？',
};

const normalizeAnalysis = (value) => ({
  summary: typeof value?.summary === 'string' ? value.summary : fallbackAnalysis.summary,
  focusPoints: Array.isArray(value?.focusPoints) ? value.focusPoints.slice(0, 6).map(String) : fallbackAnalysis.focusPoints,
  emotions: Array.isArray(value?.emotions) ? value.emotions.slice(0, 6).map(String) : fallbackAnalysis.emotions,
  triggers: Array.isArray(value?.triggers) ? value.triggers.slice(0, 4).map(String) : fallbackAnalysis.triggers,
  boundaryHint: typeof value?.boundaryHint === 'string' ? value.boundaryHint : fallbackAnalysis.boundaryHint,
  reflectionQuestion:
    typeof value?.reflectionQuestion === 'string' ? value.reflectionQuestion : fallbackAnalysis.reflectionQuestion,
});

const parseJsonContent = (content) => {
  try {
    return JSON.parse(content.trim());
  } catch {
    const cleaned = content
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  }
};

app.post('/api/analyze-echo', async (req, res) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  const selectedTags = Array.isArray(req.body?.selectedTags) ? req.body.selectedTags.map(String) : [];

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.json(fallbackAnalysis);
  }

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content:
              '你是 SelfEcho 的情绪整理助手。你只帮助用户整理情绪线索，不做心理诊断，不评价用户，不给强硬建议。请严格返回 JSON。所有内容用中文，语气温和，不要诊断，不要说教，不要输出 markdown，不要输出解释，只输出 JSON，每条尽量短。',
          },
          {
            role: 'user',
            content: `请分析下面 JSON 中的 content 和 selectedTags。\n${JSON.stringify({
              content,
              selectedTags,
            })}\n请只返回这个 JSON 格式：{"summary":"一句话概括用户记录的内容","focusPoints":["关注点1","关注点2","关注点3"],"emotions":["情绪1","情绪2","情绪3"],"triggers":["触发点1","触发点2"],"boundaryHint":"一句温和的提醒","reflectionQuestion":"一个适合继续思考的问题"}。`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return res.json(fallbackAnalysis);
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (typeof rawContent !== 'string') {
      return res.json(fallbackAnalysis);
    }

    try {
      return res.json(normalizeAnalysis(parseJsonContent(rawContent)));
    } catch {
      return res.json(fallbackAnalysis);
    }
  } catch {
    return res.json(fallbackAnalysis);
  }
});

app.listen(PORT, () => {
  console.log(`SelfEcho API server running on http://localhost:${PORT}`);
});
