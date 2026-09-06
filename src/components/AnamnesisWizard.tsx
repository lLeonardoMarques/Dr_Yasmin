import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  Save, 
  Heart, 
  Activity, 
  ShieldAlert, 
  FileCheck, 
  FileDown, 
  Printer, 
  User, 
  CheckCircle2,
  Sliders,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { 
  Patient, 
  AnamnesisQuestion, 
  AnamnesisCategory, 
  AnamnesisRecord, 
  BodyAreaSelection 
} from '../types';
import { BODY_AREAS_LIST } from '../data/mockData';
import { exportAnamnesisToWord, printAnamnesisPdf } from '../utils/exportUtils';

interface AnamnesisWizardProps {
  patient: Patient;
  questions: AnamnesisQuestion[];
  categories: AnamnesisCategory[];
  doctorName: string;
  onSaveAnamnesis: (record: AnamnesisRecord) => void;
  onCancel: () => void;
  initialRecord?: AnamnesisRecord;
}

export function AnamnesisWizard({
  patient,
  questions,
  categories,
  doctorName,
  onSaveAnamnesis,
  onCancel,
  initialRecord
}: AnamnesisWizardProps) {
  // Answers state
  const [answers, setAnswers] = useState<Record<string, any>>(initialRecord?.answers || {});
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<BodyAreaSelection[]>(
    initialRecord?.bodyAreas || []
  );
  const [pressurePreference, setPressurePreference] = useState<
    'Suave / Relaxante' | 'Média / Terapêutica' | 'Firme / Profunda' | 'Vigorosa / Modeladora'
  >(initialRecord?.pressurePreference || 'Média / Terapêutica');
  const [mainObjective, setMainObjective] = useState(
    initialRecord?.mainObjective || patient.notes || ''
  );
  const [doctorNotes, setDoctorNotes] = useState(
    initialRecord?.clinicalObservations || ''
  );
  const [recommendedTechniques, setRecommendedTechniques] = useState<string[]>(
    initialRecord?.recommendedTechniques || [
      'Massagem Relaxante com Aromaterapia',
      'Drenagem Linfática Manual Especializada'
    ]
  );

  // Question navigation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinalReview, setIsFinalReview] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Agora');

  // Total steps: all questions + 1 body map step + 1 final review
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentStepIndex];
  const currentCategory = categories.find(c => c.id === currentQuestion?.categoryId);

  // Autosave simulation effect
  useEffect(() => {
    setIsAutosaving(true);
    const timer = setTimeout(() => {
      setIsAutosaving(false);
      const now = new Date();
      setLastSavedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [answers, selectedBodyAreas, pressurePreference, mainObjective, doctorNotes]);

  // Handle answers update
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleToggleCheckboxOption = (questionId: string, optionValue: string) => {
    const currentValues: string[] = Array.isArray(answers[questionId]) ? answers[questionId] : [];
    if (currentValues.includes(optionValue)) {
      handleAnswerChange(questionId, currentValues.filter(v => v !== optionValue));
    } else {
      handleAnswerChange(questionId, [...currentValues, optionValue]);
    }
  };

  // Body area toggle
  const handleToggleBodyArea = (areaId: string, areaName: string) => {
    const exists = selectedBodyAreas.find(b => b.id === areaId);
    if (exists) {
      setSelectedBodyAreas(prev => prev.filter(b => b.id !== areaId));
    } else {
      setSelectedBodyAreas(prev => [
        ...prev,
        { id: areaId, name: areaName, type: 'dor_tensao', intensity: 7 }
      ]);
    }
  };

  const handleChangeAreaType = (areaId: string, newType: 'dor_tensao' | 'estetica_gordura' | 'retencao_celulite' | 'relaxamento') => {
    setSelectedBodyAreas(prev => prev.map(b => b.id === areaId ? { ...b, type: newType } : b));
  };

  // Detect contraindications & alerts based on answers
  const detectedAlerts: string[] = [];
  if (answers['q_hipertensao'] === 'hipertensao') {
    detectedAlerts.push('Hipertensão Arterial: Monitorar pressão antes da sessão e evitar aquecimento excessivo.');
  }
  if (Array.isArray(answers['q_circulacao'])) {
    if (answers['q_circulacao'].includes('trombose')) {
      detectedAlerts.push('Histórico de Trombose / Flebite: Contraindicação absoluta para massagem profunda em MMII.');
    }
    if (answers['q_circulacao'].includes('varizes')) {
      detectedAlerts.push('Varizes proeminentes: Evitar pressões pontuais e manobras mecânicas vigorosas sobre os vasos.');
    }
  }
  if (answers['q_gestante'] === 'gestante') {
    detectedAlerts.push('Gestante: Exige posicionamento em decúbito lateral e protocolo específico com drenagem suave.');
  }
  if (answers['q_alergias'] && answers['q_alergias'].length > 3) {
    detectedAlerts.push(`Sensibilidade / Alergia informada: "${answers['q_alergias']}"`);
  }

  // Handle navigation
  const handleNext = () => {
    if (currentStepIndex < totalQuestions - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsFinalReview(true);
    }
  };

  const handlePrevious = () => {
    if (isFinalReview) {
      setIsFinalReview(false);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Final save
  const handleSaveFinal = () => {
    const finalRecord: AnamnesisRecord = {
      id: initialRecord?.id || `anam-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctorName: doctorName || 'Dra. Yasmin Oliveira',
      status: 'concluido',
      answers,
      bodyAreas: selectedBodyAreas,
      pressurePreference,
      mainObjective: mainObjective || answers['q_objetivo_principal'] || 'Bem-estar e estética corporal',
      detectedAlerts,
      clinicalObservations: doctorNotes || answers['q_observacoes_dra'] || 'Avaliação corporal e anamnese concluídas com sucesso.',
      recommendedTechniques
    };

    onSaveAnamnesis(finalRecord);
  };

  // Progress percentage
  const progressPercent = isFinalReview 
    ? 100 
    : Math.round(((currentStepIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="anamnesis-wizard-container">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                Ficha de Anamnese Passo a Passo
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-800">
                Paciente: {patient.name}
              </span>
            </div>
            <h1 className="font-serif-luxury text-2xl font-bold text-slate-900 mt-0.5">
              Massoterapia & Estética Corporal
            </h1>
          </div>
        </div>

        {/* Autosave status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            {isAutosaving ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Salvo automaticamente ({lastSavedTime})</span>
              </>
            )}
          </div>
          <button
            onClick={handleSaveFinal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Ficha</span>
          </button>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span>
            {isFinalReview ? 'Revisão Final da Ficha' : `Pergunta ${currentStepIndex + 1} de ${totalQuestions}`}
          </span>
          <span className="font-bold text-teal-700">{progressPercent}% concluído</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* QUESTION-BY-QUESTION CARD */}
      {!isFinalReview ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8 min-h-[420px] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Category Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {currentCategory?.title || 'Avaliação Clínica'}
              </span>
              {currentQuestion?.required && (
                <span className="text-[11px] text-slate-400 font-medium">* Pergunta obrigatória</span>
              )}
            </div>

            {/* Question Title & Prompt */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentQuestion?.label}
              </h2>
              {currentQuestion?.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500">
                  {currentQuestion.subtitle}
                </p>
              )}
            </div>

            {/* QUESTION INPUTS BASED ON TYPE */}
            <div className="pt-2">
              {/* 1. SELECT */}
              {currentQuestion?.type === 'select' && (
                <div className="space-y-2 max-w-xl">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswerChange(currentQuestion.id, opt.value)}
                        className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-semibold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white'
                        }`}
                      >
                        <span className="text-sm">{opt.label}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. RADIO */}
              {currentQuestion?.type === 'radio' && (
                <div className="space-y-2.5 max-w-xl">
                  {currentQuestion.options?.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswerChange(currentQuestion.id, opt.value)}
                        className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/80 text-teal-950 font-semibold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm">{opt.label}</span>
                        </div>
                        {opt.isContraindication && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Alerta Clínico
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. CHECKBOX (Multi-select) */}
              {currentQuestion?.type === 'checkbox' && (
                <div className="space-y-2.5 max-w-xl">
                  {currentQuestion.options?.map((opt) => {
                    const selectedList: string[] = Array.isArray(answers[currentQuestion.id])
                      ? answers[currentQuestion.id]
                      : [];
                    const isSelected = selectedList.includes(opt.value);

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleToggleCheckboxOption(currentQuestion.id, opt.value)}
                        className={`w-full p-4 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-semibold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-sm">{opt.label}</span>
                        </div>
                        {opt.isContraindication && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Atenção
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. SCALE (1 a 5 ou 0 a 10) */}
              {currentQuestion?.type === 'scale' && (
                <div className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {currentQuestion.options?.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleAnswerChange(currentQuestion.id, opt.value)}
                          className={`p-4 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xl font-bold">{opt.value}</span>
                          <span className="text-[11px] leading-tight opacity-90">{opt.label.split('-')[1] || opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. TEXTAREA */}
              {currentQuestion?.type === 'textarea' && (
                <div className="max-w-2xl space-y-2">
                  <textarea
                    rows={4}
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder || 'Digite aqui as informações detalhadas...'}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                  <p className="text-xs text-slate-400">
                    Preenchimento flexível para enriquecer o prontuário da Dra. Yasmin.
                  </p>
                </div>
              )}

              {/* 6. TEXT */}
              {currentQuestion?.type === 'text' && (
                <div className="max-w-xl">
                  <input
                    type="text"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder || 'Sua resposta'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              )}

              {/* Alert trigger highlight */}
              {currentQuestion?.isAlertTrigger && currentQuestion.alertMessage && (
                <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 max-w-xl text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Observação Clínica: </span>
                    {currentQuestion.alertMessage}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Pergunta Anterior</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              <span>{currentStepIndex === totalQuestions - 1 ? 'Revisar e Concluir Ficha' : 'Próxima Pergunta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* FINAL STRUCTURED REVIEW SCREEN ("MONTANDO A FICHA FINAL") */
        <div className="space-y-6">
          {/* Review Banner */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                Ficha Final Estruturada
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold mt-0.5">
                Prontuário & Avaliação Corporal Final
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Confira o mapa de queixas, preferências de pressão e adicione seu parecer clínico como Dra. Yasmin.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFinalReview(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Editar Respostas
              </button>
              <button
                type="button"
                onClick={handleSaveFinal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Salvar Definitivamente</span>
              </button>
            </div>
          </div>

          {/* Clinical Alerts Box */}
          {detectedAlerts.length > 0 ? (
            <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <span>Contraindicações e Alertas Clínicos Detectados ({detectedAlerts.length})</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-xs text-amber-900">
                {detectedAlerts.map((alert, idx) => (
                  <li key={idx} className="font-medium">{alert}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Nenhuma contraindicação clínica restritiva identificada nesta anamnese.</span>
            </div>
          )}

          {/* Interactive Body Map & Critical Zones */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Mapa de Zonas Corporais & Queixas Principais</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique nas áreas do corpo para marcar tensões, dores, foco de drenagem ou redução de medidas:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {BODY_AREAS_LIST.map((area) => {
                const isMarked = selectedBodyAreas.find(b => b.id === area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => handleToggleBodyArea(area.id, area.name)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isMarked
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium uppercase">{area.group}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isMarked ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                      }`}>
                        {isMarked && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold mt-2">{area.name}</span>
                  </button>
                );
              })}
            </div>

            {/* If zones are marked, allow selecting the specific condition */}
            {selectedBodyAreas.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-700">Classificação das áreas marcadas:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBodyAreas.map((area) => (
                    <div 
                      key={area.id} 
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2"
                    >
                      <span className="font-bold text-slate-800">{area.name}:</span>
                      <select
                        value={area.type}
                        onChange={(e) => handleChangeAreaType(area.id, e.target.value as any)}
                        className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-medium text-teal-800 focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="dor_tensao">Dor & Tensão Muscular</option>
                        <option value="retencao_celulite">Retenção & Celulite</option>
                        <option value="estetica_gordura">Gordura Localizada</option>
                        <option value="relaxamento">Relaxamento Sensorial</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pressure Preference Selector */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Intensidade de Toque / Pressão da Massagem</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Suave / Relaxante', desc: 'Toque envolvente e ritmo lento para relaxamento profundo' },
                { title: 'Média / Terapêutica', desc: 'Firme na medida ideal, dissipando tensões sem dor aguda' },
                { title: 'Firme / Profunda', desc: 'Desativação de pontos-gatilho e liberação miofascial profunda' },
                { title: 'Vigorosa / Modeladora', desc: 'Manobras rápidas e firmes para contorno e gordura' }
              ].map((p) => {
                const isSelected = pressurePreference === p.title;
                return (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => setPressurePreference(p.title as any)}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{p.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{p.desc}</p>
                    </div>
                    {isSelected && (
                      <span className="mt-2 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                        ✓ Selecionado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parecer Clínico da Dra. Yasmin */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Conduta Clínica e Prescrição (Dra. Yasmin)</span>
            </h3>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Descreva a avaliação palpatória do tecido, presença de nódulos, recomendação de número de sessões e home-care..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Action Buttons: Save, Word Export, Print PDF */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIsFinalReview(false)}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              ← Voltar às Perguntas
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const tempRecord: AnamnesisRecord = {
                    id: `temp-${Date.now()}`,
                    patientId: patient.id,
                    patientName: patient.name,
                    patientEmail: patient.email,
                    patientPhone: patient.phone,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    doctorName: doctorName || 'Dra. Yasmin',
                    status: 'concluido',
                    answers,
                    bodyAreas: selectedBodyAreas,
                    pressurePreference,
                    mainObjective: mainObjective || 'Avaliação corporal',
                    detectedAlerts,
                    clinicalObservations: doctorNotes,
                    recommendedTechniques
                  };
                  exportAnamnesisToWord(tempRecord, patient);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                title="Exportar para Microsoft Word (.doc)"
              >
                <FileDown className="w-4 h-4 text-teal-700" />
                <span>Exportar Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={printAnamnesisPdf}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                title="Imprimir ou Salvar em PDF"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Imprimir / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSaveFinal}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Ficha no Perfil do Paciente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
