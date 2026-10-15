import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileQuestion,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sliders,
  Check,
  HelpCircle,
  Edit3,
  Award,
  Download,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { generateTestPdf } from '../lib/generateTestPdf';
import ThemeToggle from '../components/ui/ThemeToggle';
import type { Card } from '../types';

type TestFormat = 'multiple-choice' | 'written' | 'mixed';
type TestStage = 'config' | 'taking' | 'results';

interface TestQuestionItem {
  id: string; // unique question id
  card: Card;
  type: 'multiple-choice' | 'written';
  options?: string[]; // for multiple choice
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ');
}

export default function TestView() {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const { decks, activeCards, loadDecks, loadDeckCards, setView } = useAppStore();

  const deck = decks.find(d => d.id === deckId);
  const totalCardsCount = activeCards.length;

  // Test Stage
  const [stage, setStage] = useState<TestStage>('config');

  // Config State
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [testFormat, setTestFormat] = useState<TestFormat>('mixed');

  // Test Taking State
  const [questions, setQuestions] = useState<TestQuestionItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const topRef = useRef<HTMLDivElement>(null);

  // Load decks and deck cards
  useEffect(() => {
    if (decks.length === 0) loadDecks();
  }, [decks.length, loadDecks]);

  useEffect(() => {
    if (deckId) {
      loadDeckCards(deckId);
    }
  }, [deckId, loadDeckCards]);

  // Set default question count once cards are loaded
  useEffect(() => {
    if (totalCardsCount > 0 && stage === 'config') {
      const defaultCount = Math.min(totalCardsCount, 20);
      setQuestionCount(defaultCount);
    }
  }, [totalCardsCount, stage]);

  // Back Navigation
  const handleBackToDeck = () => {
    if (deckId) {
      setView('deck-overview', deckId);
      navigate(`/deck/${deckId}`);
    } else {
      setView('dashboard');
      navigate('/');
    }
  };

  // Helper to generate randomized questions based on count and format
  const createQuestions = (countToSelect: number, formatToUse: TestFormat): TestQuestionItem[] => {
    const shuffledCards = shuffleArray(activeCards);
    const count = Math.max(1, Math.min(countToSelect, totalCardsCount));
    const selectedCards = shuffledCards.slice(0, count);

    return selectedCards.map((card, idx) => {
      let qType: 'multiple-choice' | 'written' = 'multiple-choice';
      if (formatToUse === 'written') {
        qType = 'written';
      } else if (formatToUse === 'multiple-choice') {
        qType = 'multiple-choice';
      } else {
        // Mixed: alternate
        qType = idx % 2 === 0 ? 'multiple-choice' : 'written';
      }

      let options: string[] | undefined = undefined;
      if (qType === 'multiple-choice') {
        // Pick up to 3 distractors
        const otherCards = activeCards.filter(c => c.id !== card.id);
        const shuffledOthers = shuffleArray(otherCards);
        const distractors = shuffledOthers.slice(0, 3).map(c => c.term);
        const allOpts = shuffleArray([card.term, ...distractors]);
        options = allOpts;
      }

      return {
        id: `q-${card.id}-${idx}`,
        card,
        type: qType,
        options,
      };
    });
  };

  // Start Interactive Test
  const handleStartTest = () => {
    if (totalCardsCount === 0) return;
    const generated = createQuestions(questionCount, testFormat);
    setQuestions(generated);
    setUserAnswers({});
    setStage('taking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download PDF directly from Config setup screen
  const handleDownloadPdfFromConfig = () => {
    if (totalCardsCount === 0 || !deck) return;
    const generated = createQuestions(questionCount, testFormat);
    generateTestPdf(deck.title, generated);
  };

  // Download current interactive test as PDF
  const handleDownloadCurrentTestPdf = () => {
    if (!deck || questions.length === 0) return;
    generateTestPdf(deck.title, questions);
  };

  // Handle answering question
  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Submit test
  const handleSubmitTest = () => {
    setStage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to Config Screen
  const handleRetakeTest = () => {
    setStage('config');
    setUserAnswers({});
    setQuestions([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate answered count
  const answeredCount = useMemo(() => {
    return questions.filter(q => {
      const ans = userAnswers[q.id];
      return ans !== undefined && ans.trim().length > 0;
    }).length;
  }, [questions, userAnswers]);

  // Calculate grading results
  const results = useMemo(() => {
    if (stage !== 'results') return { correct: 0, missed: 0, percentage: 0, questionResults: [] };

    let correct = 0;
    const questionResults = questions.map(q => {
      const userAnswer = (userAnswers[q.id] || '').trim();
      const isAnswered = userAnswer.length > 0;
      let isCorrect = false;

      if (isAnswered) {
        if (q.type === 'multiple-choice') {
          isCorrect = userAnswer === q.card.term;
        } else {
          isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(q.card.term);
        }
      }

      if (isCorrect) correct++;

      return {
        question: q,
        userAnswer,
        isAnswered,
        isCorrect,
      };
    });

    const total = questions.length;
    const missed = total - correct;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      correct,
      missed,
      percentage,
      questionResults,
    };
  }, [stage, questions, userAnswers]);

  if (!deck) {
    if (decks.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen text-[var(--text-muted)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4" style={{ background: 'var(--bg)' }}>
        <h2 className="text-xl font-bold text-[var(--text)]">Deck not found</h2>
        <button
          onClick={handleBackToDeck}
          className="px-4 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] hover:border-[var(--accent)] cursor-pointer"
        >
          Back to Deck Overview
        </button>
      </div>
    );
  }

  return (
    <div ref={topRef} className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Back button with ONLY backwards arrow */}
          <button
            id="test-back-to-deck-btn"
            onClick={handleBackToDeck}
            className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] transition-all hover:border-[var(--accent)]/40 active:scale-95 cursor-pointer shadow-sm"
            title="Back to Deck"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Center Info depending on stage */}
          {stage === 'taking' && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold">
                <span className="text-[var(--text-muted)]">Progress:</span>
                <span className="font-mono font-bold text-[var(--text)]">
                  {answeredCount} / {questions.length} Answered
                </span>
              </div>

              <button
                id="header-download-pdf-btn"
                onClick={handleDownloadCurrentTestPdf}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-semibold transition-all hover:border-[var(--accent)]/40 cursor-pointer shadow-sm active:scale-95"
                title="Download this practice test as a printable PDF"
              >
                <Download size={13} className="text-[var(--accent)]" />
                <span>Download PDF</span>
              </button>
            </div>
          )}

          {stage === 'results' && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={14} />
              <span>Score: {results.percentage}%</span>
            </div>
          )}

          {/* Right: Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col">
        {totalCardsCount === 0 ? (
          <div className="text-center p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 my-auto">
            <p className="text-[var(--text-muted)] text-sm">
              This deck has no cards yet. Add cards to take a Practice Test!
            </p>
            <button
              onClick={() => {
                setView('editor', deck.id);
                navigate(`/editor/${deck.id}`);
              }}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold"
            >
              Add Cards
            </button>
          </div>
        ) : stage === 'config' ? (
          /* =========================================================================
             STAGE 1: TEST CONFIGURATION SCREEN
             ========================================================================= */
          <div className="w-full max-w-xl mx-auto min-h-[80vh] flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full space-y-8"
            >
            {/* Title & Deck Name */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 mb-2">
                <FileQuestion size={28} />
              </div>
              <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">
                Practice Test Setup
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Customize your practice test for <span className="font-semibold text-[var(--text)]">{deck.title}</span>.
              </p>
            </div>

            {/* Config Card */}
            <div className="p-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl space-y-7">
              {/* Question Count Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                    <Sliders size={16} className="text-[var(--accent)]" />
                    <span>Number of Questions</span>
                  </label>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)]">
                    Max: {totalCardsCount}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max={totalCardsCount}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                    className="flex-1 accent-[var(--accent)] cursor-pointer h-2 bg-[var(--surface-2)] rounded-lg"
                  />
                  <div className="w-16">
                    <input
                      type="number"
                      min="1"
                      max={totalCardsCount}
                      value={questionCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) setQuestionCount(1);
                        else setQuestionCount(Math.max(1, Math.min(val, totalCardsCount)));
                      }}
                      className="w-full text-center font-mono font-bold text-base px-2 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  The test will randomly select {questionCount} out of {totalCardsCount} cards.
                </p>
              </div>

              {/* Test Format Selection */}
              <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                <label className="text-sm font-bold text-[var(--text)] block">
                  Question Format
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mixed */}
                  <button
                    type="button"
                    onClick={() => setTestFormat('mixed')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      testFormat === 'mixed'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30'
                        : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        Recommended
                      </span>
                      {testFormat === 'mixed' && (
                        <Check size={16} className="text-[var(--accent)]" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text)]">Mixed</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Both Multiple Choice & Written recall
                      </div>
                    </div>
                  </button>

                  {/* Multiple Choice Only */}
                  <button
                    type="button"
                    onClick={() => setTestFormat('multiple-choice')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      testFormat === 'multiple-choice'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30'
                        : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <HelpCircle size={16} className="text-[var(--text-muted)]" />
                      {testFormat === 'multiple-choice' && (
                        <Check size={16} className="text-[var(--accent)]" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text)]">Multiple Choice</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Choose 1 of 4 possible options
                      </div>
                    </div>
                  </button>

                  {/* Short Answer Only */}
                  <button
                    type="button"
                    onClick={() => setTestFormat('written')}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      testFormat === 'written'
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/30'
                        : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Edit3 size={16} className="text-[var(--text-muted)]" />
                      {testFormat === 'written' && (
                        <Check size={16} className="text-[var(--accent)]" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text)]">Short Answer</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Type the correct term from memory
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Take Online vs Download PDF */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  id="start-test-btn"
                  onClick={handleStartTest}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-lg font-bold text-sm sm:text-base text-white shadow-xl shadow-[var(--accent)]/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
                >
                  <FileQuestion size={19} />
                  <span>Take Test Online ({questionCount} Qs)</span>
                </button>

                <button
                  id="download-test-pdf-btn"
                  onClick={handleDownloadPdfFromConfig}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-lg font-bold text-sm sm:text-base border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] hover:border-[var(--accent)]/50 text-[var(--text)] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  title="Generate and download printable PDF with separate answer key"
                >
                  <Download size={19} className="text-[var(--accent)]" />
                  <span>Download as PDF</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        ) : stage === 'taking' ? (
          /* =========================================================================
             STAGE 2: SCROLLABLE PRACTICE TEST VIEW
             ========================================================================= */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-8"
          >
            {/* Header info */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight">
                {deck.title} — Practice Test
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Answer all questions below. You can change your answers anytime before clicking Submit.
              </p>
            </div>

            {/* Questions List (Spacious roomy layout) */}
            <div className="space-y-8">
              {questions.map((q, idx) => {
                const currentAnswer = userAnswers[q.id] || '';
                const isAnswered = currentAnswer.trim().length > 0;

                return (
                  <div
                    key={q.id}
                    id={`test-question-card-${idx}`}
                    className={`p-7 sm:p-8 rounded-2xl border transition-all ${
                      isAnswered
                        ? 'border-[var(--accent)]/30 bg-[var(--surface)]'
                        : 'border-[var(--border)] bg-[var(--surface)]'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                        Question {idx + 1} of {questions.length}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        {q.type === 'multiple-choice' ? 'Multiple Choice' : 'Short Answer'}
                      </span>
                    </div>

                    {/* Question Prompt (Definition) */}
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] block mb-1.5">
                        Definition / Prompt
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] leading-relaxed">
                        {q.card.definition}
                      </h3>
                    </div>

                    {/* Question Input / Options */}
                    {q.type === 'multiple-choice' && q.options ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = currentAnswer === opt;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, opt)}
                              className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text)] ring-2 ring-[var(--accent)]/30 font-semibold'
                                  : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]/40 text-[var(--text-muted)] hover:text-[var(--text)]'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs mt-0.5 shrink-0 ${
                                  isSelected
                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                    : 'border-[var(--border)] text-[var(--text-muted)]'
                                }`}
                              >
                                {isSelected ? '✓' : String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-sm leading-snug break-words">
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          value={currentAnswer}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          placeholder="Type your answer (term) here..."
                          className="w-full p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] placeholder-[var(--text-muted)] text-sm sm:text-base focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30 focus:outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Bar at Bottom */}
            <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-sm text-[var(--text)]">
                  {answeredCount === questions.length ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-start">
                      <CheckCircle2 size={16} />
                      All {questions.length} questions answered! Ready to grade.
                    </span>
                  ) : (
                    <span>
                      {answeredCount} of {questions.length} questions answered
                    </span>
                  )}
                </div>
                {answeredCount < questions.length && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {questions.length - answeredCount} unanswered questions will be marked as skipped.
                  </p>
                )}
              </div>

              <button
                id="submit-test-btn"
                onClick={handleSubmitTest}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-base text-white shadow-xl shadow-[var(--accent)]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
              >
                <CheckCircle2 size={18} />
                <span>Submit Test</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             STAGE 3: GRADED TEST RESULTS & REVIEW VIEW
             ========================================================================= */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-8"
          >
            {/* Score Summary Header Card */}
            <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl text-center space-y-6">
              {/* Badge Icon */}
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
                  style={{
                    background:
                      results.percentage >= 80
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : results.percentage >= 60
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #e11d48, #be123c)',
                  }}
                >
                  <Award size={42} className="text-white" />
                </div>
              </div>

              {/* Title & Score */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-[var(--text)] tracking-tight">
                  {results.percentage >= 80
                    ? 'Excellent Work!'
                    : results.percentage >= 60
                    ? 'Good Effort!'
                    : 'Keep Practicing!'}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Here is your graded breakdown for <span className="font-semibold text-[var(--text)]">{deck.title}</span>.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                {/* Percentage */}
                <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Score
                  </span>
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-black ${
                      results.percentage >= 80
                        ? 'text-emerald-400'
                        : results.percentage >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {results.percentage}%
                  </span>
                </div>

                {/* Correct */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
                    Correct
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400">
                    {results.correct}
                  </span>
                </div>

                {/* Missed */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 block mb-1">
                    Missed
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-rose-400">
                    {results.missed}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="take-new-test-btn"
                  onClick={handleRetakeTest}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[var(--accent)]/30 hover:brightness-110 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #f43f5e)' }}
                >
                  <RotateCcw size={16} />
                  <span>Take New Test</span>
                </button>

                <button
                  id="results-download-pdf-btn"
                  onClick={handleDownloadCurrentTestPdf}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] hover:border-[var(--accent)]/40 text-[var(--text)] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Download this practice test as a printable PDF"
                >
                  <Download size={16} className="text-[var(--accent)]" />
                  <span>Download Test PDF</span>
                </button>

                <button
                  id="results-back-to-deck-btn"
                  onClick={handleBackToDeck}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Back"
                >
                  <ArrowLeft size={18} />
                </button>
              </div>
            </div>

            {/* Question-by-Question Review List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-bold text-[var(--text)]">
                  Question-by-Question Review ({results.questionResults.length})
                </h3>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {results.correct} of {results.questionResults.length} correct
                </span>
              </div>

              <div className="space-y-4">
                {results.questionResults.map((item, idx) => {
                  const { question, userAnswer, isAnswered, isCorrect } = item;

                  return (
                    <div
                      key={question.id}
                      id={`test-review-card-${idx}`}
                      className={`p-6 rounded-3xl border transition-all ${
                        isCorrect
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-rose-500/40 bg-rose-500/5'
                      }`}
                    >
                      {/* Review Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                          Question {idx + 1}
                        </span>

                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
                            <CheckCircle2 size={14} />
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30">
                            <XCircle size={14} />
                            {isAnswered ? 'Incorrect' : 'Skipped'}
                          </span>
                        )}
                      </div>

                      {/* Prompt */}
                      <div className="mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                          Definition
                        </span>
                        <div className="text-base font-bold text-[var(--text)]">
                          {question.card.definition}
                        </div>
                      </div>

                      {/* Answers Comparison */}
                      <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                        {/* User's Answer */}
                        <div className="flex items-start gap-2 text-sm">
                          <span className="font-semibold text-[var(--text-muted)] w-28 shrink-0">
                            Your Answer:
                          </span>
                          <span
                            className={`font-semibold flex items-center gap-1.5 ${
                              isCorrect
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              <XCircle size={15} />
                            )}
                            {isAnswered ? userAnswer : <span className="italic opacity-80">(Skipped)</span>}
                          </span>
                        </div>

                        {/* Correct Answer (if missed) */}
                        {!isCorrect && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="font-semibold text-[var(--text-muted)] w-28 shrink-0">
                              Correct Answer:
                            </span>
                            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 size={15} />
                              {question.card.term}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
