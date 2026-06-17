import { GlassButton } from '../components/GlassButton';
import type { EchoArchive } from '../data/types';

type ArchiveDetailPageProps = {
  archive: EchoArchive;
  onBack: () => void;
};

export function ArchiveDetailPage({ archive, onBack }: ArchiveDetailPageProps) {
  return (
    <section className="detail-page page-view">
      <article className="detail-card">
        <p className="page-kicker">{archive.createdAt}</p>
        <h1>{archive.keywords.join(' / ')}</h1>
        <div className="keyword-row">
          {archive.keywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>
        <section>
          <h2>记录内容</h2>
          <p>{archive.content}</p>
        </section>
        <section>
          <h2>回声报告</h2>
          <p>{archive.report.summary}</p>
          <p>{archive.report.trigger}</p>
          <p>{archive.report.observation}</p>
          <p>{archive.report.reminder}</p>
        </section>
        <GlassButton variant="secondary" onClick={onBack}>返回档案</GlassButton>
      </article>
    </section>
  );
}
