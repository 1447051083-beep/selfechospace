import type { EchoArchive, EchoReport } from './types';

export const focusOptions = ['被忽略', '不安', '期待回应', '关系边界', '想被理解', '情绪反复'];

export const createMockReport = (content: string, tags: string[]): EchoReport => {
  const joinedTags = tags.length > 0 ? tags.join('、') : '被看见、被回应';

  return {
    summary: `这段回声里有一种想被认真接住的感受，核心关键词是：${joinedTags}。`,
    trigger: '触发点可能来自对方回应的缺席、语气的变化，或你对关系距离的突然察觉。',
    observation: `你写下的片段显示，你并不是只在意事件本身，也在意这段关系里自己是否被放在心上。${content.slice(0, 34)}`,
    reminder: '先允许自己确认感受，再决定是否回应。你不需要立刻把一切解释清楚。',
  };
};

export const initialArchives: EchoArchive[] = [
  {
    id: 'echo-1',
    content: '今天对话里我突然停住了。不是因为发生了很大的事，而是我发现自己又在等待一个回应。',
    keywords: ['期待回应', '不安'],
    createdAt: '2026-06-10',
    report: {
      summary: '这段回声像是在等待被确认，情绪底色偏柔软的不安。',
      trigger: '对方回应延迟让你重新意识到关系里的不确定。',
      observation: '你在寻找的也许不是答案，而是一种稳定的在场感。',
      reminder: '把等待和自我价值分开，会让你更轻一点。',
    },
  },
  {
    id: 'echo-2',
    content: '我答应了一件其实不想做的事。说出口之后就开始后悔，但当时不知道怎么拒绝。',
    keywords: ['关系边界', '有点累'],
    createdAt: '2026-06-08',
    report: {
      summary: '这段回声里有明显的消耗感，也有对边界的重新寻找。',
      trigger: '当下害怕让对方失望，所以先牺牲了自己的节奏。',
      observation: '你已经察觉到“不想做”，这是边界重新出现的信号。',
      reminder: '拒绝不一定是切断关系，也可以是给关系一个更真实的位置。',
    },
  },
  {
    id: 'echo-3',
    content: '只是一个很小的表情，但我想了很久。好像我总是会从细节里寻找自己有没有被忽略。',
    keywords: ['被忽略', '情绪反复'],
    createdAt: '2026-06-03',
    report: {
      summary: '你对细节很敏感，这份敏感正在提醒你某种长期的在意。',
      trigger: '微小表情触发了被忽略的记忆和猜测。',
      observation: '你并非过度反应，而是在试图理解自己在关系中的位置。',
      reminder: '先记录，不急着判定。让感受被看见，就是第一步。',
    },
  },
];
