import { useEffect, useMemo, useRef, useState } from 'react';
import { SpaceBackdrop } from './components/SpaceBackdrop';
import { initialArchives } from './data/mockData';
import type {
  ConfirmedAnalysis,
  CurrentEcho,
  CurrentRecord,
  EchoAnalysis,
  EchoArchive,
  EchoDraft,
  View,
} from './data/types';
import { AboutPage } from './pages/AboutPage';
import { ArchiveDetailPage } from './pages/ArchiveDetailPage';
import { ArchivePage } from './pages/ArchivePage';
import { ConfirmPage } from './pages/ConfirmPage';
import { DraftPage } from './pages/DraftPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { RecordPage } from './pages/RecordPage';
import { ReportPage } from './pages/ReportPage';
import { SaveMotionPage } from './pages/SaveMotionPage';
import { analyzeEcho } from './services/ai';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const DRAFT_STORAGE_KEY = 'selfecho:drafts';

const createDraft = (content: string, selectedTags: string[]): EchoDraft => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  content,
  selectedTags,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'draft',
});

const createCurrentRecord = (content: string, selectedTags: string[]): CurrentRecord => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  content,
  selectedTags,
  createdAt: new Date().toISOString(),
  status: 'editing',
});

const loadDrafts = (): EchoDraft[] => {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [view, setView] = useState<View>('home');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentRecord, setCurrentRecord] = useState<CurrentRecord | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<EchoAnalysis | null>(null);
  const [selectedFocusPoints, setSelectedFocusPoints] = useState<string[]>([]);
  const [confirmedAnalysis, setConfirmedAnalysis] = useState<ConfirmedAnalysis | null>(null);
  const [currentEcho, setCurrentEcho] = useState<CurrentEcho | null>(null);
  const [archives, setArchives] = useState<EchoArchive[]>(initialArchives);
  const [drafts, setDrafts] = useState<EchoDraft[]>(loadDrafts);
  const [activeArchive, setActiveArchive] = useState<EchoArchive | null>(initialArchives[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isEnteringArchive, setIsEnteringArchive] = useState(false);
  const [isOpeningAbout, setIsOpeningAbout] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [toast, setToast] = useState('');
  const shellRef = useRef<HTMLElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lookRef = useRef({ x: 0, y: 0 });
  const startLookRef = useRef({ x: 0, y: 0 });

  const hasContent = content.trim().length > 0;
  const pageClass = useMemo(
    () =>
      `shell shell--${view} ${hasContent ? 'has-record-text' : ''} ${isEnteringArchive ? 'is-entering-archive' : ''} ${
        isOpeningAbout ? 'is-opening-about' : ''
      }`,
    [hasContent, isEnteringArchive, isOpeningAbout, view],
  );

  useEffect(() => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const setLook = (x: number, y: number) => {
    const shell = shellRef.current;
    if (!shell) return;

    lookRef.current = { x, y };
    shell.style.setProperty('--look-x', x.toFixed(4));
    shell.style.setProperty('--look-y', y.toFixed(4));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button, textarea, input, a')) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add('is-looking');
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    startLookRef.current = { ...lookRef.current };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const deltaX = (event.clientX - dragStartRef.current.x) / window.innerWidth;
    const deltaY = (event.clientY - dragStartRef.current.y) / window.innerHeight;
    setLook(
      clamp(startLookRef.current.x + deltaX * 2.35, -1.45, 1.45),
      clamp(startLookRef.current.y + deltaY * 2.05, -1.25, 1.25),
    );
  };

  const stopLooking = (event: React.PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    event.currentTarget.classList.remove('is-looking');
  };

  const goHome = () => setView('home');

  const openArchiveFromHome = () => {
    setIsEnteringArchive(true);
    window.setTimeout(() => {
      setView('archive');
      window.setTimeout(() => setIsEnteringArchive(false), 720);
    }, 520);
  };

  const openAboutFromProfile = () => {
    setIsOpeningAbout(true);
    window.setTimeout(() => {
      setView('about');
      window.setTimeout(() => setIsOpeningAbout(false), 420);
    }, 360);
  };

  const resetRecord = () => {
    setContent('');
    setSelectedTags([]);
    setCurrentRecord(null);
    setAiAnalysis(null);
    setSelectedFocusPoints([]);
    setConfirmedAnalysis(null);
  };

  const saveDraft = (options?: { leaveHome?: boolean }) => {
    if (!hasContent) {
      setToast('还没有可保存的内容');
      return;
    }

    setDrafts((items) => [createDraft(content.trim(), selectedTags), ...items]);
    setToast('已保存为草稿');

    if (options?.leaveHome) {
      resetRecord();
      goHome();
    }
  };

  const leaveRecord = () => {
    if (!hasContent) {
      resetRecord();
      goHome();
      return;
    }

    setLeaveDialogOpen(true);
  };

  const discardAndLeave = () => {
    setLeaveDialogOpen(false);
    resetRecord();
    goHome();
  };

  const continueFromRecord = async () => {
    if (!hasContent) return;

    const record = createCurrentRecord(content.trim(), selectedTags);
    setCurrentRecord(record);
    setCurrentEcho({ content: record.content, selectedTags: record.selectedTags });
    setIsAnalyzing(true);

    const analysis = await analyzeEcho(record.content, record.selectedTags);
    setAiAnalysis(analysis);
    setSelectedFocusPoints(analysis.focusPoints);
    setIsAnalyzing(false);
    setView('confirm');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((items) => (items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag]));
  };

  const generateReport = () => {
    if (!aiAnalysis) return;

    const record = currentRecord ?? createCurrentRecord(content.trim(), selectedTags);
    const confirmed: ConfirmedAnalysis = {
      recordId: record.id,
      content: record.content,
      selectedFocusPoints,
      emotions: aiAnalysis.emotions,
      triggers: aiAnalysis.triggers,
      summary: aiAnalysis.summary,
      boundaryHint: aiAnalysis.boundaryHint,
      reflectionQuestion: aiAnalysis.reflectionQuestion,
    };
    const report = {
      summary: aiAnalysis.summary,
      trigger: aiAnalysis.triggers.join('、') || '这次触发来自某个让你停住的细节。',
      observation: `你正在看见：${selectedFocusPoints.join('、') || '自己的感受'}。这段回声不需要被立刻解释清楚。`,
      reminder: aiAnalysis.boundaryHint,
    };

    setConfirmedAnalysis(confirmed);
    setIsGeneratingReport(true);

    window.setTimeout(() => {
      setCurrentEcho({ content: record.content, selectedTags: selectedFocusPoints, report });
      setIsGeneratingReport(false);
      setView('report');
    }, 6000);
  };

  const saveArchive = () => {
    if (!currentEcho?.report) return;

    const archive: EchoArchive = {
      id: `${Date.now()}`,
      content: currentEcho.content,
      keywords: currentEcho.selectedTags.length > 0 ? currentEcho.selectedTags : ['回声'],
      createdAt: new Date().toISOString().slice(0, 10),
      report: currentEcho.report,
    };

    setArchives((items) => [archive, ...items]);
    setActiveArchive(archive);
    setContent('');
    setSelectedTags([]);
    setCurrentEcho(null);
    setView('save');
  };

  const openDraft = (draft: EchoDraft) => {
    setContent(draft.content);
    setSelectedTags(draft.selectedTags);
    setCurrentRecord(createCurrentRecord(draft.content, draft.selectedTags));
    setAiAnalysis(null);
    setSelectedFocusPoints([]);
    setDrafts((items) => items.filter((item) => item.id !== draft.id));
    setView('record');
  };

  const deleteDraft = (draftId: string) => {
    setDrafts((items) => items.filter((item) => item.id !== draftId));
  };

  return (
    <main
      className={pageClass}
      ref={shellRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopLooking}
      onPointerCancel={stopLooking}
    >
      <SpaceBackdrop active={view !== 'home'} saving={view === 'save'} />

      {view === 'home' && (
        <HomePage
          recentEcho={archives[0]}
          onStartRecord={() => setView('record')}
          onOpenArchive={openArchiveFromHome}
          onOpenProfile={() => setView('profile')}
        />
      )}

      {view === 'record' && (
        <RecordPage
          content={content}
          isAnalyzing={isAnalyzing}
          toast={toast}
          leaveDialogOpen={leaveDialogOpen}
          onContentChange={setContent}
          onBack={leaveRecord}
          onContinue={continueFromRecord}
          onSaveDraft={() => saveDraft()}
          onDiscardLeave={discardAndLeave}
          onSaveDraftAndLeave={() => {
            setLeaveDialogOpen(false);
            saveDraft({ leaveHome: true });
          }}
          onKeepEditing={() => setLeaveDialogOpen(false)}
        />
      )}

      {view === 'confirm' && aiAnalysis && (
        <ConfirmPage
          analysis={aiAnalysis}
          selectedFocusPoints={selectedFocusPoints}
          isGeneratingReport={isGeneratingReport}
          onToggleFocus={(tag) =>
            setSelectedFocusPoints((items) =>
              items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag],
            )
          }
          onModify={() => setView('record')}
          onGenerate={generateReport}
        />
      )}

      {view === 'report' && currentEcho?.report && confirmedAnalysis && (
        <ReportPage echo={currentEcho} report={currentEcho.report} onSave={saveArchive} onEdit={() => setView('record')} />
      )}

      {view === 'save' && <SaveMotionPage onDone={() => setView('archive')} />}

      {view === 'archive' && (
        <ArchivePage
          archives={archives}
          onOpenDetail={(archive) => {
            setActiveArchive(archive);
            setView('archiveDetail');
          }}
          onOpenDrafts={() => setView('draft')}
          onBackHome={goHome}
        />
      )}

      {view === 'archiveDetail' && activeArchive && (
        <ArchiveDetailPage archive={activeArchive} onBack={() => setView('archive')} />
      )}

      {view === 'draft' && (
        <DraftPage drafts={drafts} onOpenDraft={openDraft} onDeleteDraft={deleteDraft} onBack={() => setView('archive')} />
      )}

      {view === 'profile' && (
        <ProfilePage archiveCount={archives.length} onBack={goHome} onOpenAbout={openAboutFromProfile} />
      )}

      {view === 'about' && <AboutPage onBack={() => setView('profile')} />}
    </main>
  );
}
