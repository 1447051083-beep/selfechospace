import { GlassButton } from '../components/GlassButton';
import type { EchoDraft } from '../data/types';

type DraftPageProps = {
  drafts: EchoDraft[];
  onOpenDraft: (draft: EchoDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onBack: () => void;
};

export function DraftPage({ drafts, onOpenDraft, onDeleteDraft, onBack }: DraftPageProps) {
  return (
    <section className="draft-page page-view">
      <header className="archive-header">
        <GlassButton variant="secondary" onClick={onBack}>返回</GlassButton>
        <div>
          <p className="page-kicker">Draft</p>
          <h1>草稿</h1>
        </div>
        <span />
      </header>

      {drafts.length === 0 ? (
        <div className="empty-state">还没有未完成的回声。</div>
      ) : (
        <div className="draft-list">
          {drafts.map((draft) => (
            <article className="draft-card" key={draft.id}>
              <p>{draft.content}</p>
              <small>{new Date(draft.createdAt).toLocaleString()}</small>
              <div>
                <button type="button" onClick={() => onOpenDraft(draft)}>继续编辑</button>
                <button type="button" onClick={() => onDeleteDraft(draft.id)}>删除</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
