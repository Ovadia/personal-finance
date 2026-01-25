import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  RealModeInputs,
  defaultRealModeInputs,
  RealModeChild,
  Vehicle,
  LifestyleInputs,
} from './types';
import { generate30YearProjection, prefillFromQuickMode } from './realCalculator';
import { QuizShell } from './components/QuizShell';
import { HousingDetailsScreen } from './components/realScreens/HousingDetailsScreen';
import { IncomeScreen } from './components/realScreens/IncomeScreen';
import { ChildrenTimelineScreen } from './components/realScreens/ChildrenTimelineScreen';
import { EducationDetailsScreen } from './components/realScreens/EducationDetailsScreen';
import { LifestyleDetailsScreen } from './components/realScreens/LifestyleDetailsScreen';
import { TransportInsuranceScreen } from './components/realScreens/TransportInsuranceScreen';
import { RealResultsScreen } from './components/realScreens/RealResultsScreen';
import { formatCurrencyFull } from './calculator';
import './styles.css';

const STORAGE_KEY = 'syrian-real-mode-inputs';
const QUICK_MODE_KEY = 'syrian-lifestyle-inputs';
const TOTAL_SCREENS = 7; // 6 input screens + 1 results

function loadSavedInputs(forceFromQuickMode: boolean): RealModeInputs {
  try {
    // If coming from quick mode, always use fresh quick mode data
    if (forceFromQuickMode) {
      const quickSaved = localStorage.getItem(QUICK_MODE_KEY);
      if (quickSaved) {
        const quickInputs = JSON.parse(quickSaved) as LifestyleInputs;
        const prefilled = prefillFromQuickMode(quickInputs);
        return { ...defaultRealModeInputs, ...prefilled };
      }
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultRealModeInputs, ...JSON.parse(saved) };
    }

    // Try to pre-fill from Quick Mode
    const quickSaved = localStorage.getItem(QUICK_MODE_KEY);
    if (quickSaved) {
      const quickInputs = JSON.parse(quickSaved) as LifestyleInputs;
      const prefilled = prefillFromQuickMode(quickInputs);
      return { ...defaultRealModeInputs, ...prefilled };
    }
  } catch (e) {
    // Ignore parse errors
  }
  return defaultRealModeInputs;
}

export default function RealModeCalculator() {
  const [searchParams] = useSearchParams();
  const fromQuickMode = searchParams.get('from') === 'quick';
  const [currentScreen, setCurrentScreen] = useState(0);
  const [inputs, setInputs] = useState<RealModeInputs>(() => loadSavedInputs(fromQuickMode));

  // Save to localStorage whenever inputs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch (e) {
      // Ignore storage errors
    }
  }, [inputs]);

  const updateInput = useCallback(
    <K extends keyof RealModeInputs>(field: K, value: RealModeInputs[K]) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateChild = useCallback((childId: string, updates: Partial<RealModeChild>) => {
    setInputs((prev) => ({
      ...prev,
      children: prev.children.map((c) => (c.id === childId ? { ...c, ...updates } : c)),
    }));
  }, []);

  const addChild = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const newChild: RealModeChild = {
      id: crypto.randomUUID(),
      age: 5,
      gender: 'boy',
      school: 'magen-david',
      birthYear: currentYear - 5,
      expectedWeddingAge: 25,
    };
    setInputs((prev) => ({ ...prev, children: [...prev.children, newChild] }));
  }, []);

  const removeChild = useCallback((childId: string) => {
    setInputs((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c.id !== childId),
    }));
  }, []);

  const updateVehicle = useCallback((vehicleId: string, updates: Partial<Vehicle>) => {
    setInputs((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === vehicleId ? { ...v, ...updates } : v)),
    }));
  }, []);

  const addVehicle = useCallback(() => {
    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      type: 'suv',
      monthlyPayment: 500,
      paidOff: false,
    };
    setInputs((prev) => ({ ...prev, vehicles: [...prev.vehicles, newVehicle] }));
  }, []);

  const removeVehicle = useCallback((vehicleId: string) => {
    setInputs((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== vehicleId),
    }));
  }, []);

  const goNext = useCallback(() => {
    setCurrentScreen((prev) => Math.min(prev + 1, TOTAL_SCREENS - 1));
  }, []);

  const goBack = useCallback(() => {
    setCurrentScreen((prev) => Math.max(prev - 1, 0));
  }, []);

  const restart = useCallback(() => {
    setInputs(defaultRealModeInputs);
    setCurrentScreen(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const projection = generate30YearProjection(inputs);
  const currentYearTotal = projection.projection[0]?.totalAnnual || 0;

  const renderScreen = () => {
    switch (currentScreen) {
      case 0:
        return <HousingDetailsScreen inputs={inputs} updateInput={updateInput} />;
      case 1:
        return <IncomeScreen inputs={inputs} updateInput={updateInput} />;
      case 2:
        return (
          <ChildrenTimelineScreen
            inputs={inputs}
            updateInput={updateInput}
            addChild={addChild}
            removeChild={removeChild}
            updateChild={updateChild}
          />
        );
      case 3:
        return <EducationDetailsScreen inputs={inputs} updateInput={updateInput} />;
      case 4:
        return <LifestyleDetailsScreen inputs={inputs} updateInput={updateInput} />;
      case 5:
        return (
          <TransportInsuranceScreen
            inputs={inputs}
            updateInput={updateInput}
            addVehicle={addVehicle}
            removeVehicle={removeVehicle}
            updateVehicle={updateVehicle}
          />
        );
      case 6:
        return <RealResultsScreen projection={projection} inputs={inputs} onRestart={restart} />;
      default:
        return null;
    }
  };

  return (
    <div className="syrian-calculator real-mode">
      <QuizShell
        currentScreen={currentScreen}
        totalScreens={TOTAL_SCREENS}
        runningTotal={formatCurrencyFull(currentYearTotal)}
        onNext={goNext}
        onBack={goBack}
        canProceed={true}
        isLastScreen={currentScreen === TOTAL_SCREENS - 1}
      >
        {renderScreen()}
      </QuizShell>
    </div>
  );
}
