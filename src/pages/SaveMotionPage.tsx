import { useEffect } from 'react';

type SaveMotionPageProps = {
  onDone: () => void;
};

export function SaveMotionPage({ onDone }: SaveMotionPageProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 11800);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <section className="save-ritual" aria-label="保存回声档案动画">
      <video
        className="save-ritual-video"
        src={`${import.meta.env.BASE_URL}save-motion-bg.mp4`}
        autoPlay
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="save-ritual-bloom" aria-hidden="true" />
      <div className="save-ritual-thread" aria-hidden="true" />
      <div className="save-ritual-energy" aria-hidden="true" />
      <div className="save-ritual-archive" aria-hidden="true" />
      <img className="save-ritual-glass" src="/save-glass-card.png" alt="" draggable={false} />
      <div className="save-ritual-complete" role="status" aria-live="polite">
        保存完成
      </div>
    </section>
  );
}
