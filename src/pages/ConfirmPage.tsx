import type { EchoAnalysis } from '../data/types';

type ConfirmPageProps = {
  analysis: EchoAnalysis;
  selectedFocusPoints: string[];
  isGeneratingReport: boolean;
  onToggleFocus: (tag: string) => void;
  onModify: () => void;
  onGenerate: () => void;
};

export function ConfirmPage({
  analysis,
  selectedFocusPoints,
  isGeneratingReport,
  onToggleFocus,
  onModify,
  onGenerate,
}: ConfirmPageProps) {
  return (
    <section className="confirm-workspace page-view">
      <header className="record-page-header confirm-header">
        <button className="soft-back-button" type="button" onClick={onModify} aria-label="返回修改">
          <span />
        </button>
        <div>
          <h1>这段回声里，SelfEcho 听见了</h1>
        </div>
      </header>

      <article className="confirm-analysis-card">
        <section className="analysis-section">
          <h2>回声摘要</h2>
          <p>{analysis.summary}</p>
        </section>

        <section className="analysis-section">
          <h2>你可能正在关注</h2>
          <div className="analysis-tags">
            {analysis.focusPoints.map((tag) => (
              <button
                className={`analysis-tag ${selectedFocusPoints.includes(tag) ? 'is-selected' : ''}`}
                type="button"
                key={tag}
                onClick={() => onToggleFocus(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="analysis-section">
          <h2>情绪关键词</h2>
          <div className="analysis-tags is-soft">
            {analysis.emotions.map((emotion) => (
              <span key={emotion}>{emotion}</span>
            ))}
          </div>
        </section>

        <section className="analysis-section">
          <h2>可能的触发点</h2>
          <div className="trigger-list">
            {analysis.triggers.map((trigger) => (
              <span key={trigger}>{trigger}</span>
            ))}
          </div>
        </section>

        <section className="analysis-section">
          <h2>给你的提醒</h2>
          <p>{analysis.boundaryHint}</p>
        </section>

        <section className="analysis-section">
          <h2>可以继续想一想</h2>
          <p>{analysis.reflectionQuestion}</p>
        </section>
      </article>

      <div className="record-bottom-actions confirm-bottom-actions">
        <button className="record-secondary-action" type="button" onClick={onModify}>
          返回修改
        </button>
        <button className="record-primary-action" type="button" disabled={isGeneratingReport} onClick={onGenerate}>
          生成回声报告
        </button>
      </div>

      {isGeneratingReport && (
        <div className="report-generating" role="status" aria-live="polite">
          <div className="report-generating-card">
            <div className="report-generating-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>正在生成本次回声报告</p>
          </div>
        </div>
      )}
    </section>
  );
}
