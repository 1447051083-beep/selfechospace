import type { EchoArchive } from '../data/types';

type ArchivePageProps = {
  archives: EchoArchive[];
  onOpenDetail: (archive: EchoArchive) => void;
  onOpenDrafts: () => void;
  onBackHome: () => void;
};

export function ArchivePage({ archives, onOpenDetail, onOpenDrafts, onBackHome }: ArchivePageProps) {
  return (
    <section className="archive-page page-view">
      <div className="archive-space-bg" aria-hidden="true">
        <div className="archive-space-image" />
        <div className="archive-space-cards" />
        <div className="archive-space-breath" />
        <div className="archive-space-depth archive-space-depth--near" />
        <div className="archive-space-depth archive-space-depth--far" />
      </div>

      <header className="archive-header">
        <button className="small-glass-button" type="button" onClick={onBackHome}>首页</button>
        <div>
          <p className="page-kicker">Archive</p>
          <h1>回声档案</h1>
        </div>
        <button className="small-glass-button" type="button" onClick={onOpenDrafts}>草稿</button>
      </header>

      <div className="archive-orbit" aria-label="回声档案">
        {archives.map((archive, index) => (
          <button
            className={`memory-orb memory-orb--${index % 5}`}
            type="button"
            key={archive.id}
            onClick={() => onOpenDetail(archive)}
          >
            <span>{archive.keywords[0]}</span>
            <small>{archive.createdAt}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
