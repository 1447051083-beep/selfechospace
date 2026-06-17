import { GlassButton } from '../components/GlassButton';

type ProfilePageProps = {
  archiveCount: number;
  onBack: () => void;
  onOpenAbout: () => void;
};

export function ProfilePage({ archiveCount, onBack, onOpenAbout }: ProfilePageProps) {
  return (
    <section className="profile-page page-view">
      <article className="profile-card">
        <p className="page-kicker">Profile</p>
        <h1>我的 / 设置</h1>
        <div className="profile-grid">
          <div>
            <span>昵称</span>
            <strong>SelfEcho User</strong>
          </div>
          <div>
            <span>已保存回声</span>
            <strong>{archiveCount}</strong>
          </div>
          <div>
            <span>主题设置</span>
            <strong>柔和蓝粉空间</strong>
          </div>
          <button className="profile-option" type="button" onClick={onOpenAbout}>
            <span>关于 SelfEcho</span>
            <strong>Digital Memory Space</strong>
          </button>
        </div>
        <GlassButton variant="secondary" onClick={onBack}>返回首页</GlassButton>
      </article>
    </section>
  );
}
