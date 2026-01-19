import { useState, useEffect, useCallback } from 'react';
import { LifestyleInputs, defaultInputs, Child } from './types';
import { calculateTotalCost, formatCurrencyFull } from './calculator';
import { QuizShell } from './components/QuizShell';
import { HousingScreen } from './components/screens/HousingScreen';
import { FamilyScreen } from './components/screens/FamilyScreen';
import { EducationScreen } from './components/screens/EducationScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { FoodScreen } from './components/screens/FoodScreen';
import { SimchaScreen } from './components/screens/SimchaScreen';
import { TransportScreen } from './components/screens/TransportScreen';
import { ExtrasScreen } from './components/screens/ExtrasScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import './styles.css';

const STORAGE_KEY = 'syrian-lifestyle-inputs';
const TOTAL_SCREENS = 9; // 8 quiz screens + 1 results

function loadSavedInputs(): LifestyleInputs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultInputs, ...JSON.parse(saved) };
    }
  } catch (e) {
    // Ignore parse errors
  }
  return defaultInputs;
}

export default function SyrianCalculator() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [inputs, setInputs] = useState<LifestyleInputs>(loadSavedInputs);

  // Save to localStorage whenever inputs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch (e) {
      // Ignore storage errors
    }
  }, [inputs]);

  const updateInput = useCallback(<K extends keyof LifestyleInputs>(field: K, value: LifestyleInputs[K]) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateChild = useCallback((childId: string, updates: Partial<Child>) => {
    setInputs((prev) => ({
      ...prev,
      children: prev.children.map((c) => (c.id === childId ? { ...c, ...updates } : c)),
    }));
  }, []);

  const addChild = useCallback(() => {
    const newChild: Child = {
      id: crypto.randomUUID(),
      age: 5,
      gender: 'boy',
      school: 'magen-david',
    };
    setInputs((prev) => ({ ...prev, children: [...prev.children, newChild] }));
  }, []);

  const removeChild = useCallback((childId: string) => {
    setInputs((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c.id !== childId),
    }));
  }, []);

  const goNext = useCallback(() => {
    setCurrentScreen((prev) => Math.min(prev + 1, TOTAL_SCREENS - 1));
  }, []);

  const goBack = useCallback(() => {
    setCurrentScreen((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToScreen = useCallback((screen: number) => {
    setCurrentScreen(Math.max(0, Math.min(screen, TOTAL_SCREENS - 1)));
  }, []);

  const restart = useCallback(() => {
    setInputs(defaultInputs);
    setCurrentScreen(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const costBreakdown = calculateTotalCost(inputs);

  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return <HousingScreen inputs={inputs} updateInput={updateInput} />;
      case 1:
        return (
          <FamilyScreen
            inputs={inputs}
            updateInput={updateInput}
            addChild={addChild}
            removeChild={removeChild}
            updateChild={updateChild}
          />
        );
      case 2:
        return <EducationScreen inputs={inputs} updateChild={updateChild} />;
      case 3:
        return <HelpScreen inputs={inputs} updateInput={updateInput} />;
      case 4:
        return <FoodScreen inputs={inputs} updateInput={updateInput} />;
      case 5:
        return <SimchaScreen inputs={inputs} updateInput={updateInput} />;
      case 6:
        return <TransportScreen inputs={inputs} updateInput={updateInput} />;
      case 7:
        return <ExtrasScreen inputs={inputs} updateInput={updateInput} />;
      case 8:
        return <ResultsScreen breakdown={costBreakdown} inputs={inputs} onRestart={restart} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentScreen) {
      case 1: // Family screen - at least understand if they have kids
        return true; // Allow proceeding even with no kids
      case 2: // Education - only show if they have school-age kids
        return true;
      default:
        return true;
    }
  };

  // Skip education screen if no school-age children (school starts at 2)
  const shouldSkipEducation = inputs.children.filter((c) => c.age >= 2 && c.age <= 17).length === 0;

  const handleNext = () => {
    if (currentScreen === 1 && shouldSkipEducation) {
      setCurrentScreen(3); // Skip to Help screen
    } else {
      goNext();
    }
  };

  const handleBack = () => {
    if (currentScreen === 3 && shouldSkipEducation) {
      setCurrentScreen(1); // Go back to Family screen
    } else {
      goBack();
    }
  };

  return (
    <div className="syrian-calculator">
      <QuizShell
        currentScreen={currentScreen}
        totalScreens={TOTAL_SCREENS}
        runningTotal={formatCurrencyFull(costBreakdown.totalAnnual)}
        onNext={handleNext}
        onBack={handleBack}
        canProceed={canProceed()}
        isLastScreen={currentScreen === TOTAL_SCREENS - 1}
      >
        {renderScreen()}
      </QuizShell>
    </div>
  );
}
