import {
  Copy,
  FileText,
  FolderOpen,
  GripVertical,
  KeyRound,
  Link2,
  PenSquare,
  Save,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { BlockNoteViewRaw as BlockNoteView, useCreateBlockNote } from '@blocknote/react';
import { type DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BridgeApi } from '../../preload/bridge';
import { DEFAULT_PROMPT_MARKDOWN } from '../../shared/default-prompt';
import {
  type ArticleSection,
  articleSectionsToMarkdown,
  deleteSections,
  normalizeMarkdownDividers,
  moveSectionToIndex,
  prepareMarkdownForCopy,
  replaceSectionMarkdown,
  splitMarkdownIntoSections,
  updateSectionMarkdown,
} from '../../shared/domain/section';
import type { GroundingPayload } from '../../shared/ipc';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import '@blocknote/react/style.css';

type Page = 'generator' | 'settings';

const navItems: Array<{ key: Page; label: string; icon: typeof FileText }> = [
  { key: 'generator', label: '글 생성', icon: FileText },
  { key: 'settings', label: '설정', icon: Settings },
];

function getSectionTitle(section: ArticleSection): string {
  const headingMatch = /^#{1,6}\s+(.+)$/m.exec(section.markdown);
  return headingMatch?.[1]?.trim() || `본문 블록 ${section.order + 1}`;
}

const FALLBACK_BRIDGE: BridgeApi = {
  settings: {
    get: async () => ({
      apiKeyMasked: '',
      promptMarkdown: DEFAULT_PROMPT_MARKDOWN,
      outputPath: '',
    }),
    update: async () => {
      throw new Error('설정 저장 기능은 데스크톱 앱에서만 사용할 수 있습니다.');
    },
    testApiKey: async () => ({ ok: false, message: '설정 저장 기능은 데스크톱 앱에서 사용할 수 있습니다.' }),
    chooseOutputPath: async () => {
      throw new Error('저장 경로 선택 기능은 데스크톱 앱에서만 사용할 수 있습니다.');
    },
  },
  generator: {
    generate: async () => ({ markdown: '', grounding: undefined }),
  },
  article: {
    save: async () => ({ ok: false, path: '' }),
  },
  clipboard: {
    copyNaver: async () => ({ ok: false }),
    copyMarkdown: async () => ({ ok: false }),
    copySelectionNaver: async () => ({ ok: false }),
  },
  files: {
    getPathForFile: (file: File) => (file as File & { path?: string }).path ?? '',
  },
};

function resolveBridge(): BridgeApi {
  const maybeBridge = (window as unknown as { bridge?: BridgeApi }).bridge;
  return maybeBridge ?? FALLBACK_BRIDGE;
}

export default function App() {
  const bridge = useMemo(() => resolveBridge(), []);
  const editor = useCreateBlockNote();
  const syncingEditorRef = useRef(false);
  const lastSyncedSectionIdRef = useRef<string | null>(null);
  const settingsLoadRequestIdRef = useRef(0);
  const settingsEditVersionRef = useRef(0);
  const [page, setPage] = useState<Page>('generator');
  const [topic, setTopic] = useState('');
  const [imageName, setImageName] = useState('');
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [apiKey, setApiKey] = useState('');
  const [promptMarkdown, setPromptMarkdown] = useState(DEFAULT_PROMPT_MARKDOWN);
  const [outputPath, setOutputPath] = useState('');
  const [apiKeyDirty, setApiKeyDirty] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [articleSections, setArticleSections] = useState<ArticleSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [generateNotice, setGenerateNotice] = useState('');
  const [groundingSummary, setGroundingSummary] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const [lastGrounding, setLastGrounding] = useState<GroundingPayload | undefined>(undefined);

  const hasUnreadableSelectedImage = imageName.length > 0 && !imagePath;
  const generateDisabled = useMemo(
    () => topic.trim().length === 0 || isGenerating || hasUnreadableSelectedImage,
    [hasUnreadableSelectedImage, isGenerating, topic]
  );
  const activeSection = useMemo(
    () => articleSections.find((section) => section.id === activeSectionId) ?? null,
    [activeSectionId, articleSections]
  );
  const selectedSectionIdSet = useMemo(() => new Set(selectedSectionIds), [selectedSectionIds]);
  const selectedSectionCount = selectedSectionIds.length;
  const hasArticle = articleSections.length > 0;
  const pageTitle = page === 'generator' ? '블로그 글 생성' : '설정';
  const pageDescription =
    page === 'generator'
      ? '주제와 참고 이미지를 기반으로 AI 초안을 만들고 문단 단위로 편집합니다.'
      : 'API 키, 기본 프롬프트, 결과 저장 경로를 로컬에서 관리합니다.';

  const markSettingsEdited = useCallback(() => {
    settingsEditVersionRef.current += 1;
  }, []);

  const loadSettings = useCallback(async () => {
    const requestId = settingsLoadRequestIdRef.current + 1;
    settingsLoadRequestIdRef.current = requestId;
    const editVersionAtRequest = settingsEditVersionRef.current;

    try {
      const settings = await bridge.settings.get();
      const isStaleRequest = settingsLoadRequestIdRef.current !== requestId;
      const hasUserEditSinceRequest = settingsEditVersionRef.current !== editVersionAtRequest;
      if (isStaleRequest || hasUserEditSinceRequest) {
        return;
      }

      setApiKey(settings.apiKeyMasked);
      setPromptMarkdown(settings.promptMarkdown);
      setOutputPath(settings.outputPath);
      setApiKeyDirty(false);
    } catch {
      setSettingsNotice('설정 불러오기에 실패했습니다.');
    }
  }, [bridge]);

  const saveSettings = useCallback(async () => {
    try {
      await bridge.settings.update({
        ...(apiKeyDirty ? { apiKey } : {}),
        promptMarkdown,
        outputPath,
      });
      setApiKeyDirty(false);
      setSettingsNotice('설정을 저장했습니다.');
    } catch {
      setSettingsNotice('설정 저장에 실패했습니다.');
    }
  }, [apiKey, apiKeyDirty, bridge, outputPath, promptMarkdown]);

  const handleTestApiKey = useCallback(async () => {
    const result = await bridge.settings.testApiKey(apiKeyDirty ? apiKey : undefined);
    setSettingsNotice(result.message);
  }, [apiKey, apiKeyDirty, bridge]);

  const handleChooseOutputPath = useCallback(async () => {
    setSettingsNotice('저장 경로 선택 창을 여는 중입니다.');

    try {
      const selectedPath = await bridge.settings.chooseOutputPath();
      if (selectedPath) {
        markSettingsEdited();
        setOutputPath(selectedPath);
        setSettingsNotice('저장 경로를 선택했습니다. 설정 저장을 눌러 적용해주세요.');
        return;
      }

      setSettingsNotice('저장 경로 선택이 취소되었습니다.');
    } catch {
      setSettingsNotice('저장 경로 선택 창을 열지 못했습니다.');
    }
  }, [bridge, markSettingsEdited]);

  const handleGenerate = useCallback(async () => {
    setGenerateNotice('');
    setSaveNotice('');
    setCopyNotice('');
    setIsGenerating(true);

    try {
      const result = await bridge.generator.generate({
        topic: topic.trim(),
        imagePath,
      });

      const sections = splitMarkdownIntoSections(result.markdown);
      setArticleSections(sections);
      setSelectedSectionIds([]);
      lastSyncedSectionIdRef.current = null;
      setActiveSectionId(null);
      setLastGrounding(result.grounding);
      const sourceCount = result.grounding?.sources.length ?? 0;
      setGroundingSummary(sourceCount > 0 ? `검색 출처 ${sourceCount}건` : '검색 출처 없음');
      setGenerateNotice('글 생성이 완료되었습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '글 생성에 실패했습니다.';
      setGenerateNotice(message);
    } finally {
      setIsGenerating(false);
    }
  }, [bridge, imagePath, topic]);

  const syncEditorWithMarkdown = useCallback(
    (markdown: string) => {
      const normalized = markdown.trim();
      if (!normalized) {
        return;
      }

      const parsedBlocks = editor.tryParseMarkdownToBlocks(normalized);
      if (parsedBlocks.length === 0) {
        return;
      }

      syncingEditorRef.current = true;
      const currentBlockIds = editor.document.map((block) => block.id);
      if (currentBlockIds.length > 0) {
        editor.replaceBlocks(currentBlockIds, parsedBlocks);
      }
      queueMicrotask(() => {
        syncingEditorRef.current = false;
      });
    },
    [editor]
  );

  const handleEditorChange = useCallback(() => {
    if (syncingEditorRef.current) {
      return;
    }

    if (!activeSectionId) {
      return;
    }

    const markdown = normalizeMarkdownDividers(editor.blocksToMarkdownLossy().trim());
    setArticleSections((sections) => replaceSectionMarkdown(sections, activeSectionId, markdown));
  }, [activeSectionId, editor]);

  const commitActiveSection = useCallback((options: { deactivate?: boolean } = {}): ArticleSection[] => {
    if (!activeSectionId) {
      return articleSections;
    }

    const markdown = normalizeMarkdownDividers(editor.blocksToMarkdownLossy().trim());
    const nextSections = updateSectionMarkdown(articleSections, activeSectionId, markdown);
    setArticleSections(nextSections);
    setSelectedSectionIds((sectionIds) => {
      const nextSectionIds = new Set(nextSections.map((section) => section.id));
      return sectionIds.filter((sectionId) => nextSectionIds.has(sectionId));
    });
    lastSyncedSectionIdRef.current = null;
    if (options.deactivate || !nextSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(null);
    }
    return nextSections;
  }, [activeSectionId, articleSections, editor]);

  const handleToggleSectionSelected = useCallback((sectionId: string) => {
    setSelectedSectionIds((sectionIds) =>
      sectionIds.includes(sectionId) ? sectionIds.filter((selectedSectionId) => selectedSectionId !== sectionId) : [...sectionIds, sectionId]
    );
  }, []);

  const handleActivateSection = useCallback(
    (section: ArticleSection) => {
      if (activeSectionId === section.id) {
        return;
      }

      commitActiveSection();
      lastSyncedSectionIdRef.current = null;
      setActiveSectionId(section.id);
    },
    [activeSectionId, commitActiveSection]
  );

  const handleSectionDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, sectionId: string) => {
      const nextSections = commitActiveSection({ deactivate: true });
      if (!nextSections.some((section) => section.id === sectionId)) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', sectionId);
      setDraggedSectionId(sectionId);
    },
    [commitActiveSection]
  );

  const handleSectionDragOver = useCallback((event: DragEvent<HTMLElement>, sectionId: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverSectionId(sectionId);
  }, []);

  const handleSectionDragLeave = useCallback((event: DragEvent<HTMLElement>, sectionId: string) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setDragOverSectionId((currentSectionId) => (currentSectionId === sectionId ? null : currentSectionId));
  }, []);

  const handleSectionDrop = useCallback(
    (event: DragEvent<HTMLElement>, targetSectionId: string) => {
      event.preventDefault();
      const sourceSectionId = draggedSectionId ?? event.dataTransfer.getData('text/plain');
      setArticleSections((sections) => {
        const targetIndex = sections.findIndex((section) => section.id === targetSectionId);
        return moveSectionToIndex(sections, sourceSectionId, targetIndex);
      });
      setDraggedSectionId(null);
      setDragOverSectionId(null);
    },
    [draggedSectionId]
  );

  const handleSectionDragEnd = useCallback(() => {
    setDraggedSectionId(null);
    setDragOverSectionId(null);
  }, []);

  const handleSaveArticle = useCallback(async () => {
    setSaveNotice('');

    const committedSections = commitActiveSection();
    const markdown = articleSectionsToMarkdown(committedSections).trim();
    if (!markdown) {
      setSaveNotice('저장할 본문이 없습니다. 글을 생성하거나 편집해주세요.');
      return;
    }

    try {
      const result = await bridge.article.save({
        markdown,
        metadata: {
          topic: topic.trim(),
          imagePath,
          grounding: lastGrounding,
        },
      });
      setSaveNotice(`저장이 완료되었습니다: ${result.path}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '저장에 실패했습니다.';
      setSaveNotice(message);
    }
  }, [bridge, commitActiveSection, imagePath, lastGrounding, topic]);

  const handleCopyNaver = useCallback(async () => {
    setCopyNotice('');
    const committedSections = commitActiveSection();
    const markdown = prepareMarkdownForCopy(articleSectionsToMarkdown(committedSections));
    if (!markdown) {
      setCopyNotice('복사할 본문이 없습니다. 글을 생성하거나 편집해주세요.');
      return;
    }

    try {
      await bridge.clipboard.copyNaver(markdown);
      setCopyNotice('전체 글을 네이버 형식으로 복사했습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '네이버 복사에 실패했습니다.';
      setCopyNotice(message);
    }
  }, [bridge, commitActiveSection]);

  const handleCopySectionNaver = useCallback(async (section: ArticleSection) => {
    setCopyNotice('');
    const committedSections = commitActiveSection();
    const committedSection = committedSections.find((candidate) => candidate.id === section.id) ?? section;
    const markdown = prepareMarkdownForCopy(committedSection.markdown);
    if (!markdown) {
      setCopyNotice('복사할 본문 블록이 비어 있습니다.');
      return;
    }

    try {
      await bridge.clipboard.copySelectionNaver(markdown);
      setCopyNotice(`본문 블록 ${section.order + 1}번을 네이버 형식으로 복사했습니다.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '본문 블록 복사에 실패했습니다.';
      setCopyNotice(message);
    }
  }, [bridge, commitActiveSection]);

  const handleCopySelectedParagraphNaver = useCallback(async () => {
    setCopyNotice('');

    if (!activeSectionId) {
      setCopyNotice('선택된 문단이 없습니다. 복사할 문단을 먼저 선택해주세요.');
      return;
    }

    const selection = editor.getSelection();
    if (!selection) {
      setCopyNotice('선택된 문단이 없습니다. 복사할 문단을 먼저 선택해주세요.');
      return;
    }

    const selectedBlocks = editor.getSelectionCutBlocks().blocks;
    const selectedMarkdownBlocks = selectedBlocks as Parameters<typeof editor.blocksToMarkdownLossy>[0];
    const markdown = prepareMarkdownForCopy(editor.blocksToMarkdownLossy(selectedMarkdownBlocks).trim());
    if (!markdown) {
      setCopyNotice('선택된 문단이 없습니다. 복사할 문단을 먼저 선택해주세요.');
      return;
    }

    try {
      await bridge.clipboard.copySelectionNaver(markdown);
      setCopyNotice('선택 문단을 네이버 형식으로 복사했습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '선택 문단 복사에 실패했습니다.';
      setCopyNotice(message);
    }
  }, [activeSectionId, bridge, editor]);

  const handleCopySelectedSectionsNaver = useCallback(async () => {
    setCopyNotice('');

    const committedSections = commitActiveSection();
    const selectedIds = new Set(selectedSectionIds);
    const selectedSections = committedSections.filter((section) => selectedIds.has(section.id));
    if (selectedSections.length === 0) {
      setCopyNotice('선택된 블록이 없습니다. 복사할 블록을 먼저 선택해주세요.');
      return;
    }

    const markdown = prepareMarkdownForCopy(articleSectionsToMarkdown(selectedSections));
    if (!markdown) {
      setCopyNotice('선택한 블록에 복사할 본문이 없습니다.');
      return;
    }

    try {
      await bridge.clipboard.copySelectionNaver(markdown);
      setCopyNotice('선택 블록을 네이버 형식으로 복사했습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '선택 블록 복사에 실패했습니다.';
      setCopyNotice(message);
    }
  }, [bridge, commitActiveSection, selectedSectionIds]);

  const handleDeleteSelectedSections = useCallback(() => {
    setSaveNotice('');
    setCopyNotice('');

    const committedSections = commitActiveSection({
      deactivate: activeSectionId ? selectedSectionIds.includes(activeSectionId) : false,
    });
    const selectedIds = selectedSectionIds.filter((sectionId) => committedSections.some((section) => section.id === sectionId));
    if (selectedIds.length === 0) {
      setCopyNotice('선택된 블록이 없습니다. 삭제할 블록을 먼저 선택해주세요.');
      return;
    }

    const nextSections = deleteSections(committedSections, selectedIds);
    setArticleSections(nextSections);
    setSelectedSectionIds([]);
    if (activeSectionId && selectedIds.includes(activeSectionId)) {
      setActiveSectionId(null);
      lastSyncedSectionIdRef.current = null;
    }
    setSaveNotice('선택 블록을 삭제했습니다.');
  }, [activeSectionId, commitActiveSection, selectedSectionIds]);

  const handleCopyMarkdown = useCallback(async () => {
    setCopyNotice('');
    const committedSections = commitActiveSection();
    const markdown = prepareMarkdownForCopy(articleSectionsToMarkdown(committedSections));
    if (!markdown) {
      setCopyNotice('복사할 본문이 없습니다. 글을 생성하거나 편집해주세요.');
      return;
    }

    try {
      await bridge.clipboard.copyMarkdown(markdown);
      setCopyNotice('마크다운을 복사했습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '마크다운 복사에 실패했습니다.';
      setCopyNotice(message);
    }
  }, [bridge, commitActiveSection]);

  const handleCopySectionMarkdown = useCallback(async (section: ArticleSection) => {
    setCopyNotice('');
    const committedSections = commitActiveSection();
    const committedSection = committedSections.find((candidate) => candidate.id === section.id) ?? section;
    const markdown = prepareMarkdownForCopy(committedSection.markdown);
    if (!markdown) {
      setCopyNotice('복사할 본문 블록이 비어 있습니다.');
      return;
    }

    try {
      await bridge.clipboard.copyMarkdown(markdown);
      setCopyNotice(`본문 블록 ${section.order + 1}번 마크다운을 복사했습니다.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '본문 블록 마크다운 복사에 실패했습니다.';
      setCopyNotice(message);
    }
  }, [bridge, commitActiveSection]);

  useEffect(() => {
    if (page === 'settings') {
      void loadSettings();
    }
  }, [loadSettings, page]);

  useEffect(() => {
    if (!activeSection || lastSyncedSectionIdRef.current === activeSection.id) {
      return;
    }

    syncEditorWithMarkdown(activeSection.markdown);
    lastSyncedSectionIdRef.current = activeSection.id;
  }, [activeSection, syncEditorWithMarkdown]);

  return (
    <div className="h-full w-full bg-[var(--bg)] text-[var(--text)]">
      <div className="grid h-full grid-cols-[272px_1fr]">
        <aside className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-2)]">
                <PenSquare className="size-4 text-[var(--primary)]" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">블로그 글 작성 어시스트</h1>
                <p className="text-xs text-[var(--text-muted)]">로컬 전용 에디터</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-3 py-3">
            {navItems.map((item) => {
              const active = page === item.key;
              const Icon = item.icon;
              return (
                <Button
                  key={item.key}
                  variant={active ? 'secondary' : 'ghost'}
                  className="w-full justify-start px-2.5 text-sm"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setPage(item.key)}
                >
                  <span className={`h-4 w-1 rounded-sm ${active ? 'bg-[var(--accent)]' : 'bg-transparent'}`} />
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-[var(--border)] px-4 py-4 text-xs text-[var(--text-muted)]">
            모델: <span className="font-mono text-[var(--text)]">gemini-2.5-flash</span>
          </div>
        </aside>

        <main className="overflow-auto">
          <div className="mx-auto w-full max-w-[1280px] px-8 py-6">
            <header className="mb-6 border-b border-[var(--border)] pb-4">
              <h2 className="text-xl font-semibold">{pageTitle}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{pageDescription}</p>
            </header>

            {page === 'generator' ? (
              <section className="space-y-6">
                <div className="grid grid-cols-1 gap-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 xl:grid-cols-[1fr_1fr_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="topic">주제</Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="예: 2026년 봄 제주 가족여행 코스 추천"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upload-image">참고 이미지 업로드</Label>
                    <Input
                      id="upload-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        const resolvedImagePath = file ? bridge.files.getPathForFile(file).trim() : '';
                        setImageName(file ? file.name : '');
                        setImagePath(resolvedImagePath || undefined);
                        setGenerateNotice(
                          file && !resolvedImagePath ? '이미지 파일 경로를 읽지 못했습니다. 다른 이미지 파일을 선택해주세요.' : ''
                        );
                      }}
                    />
                    <p className={`text-xs ${hasUnreadableSelectedImage ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}>
                      {hasUnreadableSelectedImage ? '이미지 파일 경로를 읽지 못했습니다.' : imageName || 'PNG, JPG, WEBP 1장'}
                    </p>
                  </div>

                  <div className="flex items-end">
                    <Button size="lg" disabled={generateDisabled} onClick={handleGenerate}>
                      <Sparkles className="size-4" />
                      {isGenerating ? '생성 중...' : 'AI 글 생성'}
                    </Button>
                  </div>
                </div>
                {generateNotice ? (
                  <p className="text-sm text-[var(--text-muted)]" role="status">
                    {generateNotice}
                  </p>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <section className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                      <div>
                        <h3 className="text-base font-semibold">본문 블록</h3>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {hasArticle ? `구분선 기준 ${articleSections.length}개 블록` : '생성된 본문 없음'}
                        </p>
                      </div>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {hasArticle ? (
                        articleSections.map((section, index) => {
                          const isEditing = activeSectionId === section.id;
                          const isSelected = selectedSectionIdSet.has(section.id);
                          const isDragging = draggedSectionId === section.id;
                          const isDragOver = dragOverSectionId === section.id && draggedSectionId !== section.id;
                          return (
                            <article
                              key={section.id}
                              className={[
                                'border-l-2 px-4 py-4 transition-colors',
                                isEditing
                                  ? 'border-[var(--accent)] bg-[var(--surface-2)]/60'
                                  : isSelected
                                    ? 'border-[var(--primary)] bg-[var(--surface-2)]/40'
                                    : 'border-transparent',
                                isDragOver ? 'bg-[var(--surface-2)] ring-1 ring-[var(--primary)]' : '',
                                isDragging ? 'opacity-60' : '',
                              ].join(' ')}
                              onDragOver={(event) => handleSectionDragOver(event, section.id)}
                              onDragLeave={(event) => handleSectionDragLeave(event, section.id)}
                              onDrop={(event) => handleSectionDrop(event, section.id)}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-2">
                                  <input
                                    type="checkbox"
                                    aria-label={`블록 ${index + 1} 선택`}
                                    checked={isSelected}
                                    onChange={() => handleToggleSectionSelected(section.id)}
                                    className="mt-2 size-4 shrink-0 rounded-[3px] border border-[var(--border)] bg-[var(--bg)] accent-[var(--primary)]"
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="mt-0.5 shrink-0 cursor-grab text-[var(--text-muted)] active:cursor-grabbing"
                                    draggable
                                    aria-label={`블록 ${index + 1} 드래그 이동`}
                                    onDragStart={(event) => handleSectionDragStart(event, section.id)}
                                    onDragEnd={handleSectionDragEnd}
                                  >
                                    <GripVertical className="size-4" />
                                  </Button>
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-[var(--accent)]">블록 {index + 1}</p>
                                    <h4 className="mt-1 truncate text-sm font-semibold">{getSectionTitle(section)}</h4>
                                  </div>
                                </div>
                                <div className="flex flex-wrap justify-end gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => handleCopySectionMarkdown(section)}>
                                    <FileText className="size-4" />
                                    마크다운 복사
                                  </Button>
                                  <Button size="sm" variant="secondary" onClick={() => handleCopySectionNaver(section)}>
                                    <Copy className="size-4" />
                                    네이버 복사
                                  </Button>
                                </div>
                              </div>
                              {isEditing ? (
                                <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
                                  <BlockNoteView editor={editor} onChange={handleEditorChange} />
                                </div>
                              ) : (
                                <pre
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`블록 ${index + 1} 편집`}
                                  className="mt-4 max-h-72 cursor-text overflow-auto whitespace-pre-wrap rounded-md bg-[var(--bg)] p-3 font-mono text-xs leading-6 text-[var(--text)] outline-none transition-colors hover:bg-[#010409] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                                  onClick={() => handleActivateSection(section)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleActivateSection(section);
                                    }
                                  }}
                                >
                                  {section.markdown}
                                </pre>
                              )}
                            </article>
                          );
                        })
                      ) : (
                        <div className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">생성된 본문이 없습니다.</div>
                      )}
                    </div>
                  </section>

                  <aside className="space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
                    <h3 className="text-sm font-semibold">작업 액션</h3>
                    <Button variant="secondary" className="w-full justify-start" onClick={handleCopyNaver}>
                      <Copy className="size-4" />
                      전체 글 네이버 복사
                    </Button>
                    <Button variant="secondary" className="w-full justify-start" onClick={handleCopyMarkdown}>
                      <FileText className="size-4" />
                      전체 마크다운 복사
                    </Button>
                    <div className="space-y-2 border-t border-[var(--border)] pt-3">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">
                        선택 작업{selectedSectionCount > 0 ? ` · ${selectedSectionCount}개 선택됨` : ''}
                      </p>
                      <Button variant="secondary" className="w-full justify-start" onClick={handleCopySelectedParagraphNaver}>
                        <Copy className="size-4" />
                        선택 문단 네이버 복사
                      </Button>
                      <Button variant="secondary" className="w-full justify-start" onClick={handleCopySelectedSectionsNaver}>
                        <Copy className="size-4" />
                        선택 블록 네이버 복사
                      </Button>
                      <Button variant="danger" className="w-full justify-start" onClick={handleDeleteSelectedSections}>
                        <Trash2 className="size-4" />
                        선택 블록 삭제
                      </Button>
                    </div>
                    <Button className="w-full justify-start" onClick={handleSaveArticle}>
                      <Save className="size-4" />
                      저장
                    </Button>
                    {saveNotice ? <p className="text-xs text-[var(--text-muted)]">{saveNotice}</p> : null}
                    {copyNotice ? <p className="text-xs text-[var(--text-muted)]">{copyNotice}</p> : null}
                    <div className="border-t border-[var(--border)] pt-3">
                      <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">출처</p>
                      {groundingSummary ? <p className="mb-2 text-xs text-[var(--text-muted)]">{groundingSummary}</p> : null}
                      <Button variant="secondary" className="w-full justify-start">
                        <Link2 className="size-4" />
                        출처 보기
                      </Button>
                    </div>
                  </aside>
                </div>
              </section>
            ) : (
              <section className="max-w-[1012px] space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="space-y-2 border-b border-[var(--border)] pb-5">
                  <Label htmlFor="api-key">Gemini API 키</Label>
                  <p className="text-xs text-[var(--text-muted)]">키 값은 마스킹되어 표시되며 로컬 저장소에 보관됩니다.</p>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(event) => {
                      markSettingsEdited();
                      setApiKey(event.target.value);
                      setApiKeyDirty(true);
                    }}
                    placeholder="AIzA... 형식의 키 입력"
                  />
                </div>

                <div className="space-y-2 border-b border-[var(--border)] pb-5">
                  <Label htmlFor="prompt-markdown">기본 프롬프트 (Markdown)</Label>
                  <p className="text-xs text-[var(--text-muted)]">주제/이미지 컨텍스트 변수를 포함한 기본 생성 프롬프트를 관리합니다.</p>
                  <Textarea
                    id="prompt-markdown"
                    className="min-h-44 font-mono leading-6"
                    value={promptMarkdown}
                    onChange={(event) => {
                      markSettingsEdited();
                      setPromptMarkdown(event.target.value);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output-path">저장 경로</Label>
                  <p className="text-xs text-[var(--text-muted)]">생성 결과(`article.md`, `naver.html`, `metadata.json`) 저장 위치</p>
                  <div className="flex gap-2">
                    <Input
                      id="output-path"
                      value={outputPath}
                      onChange={(event) => {
                        markSettingsEdited();
                        setOutputPath(event.target.value);
                      }}
                      placeholder="/Users/you/Documents/blog-output"
                    />
                    <Button variant="secondary" className="shrink-0" onClick={handleChooseOutputPath}>
                      <FolderOpen className="size-4" />
                      경로 탐색
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="secondary" onClick={handleTestApiKey}>
                    <KeyRound className="size-4" />
                    연결 테스트
                  </Button>
                  <Button onClick={saveSettings}>
                    <Save className="size-4" />
                    설정 저장
                  </Button>
                </div>
                {settingsNotice ? <p className="text-xs text-[var(--text-muted)]">{settingsNotice}</p> : null}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
