import { ReactNode } from 'react';

interface QuizShellProps {
  currentScreen: number;
  totalScreens: number;
  runningTotal: string;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  isLastScreen: boolean;
  children: ReactNode;
}

export function QuizShell({
  currentScreen,
  totalScreens,
  runningTotal,
  onNext,
  onBack,
  canProceed,
  isLastScreen,
  children,
}: QuizShellProps) {
  // Don't show header/footer on results screen
  const isResultsScreen = currentScreen === totalScreens - 1;

  return (
    <div className="quiz-container">
      {!isResultsScreen && (
        <header className="quiz-header">
          <div className="progress-bar">
            {Array.from({ length: totalScreens - 1 }).map((_, i) => (
              <div
                key={i}
                className={`progress-step ${i < currentScreen ? 'completed' : ''} ${i === currentScreen ? 'current' : ''}`}
              />
            ))}
          </div>
          <div className="running-total">
            <div className="running-total-label">Estimated Annual Cost</div>
            <div className="running-total-amount">{runningTotal}</div>
          </div>
        </header>
      )}

      <main className="quiz-content">
        <div className="screen-enter" key={currentScreen}>
          {children}
        </div>
      </main>

      {!isResultsScreen && (
        <footer className="quiz-footer">
          <div className="nav-buttons">
            {currentScreen > 0 && (
              <button className="btn btn-secondary" onClick={onBack}>
                Back
              </button>
            )}
            <button className="btn btn-primary" onClick={onNext} disabled={!canProceed}>
              {currentScreen === totalScreens - 2 ? 'See My Results' : 'Next'}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
