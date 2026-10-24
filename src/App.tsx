import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { AssessmentForm } from './components/AssessmentForm';
import { LoadingState } from './components/LoadingState';
import { ResultDisplay } from './components/ResultDisplay';
import { ErrorState } from './components/ErrorState';
import { FarmAssessmentFormData, RiskAssessmentResult } from './types';

type AppView = 'home' | 'form' | 'loading' | 'result' | 'error';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [formData, setFormData] = useState<FarmAssessmentFormData | null>(null);
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isNetworkError, setIsNetworkError] = useState<boolean>(false);

  const handleStartAssessment = () => {
    setCurrentView('form');
  };

  const executeAssessment = async (dataToSubmit: FarmAssessmentFormData) => {
    setFormData(dataToSubmit);
    setCurrentView('loading');
    setErrorMessage('');
    setIsNetworkError(false);

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          district: dataToSubmit.district,
          farmType: dataToSubmit.farmType,
          itemType: dataToSubmit.itemType,
          symptoms: dataToSubmit.symptoms,
          rainfall: dataToSubmit.rainfall,
          waterAvailability: dataToSubmit.waterAvailability,
          photo: dataToSubmit.photo
            ? {
                data: dataToSubmit.photo.data,
                mimeType: dataToSubmit.photo.mimeType,
              }
            : null,
        }),
      });

      if (!response.ok) {
        let errText = 'Server returned an error response';
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            errText = errJson.error;
          }
        } catch {
          errText = `HTTP Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errText);
      }

      const assessmentResult: RiskAssessmentResult = await response.json();

      // Safe validation on returned fields
      if (
        typeof assessmentResult.risk_score !== 'number' ||
        !assessmentResult.risk_level ||
        !assessmentResult.primary_threat ||
        !assessmentResult.assessment_summary ||
        !Array.isArray(assessmentResult.immediate_actions)
      ) {
        throw new Error('Received an incomplete or invalid assessment structure from the screening engine.');
      }

      setResult(assessmentResult);
      setCurrentView('result');
    } catch (err: any) {
      console.error('Assessment execution failed:', err);
      const isNet =
        err.name === 'TypeError' ||
        err.message.toLowerCase().includes('failed to fetch') ||
        err.message.toLowerCase().includes('network') ||
        !navigator.onLine;

      setIsNetworkError(isNet);
      setErrorMessage(
        isNet
          ? 'Network connection failed. Please check your internet or mobile data signal and try again.'
          : err.message || 'An unexpected error occurred while screening the farm threat.'
      );
      setCurrentView('error');
    }
  };

  const handleNewAssessment = () => {
    setResult(null);
    setFormData(null);
    setCurrentView('form');
  };

  const handleEditAssessment = () => {
    setCurrentView('form');
  };

  const handleRetry = () => {
    if (formData) {
      executeAssessment(formData);
    } else {
      setCurrentView('form');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f6] text-[#1a2a1d] flex flex-col selection:bg-emerald-200">
      <Header onGoHome={() => setCurrentView('home')} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8">
        {currentView === 'home' && (
          <HomePage onStartAssessment={handleStartAssessment} />
        )}

        {currentView === 'form' && (
          <AssessmentForm
            initialData={formData || undefined}
            onSubmit={executeAssessment}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'loading' && formData && (
          <LoadingState
            district={formData.district}
            itemType={formData.itemType}
          />
        )}

        {currentView === 'result' && result && formData && (
          <ResultDisplay
            result={result}
            formData={formData}
            onNewAssessment={handleNewAssessment}
            onEditAssessment={handleEditAssessment}
          />
        )}

        {currentView === 'error' && (
          <ErrorState
            errorMessage={errorMessage}
            isNetworkError={isNetworkError}
            onRetry={handleRetry}
            onBackToEdit={handleEditAssessment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-4 px-4 text-center text-xs text-stone-500 bg-white/60">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FarmerShield AI • Uganda Smallholder Advisory</span>
          <span className="text-[11px] text-stone-400">Low-bandwidth optimized</span>
        </div>
      </footer>
    </div>
  );
}
