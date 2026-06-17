type AboutPageProps = {
  onBack: () => void;
};

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <section className="about-page page-view">
      <img className="about-bg" src="/about-selfecho-bg.png" alt="" aria-hidden="true" />
      <div className="about-yellow-ring" aria-hidden="true" />
      <button className="small-glass-button about-back" type="button" onClick={onBack}>
        返回
      </button>
      <img className="about-copy" src="/about-selfecho-copy.png" alt="关于 SelfEcho" />
    </section>
  );
}
