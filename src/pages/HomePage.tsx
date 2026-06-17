import type { EchoArchive } from '../data/types';

type HomePageProps = {
  recentEcho?: EchoArchive;
  onStartRecord: () => void;
  onOpenArchive: () => void;
  onOpenProfile: () => void;
};

export function HomePage({ recentEcho, onStartRecord, onOpenArchive, onOpenProfile }: HomePageProps) {
  return (
    <section className="home-page page-view">
      <header className="home-top">
        <img className="brand-logo" src="/selfecho-logo.png" alt="SelfEcho" />
      </header>

      <button className="omphalos-hit-area" type="button" aria-label="触碰 Omphalos" />

      <article className="status-card">
        <p>最近的回声</p>
        <h2>{recentEcho ? recentEcho.keywords.join(' / ') : 'Omphalos 正在等待新的回声'}</h2>
        <span>{recentEcho ? recentEcho.report.summary : '写下一段当下，SelfEcho 会把它收进记忆空间。'}</span>
      </article>

      <nav className="entry-dock" aria-label="SelfEcho entries">
        <button className="entry-button" type="button" onClick={onStartRecord}>
          开始记录
        </button>
        <button className="entry-button" type="button" onClick={onOpenArchive}>
          回声档案
        </button>
        <button className="entry-button" type="button" onClick={onOpenProfile}>
          我的 / 设置
        </button>
      </nav>
    </section>
  );
}
