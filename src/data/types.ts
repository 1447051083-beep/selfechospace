export type View =
  | 'home'
  | 'record'
  | 'confirm'
  | 'report'
  | 'save'
  | 'archive'
  | 'archiveDetail'
  | 'draft'
  | 'profile'
  | 'about';

export type EchoReport = {
  summary: string;
  trigger: string;
  observation: string;
  reminder: string;
};

export type EchoAnalysis = {
  summary: string;
  focusPoints: string[];
  emotions: string[];
  triggers: string[];
  boundaryHint: string;
  reflectionQuestion: string;
};

export type CurrentRecord = {
  id: string;
  content: string;
  selectedTags: string[];
  createdAt: string;
  status: 'editing';
};

export type EchoDraft = {
  id: string;
  content: string;
  selectedTags: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft';
};

export type EchoArchive = {
  id: string;
  content: string;
  keywords: string[];
  createdAt: string;
  report: EchoReport;
};

export type CurrentEcho = {
  content: string;
  selectedTags: string[];
  report?: EchoReport;
};

export type ConfirmedAnalysis = {
  recordId: string;
  content: string;
  selectedFocusPoints: string[];
  emotions: string[];
  triggers: string[];
  summary: string;
  boundaryHint: string;
  reflectionQuestion: string;
};
