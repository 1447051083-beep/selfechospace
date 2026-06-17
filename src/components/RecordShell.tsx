import type { ReactNode } from 'react';

type RecordShellProps = {
  children: ReactNode;
  onBack?: () => void;
  activeStep?: number;
};

export function RecordShell({ children, onBack, activeStep = 0 }: RecordShellProps) {
  return (
    <section className="record-glass-stage">
      <button className="record-orbit-button" type="button" aria-label="返回" onClick={onBack}>
        <span className="orbit-ring" aria-hidden="true" />
        <span className="orbit-dot" aria-hidden="true" />
      </button>

      <div className="record-step-dots" aria-hidden="true">
        {[0, 1, 2, 3].map((step) => (
          <span className={step === activeStep ? 'is-active' : ''} key={step} />
        ))}
      </div>

      <header className="record-hero">
        <h1>想记录哪段回声呢?</h1>
        <p>不用完整描述，写下让你停住的那个片段</p>
      </header>

      {children}
    </section>
  );
}
