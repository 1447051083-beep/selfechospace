type RecordPageProps = {
  content: string;
  isAnalyzing: boolean;
  toast: string;
  leaveDialogOpen: boolean;
  onContentChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
  onDiscardLeave: () => void;
  onSaveDraftAndLeave: () => void;
  onKeepEditing: () => void;
};

export function RecordPage({
  content,
  isAnalyzing,
  toast,
  leaveDialogOpen,
  onContentChange,
  onBack,
  onContinue,
  onSaveDraft,
  onDiscardLeave,
  onSaveDraftAndLeave,
  onKeepEditing,
}: RecordPageProps) {
  const hasContent = content.trim().length > 0;

  return (
    <section className={`record-workspace page-view ${hasContent ? 'is-writing' : ''}`}>
      <header className="record-page-header">
        <button className="soft-back-button" type="button" onClick={onBack} aria-label="返回首页">
          <span />
        </button>
        <div>
          <h1>记录一段回声</h1>
          <p>把此刻的感受，先轻轻放在这里</p>
        </div>
      </header>

      <article className={`record-input-card ${isAnalyzing ? 'is-lifting' : ''}`}>
        <div className="record-card-glow" aria-hidden="true" />
        <textarea
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder="刚刚发生了什么？你有什么感受？"
          aria-label="记录一段回声"
        />
      </article>

      <div className="record-bottom-actions">
        <button className="record-secondary-action" type="button" onClick={onSaveDraft}>
          保存草稿
        </button>
        <button className="record-primary-action" type="button" disabled={!hasContent || isAnalyzing} onClick={onContinue}>
          继续
        </button>
      </div>

      {toast && <div className="echo-toast">{toast}</div>}

      {isAnalyzing && (
        <div className="analysis-loading" role="status" aria-live="polite">
          <div className="loading-omphalos" aria-hidden="true">
            <span />
          </div>
          <p>正在整理这段回声</p>
        </div>
      )}

      {leaveDialogOpen && (
        <div className="echo-dialog-backdrop" role="presentation">
          <div className="echo-dialog" role="dialog" aria-modal="true" aria-labelledby="leave-record-title">
            <h2 id="leave-record-title">要保存这段回声吗？</h2>
            <p>当前内容还没有完成，可以先保存为草稿。</p>
            <div className="echo-dialog-actions">
              <button type="button" onClick={onDiscardLeave}>
                放弃离开
              </button>
              <button type="button" onClick={onSaveDraftAndLeave}>
                保存草稿
              </button>
              <button type="button" onClick={onKeepEditing}>
                继续编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
