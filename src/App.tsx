import { useEffect } from 'react';
import { HashRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import DashboardView from './views/DashboardView';
import DeckEditorView from './views/DeckEditorView';
import StudyView from './views/StudyView';
import LearnView from './views/LearnView';
import DeckOverviewView from './views/DeckOverviewView';
import MatchView from './views/MatchView';
import TestView from './views/TestView';

function DeckOverviewRoute() {
  const { deckId } = useParams<{ deckId: string }>();
  const { setView } = useAppStore();

  useEffect(() => {
    if (deckId) {
      setView('deck-overview', deckId);
    }
  }, [deckId, setView]);

  return <DeckOverviewView />;
}

function DeckEditorRoute() {
  const { deckId } = useParams<{ deckId: string }>();
  const { setView } = useAppStore();

  useEffect(() => {
    if (deckId) {
      setView('editor', deckId);
    }
  }, [deckId, setView]);

  return <DeckEditorView />;
}

function StudyRoute() {
  const { deckId } = useParams<{ deckId: string }>();
  const { setView } = useAppStore();

  useEffect(() => {
    if (deckId) {
      setView('study', deckId);
    }
  }, [deckId, setView]);

  return <StudyView />;
}

function LearnRoute() {
  const { deckId } = useParams<{ deckId: string }>();
  const { setView } = useAppStore();

  useEffect(() => {
    if (deckId) {
      setView('learn', deckId);
    }
  }, [deckId, setView]);

  return <LearnView />;
}

function MatchRoute() {
  const { deckId } = useParams<{ deckId: string }>();
  const { setView } = useAppStore();

  useEffect(() => {
    if (deckId) {
      setView('match', deckId);
    }
  }, [deckId, setView]);

  return <MatchView />;
}

function TestRoute() {
  const { deckId } = useParams<{ deckId: string }>();
  const { setView } = useAppStore();

  useEffect(() => {
    if (deckId) {
      setView('test', deckId);
    }
  }, [deckId, setView]);

  return <TestView />;
}

function DashboardRoute() {
  const { setView } = useAppStore();

  useEffect(() => {
    setView('dashboard');
  }, [setView]);

  return <DashboardView />;
}

function AppContent() {
  const navigate = useNavigate();
  const { isDark, loadDecks } = useAppStore();

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Synchronize store setView with router navigation
  useEffect(() => {
    const unsub = useAppStore.subscribe((state, prevState) => {
      if (state.view !== prevState.view || state.activeDeckId !== prevState.activeDeckId) {
        if (state.view === 'dashboard') {
          navigate('/');
        } else if (state.view === 'deck-overview' && state.activeDeckId) {
          navigate(`/deck/${state.activeDeckId}`);
        } else if (state.view === 'editor' && state.activeDeckId) {
          navigate(`/editor/${state.activeDeckId}`);
        } else if (state.view === 'study' && state.activeDeckId) {
          navigate(`/study/${state.activeDeckId}`);
        } else if (state.view === 'learn' && state.activeDeckId) {
          navigate(`/learn/${state.activeDeckId}`);
        } else if (state.view === 'match' && state.activeDeckId) {
          navigate(`/match/${state.activeDeckId}`);
        } else if (state.view === 'test' && state.activeDeckId) {
          navigate(`/test/${state.activeDeckId}`);
        }
      }
    });
    return unsub;
  }, [navigate]);

  return (
    <div className="min-h-screen w-full" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Routes>
        <Route path="/" element={<DashboardRoute />} />
        <Route path="/deck/:deckId" element={<DeckOverviewRoute />} />
        <Route path="/overview/:deckId" element={<DeckOverviewRoute />} />
        <Route path="/editor/:deckId" element={<DeckEditorRoute />} />
        <Route path="/study/:deckId" element={<StudyRoute />} />
        <Route path="/learn/:deckId" element={<LearnRoute />} />
        <Route path="/match/:deckId" element={<MatchRoute />} />
        <Route path="/test/:deckId" element={<TestRoute />} />
        <Route path="*" element={<DashboardRoute />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
