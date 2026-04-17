import {
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  FolderOpen,
  KeyRound,
  Link2,
  MousePointer2,
  PenSquare,
  Save,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';

type Page = 'generator' | 'settings';

const mockBlocks = [
  { id: 'b1', kind: '제목', text: '2026년 봄 제주 가족여행, 2박 3일 동선 가이드' },
  {
    id: 'b2',
    kind: '문단',
    text: '첫째 날은 동선이 짧은 동부권으로 묶어 이동 시간을 줄이고, 아이와 함께 가기 좋은 실내 장소를 오전에 배치하는 구성을 추천합니다.',
  },
  { id: 'b3', kind: '목록', text: '• 오전: 아쿠아리움\n• 점심: 함덕 해변 인근\n• 오후: 해안 산책 + 카페' },
];

const navItems: Array<{ key: Page; label: string; icon: typeof FileText }> = [
  { key: 'generator', label: '글 생성', icon: FileText },
  { key: 'settings', label: '설정', icon: Settings },
];

export default function App() {
  const [page, setPage] = useState<Page>('generator');
  const [topic, setTopic] = useState('');
  const [imageName, setImageName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [promptMarkdown, setPromptMarkdown] = useState('## 출력 형식\n- Markdown만 반환\n- 제목, 본문, 태그 포함');
  const [outputPath, setOutputPath] = useState('');

  const generateDisabled = useMemo(() => topic.trim().length === 0, [topic]);
  const pageTitle = page === 'generator' ? '블로그 글 생성' : '설정';
  const pageDescription =
    page === 'generator'
      ? '주제와 참고 이미지를 기반으로 AI 초안을 만들고 문단 단위로 편집합니다.'
      : 'API 키, 기본 프롬프트, 결과 저장 경로를 로컬에서 관리합니다.';

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
                        setImageName(file ? file.name : '');
                      }}
                    />
                    <p className="text-xs text-[var(--text-muted)]">{imageName || 'PNG, JPG, WEBP 1장'}</p>
                  </div>

                  <div className="flex items-end">
                    <Button size="lg" disabled={generateDisabled}>
                      <Sparkles className="size-4" />
                      AI 글 생성
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <section className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
                    <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                      <h3 className="text-base font-semibold">생성된 글 본문</h3>
                      <p className="text-xs text-[var(--text-muted)]">문단 hover 시 플로팅 액션 표시</p>
                    </div>
                    {mockBlocks.map((block) => (
                      <article key={block.id} className="group grid grid-cols-[1fr_auto] gap-3 border-b border-[var(--border)] px-4 py-4 last:border-b-0">
                        <div className="space-y-2">
                          <span className="inline-flex h-6 items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text-muted)]">
                            {block.kind}
                          </span>
                          <p className="whitespace-pre-line text-sm leading-6">{block.text}</p>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <Button variant="ghost" size="icon" title="선택">
                              <MousePointer2 className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" title="위로 이동">
                              <ChevronUp className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" title="아래로 이동">
                              <ChevronDown className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" title="복사">
                              <Copy className="size-3.5" />
                            </Button>
                            <Button variant="danger" size="icon" title="삭제">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </section>

                  <aside className="space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
                    <h3 className="text-sm font-semibold">작업 액션</h3>
                    <Button variant="secondary" className="w-full justify-start">
                      <Copy className="size-4" />
                      전체 글 네이버 복사
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <Copy className="size-4" />
                      선택 문단 복사
                    </Button>
                    <Button variant="secondary" className="w-full justify-start">
                      <FileText className="size-4" />
                      Markdown 복사
                    </Button>
                    <Button className="w-full justify-start">
                      <Save className="size-4" />
                      저장
                    </Button>
                    <div className="border-t border-[var(--border)] pt-3">
                      <p className="mb-2 text-xs font-semibold text-[var(--text-muted)]">출처</p>
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
                    onChange={(event) => setApiKey(event.target.value)}
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
                    onChange={(event) => setPromptMarkdown(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="output-path">저장 경로</Label>
                  <p className="text-xs text-[var(--text-muted)]">생성 결과(`article.md`, `naver.html`, `metadata.json`) 저장 위치</p>
                  <div className="flex gap-2">
                    <Input
                      id="output-path"
                      value={outputPath}
                      onChange={(event) => setOutputPath(event.target.value)}
                      placeholder="/Users/you/Documents/blog-output"
                    />
                    <Button variant="secondary" className="shrink-0">
                      <FolderOpen className="size-4" />
                      선택
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="secondary">
                    <KeyRound className="size-4" />
                    연결 테스트
                  </Button>
                  <Button>
                    <Save className="size-4" />
                    설정 저장
                  </Button>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
