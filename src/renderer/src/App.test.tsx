import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App shell', () => {
  it('renders app name and two-pane navigation', () => {
    render(<App />);

    expect(screen.getByText('블로그 글 작성 어시스트')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '글 생성' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '설정' })).toBeInTheDocument();
  });

  it('shows generator fields and disabled generate button with empty topic', () => {
    render(<App />);

    expect(screen.getByLabelText('주제')).toBeInTheDocument();
    expect(screen.getByLabelText('참고 이미지 업로드')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AI 글 생성' })).toBeDisabled();
  });

  it('switches to settings page', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '설정' }));

    expect(screen.getByLabelText('Gemini API 키')).toBeInTheDocument();
    expect(screen.getByLabelText('기본 프롬프트 (Markdown)')).toBeInTheDocument();
    expect(screen.getByLabelText('저장 경로')).toBeInTheDocument();
  });
});
