import { GlassButton } from '../components/GlassButton';
import type { CurrentEcho, EchoReport } from '../data/types';

type ReportPageProps = {
  echo: CurrentEcho;
  report: EchoReport;
  onSave: () => void;
  onEdit: () => void;
};

export function ReportPage({ echo, report, onSave, onEdit }: ReportPageProps) {
  return (
    <section className="report-page page-view">
      <article className="report-card">
        <p className="page-kicker">Echo Report</p>
        <h1>这段回声已经成形</h1>
        <div className="report-original">{echo.content}</div>

        <div className="report-grid">
          <section>
            <h2>情绪总结</h2>
            <p>{report.summary}</p>
          </section>
          <section>
            <h2>触发机制</h2>
            <p>{report.trigger}</p>
          </section>
          <section>
            <h2>自我观察</h2>
            <p>{report.observation}</p>
          </section>
          <section>
            <h2>给你的提醒</h2>
            <p>{report.reminder}</p>
          </section>
        </div>

        <div className="page-actions">
          <GlassButton variant="secondary" onClick={onEdit}>重新编辑</GlassButton>
          <GlassButton variant="primary" onClick={onSave}>保存为档案</GlassButton>
        </div>
      </article>
    </section>
  );
}
