import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileDown, 
  Printer, 
  FileSpreadsheet, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Activity, 
  Sliders, 
  Sparkles, 
  FileText,
  ShieldCheck,
  ChevronRight,
  Ruler,
  Paperclip,
  UploadCloud,
  Download,
  Eye,
  Trash2,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Patient, AnamnesisRecord, EvolutionSession, Appointment, MedicalExam } from '../types';
import { exportAnamnesisToWord, printAnamnesisPdf } from '../utils/exportUtils';
import { api } from '../services/api';

interface PatientRecordViewProps {
  patient: Patient;
  record?: AnamnesisRecord;
  evolutions: EvolutionSession[];
  appointments: Appointment[];
  onBack: () => void;
  onStartAnamnesis: () => void;
  onAddEvolution: (evolution: Omit<EvolutionSession, 'id' | 'patientId'>) => void;
}

export function PatientRecordView({
  patient,
  record,
  evolutions,
  appointments,
  onBack,
  onStartAnamnesis,
  onAddEvolution
}: PatientRecordViewProps) {
  const [activeTab, setActiveTab] = useState<'anamnese' | 'evolucoes' | 'agendamentos' | 'exames'>('anamnese');
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);

  // Exams State
  const [exams, setExams] = useState<MedicalExam[]>(patient.exams || []);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState<MedicalExam | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examCategory, setExamCategory] = useState<MedicalExam['category']>('Laudo Médico');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examNotes, setExamNotes] = useState('');
  const [examFileUrl, setExamFileUrl] = useState('');
  const [examFileName, setExamFileName] = useState('');
  const [examFileType, setExamFileType] = useState('application/pdf');
  const [examFileSize, setExamFileSize] = useState('');
  const [isUploadingExam, setIsUploadingExam] = useState(false);

  // New evolution state
  const [sessionNumber, setSessionNumber] = useState(evolutions.length + 1);
  const [technique, setTechnique] = useState('Drenagem Linfática Manual + Liberação Miofascial');
  const [areasTreated, setAreasTreated] = useState('Trapézio, Lombar e Pernas');
  const [patientFeedback, setPatientFeedback] = useState('');
  const [therapistNotes, setTherapistNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [abdomen, setAbdomen] = useState('');
  const [hips, setHips] = useState('');

  const handleSaveEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvolution({
      sessionNumber,
      date: new Date().toISOString().split('T')[0],
      technique,
      areasTreated: areasTreated.split(',').map(s => s.trim()),
      patientFeedback: patientFeedback || 'Relatou sensação de alívio e bem-estar.',
      therapistNotes: therapistNotes || 'Procedimento realizado sem intercorrências.',
      measurements: {
        weight: weight ? parseFloat(weight) : undefined,
        waist: waist ? parseFloat(waist) : undefined,
        abdomen: abdomen ? parseFloat(abdomen) : undefined,
        hips: hips ? parseFloat(hips) : undefined
      }
    });
    setIsEvolutionModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('O arquivo selecionado deve ter no máximo 15MB.');
      return;
    }

    setExamFileName(file.name);
    setExamFileType(file.type || 'application/pdf');
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    setExamFileSize(`${sizeInMb} MB`);
    if (!examTitle) {
      setExamTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setExamFileUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !examFileUrl) {
      alert('Por favor informe o título e selecione um arquivo de exame.');
      return;
    }

    setIsUploadingExam(true);
    try {
      const examData: MedicalExam = {
        title: examTitle.trim(),
        category: examCategory,
        date: examDate,
        fileUrl: examFileUrl,
        fileName: examFileName || 'exame_anexo.pdf',
        fileType: examFileType,
        fileSize: examFileSize,
        notes: examNotes.trim(),
        uploadedBy: 'DOCTOR',
        uploadedByName: 'Dra. Yasmin Oliveira'
      };

      const result = await api.uploadExam(patient.id, examData);
      if (result && result.exam) {
        setExams(prev => [...prev, result.exam]);
      } else {
        setExams(prev => [...prev, { ...examData, id: `exam_${Date.now()}` }]);
      }

      setIsExamModalOpen(false);
      setExamTitle('');
      setExamFileUrl('');
      setExamFileName('');
      setExamNotes('');
    } catch (err: any) {
      alert(err.message || 'Erro ao anexar exame');
    } finally {
      setIsUploadingExam(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este exame anexado?')) return;
    try {
      await api.deleteExam(patient.id, examId);
      setExams(prev => prev.filter(e => (e.id !== examId && e._id !== examId)));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir exame');
    }
  };

  const handleDownloadExam = (exam: MedicalExam) => {
    const link = document.createElement('a');
    link.href = exam.fileUrl;
    link.download = exam.fileName || `${exam.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const patientAppointments = appointments.filter(a => a.patientId === patient.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="patient-record-view">
      {/* Top Patient Summary Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Voltar para a lista"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-900">
                  {patient.name}
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  patient.status === 'ativo' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {patient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">
                {patient.treatmentType || 'Massoterapia & Estética Corporal'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {record ? (
              <>
                <button
                  onClick={() => exportAnamnesisToWord(record, patient)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                  title="Baixar prontuário completo em formato Word (.doc)"
                >
                  <FileDown className="w-4 h-4 text-teal-700" />
                  <span>Exportar Word (.doc)</span>
                </button>
                <button
                  onClick={printAnamnesisPdf}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                  title="Imprimir ou Salvar em PDF"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={onStartAnamnesis}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Atualizar Anamnese</span>
                </button>
              </>
            ) : (
              <button
                onClick={onStartAnamnesis}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Preencher Anamnese Agora</span>
              </button>
            )}
          </div>
        </div>

        {/* Patient Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Telefone / WhatsApp</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{patient.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">E-mail</span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate">{patient.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Profissão</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{patient.occupation || 'Não informada'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Sessões Realizadas</span>
            <span className="font-bold text-teal-700 mt-0.5 block">{patient.totalSessions || 0} sessões</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('anamnese')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'anamnese'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ficha de Anamnese</span>
          </button>
          <button
            onClick={() => setActiveTab('evolucoes')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'evolucoes'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Evolução & Medidas ({evolutions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('agendamentos')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'agendamentos'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agendamentos ({patientAppointments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('exames')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'exames'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Exames & Laudos ({exams.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FICHA DE ANAMNESE TIMBRADA (PRINTABLE & WORD-READY) */}
      {activeTab === 'anamnese' && (
        <div className="space-y-6">
          {record ? (
            <div 
              id="printable-report"
              className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8"
            >
              {/* Clinical Printable Header */}
              <div className="text-center pb-6 border-b border-slate-200 space-y-1">
                <span className="text-[11px] uppercase tracking-widest text-teal-800 font-bold">
                  Toque da Beleza • Dra. Yasmin Oliveira
                </span>
                <h2 className="font-serif-luxury text-3xl font-bold text-slate-900">
                  Ficha de Anamnese & Avaliação Corporal
                </h2>
                <p className="text-xs text-slate-500">
                  Especialidade: Massoterapia Clínica, Drenagem Linfática e Estética Corporal
                </p>
                <p className="text-[11px] text-slate-400">
                  Data da Avaliação: {new Date(record.createdAt).toLocaleDateString('pt-BR')} • Responsável: {record.doctorName}
                </p>
              </div>

              {/* Alerts Callout */}
              {record.detectedAlerts && record.detectedAlerts.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Alertas Clínicos & Contraindicações Identificadas:</span>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
                    {record.detectedAlerts.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Objectives & Pressure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-600 block mb-1">Objetivo Declarado:</span>
                  <p className="text-sm font-semibold text-slate-900">{record.mainObjective || 'Não informado'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-600 block mb-1">Preferência de Pressão:</span>
                  <span className="inline-block px-3 py-1 bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs rounded-lg">
                    {record.pressurePreference}
                  </span>
                </div>
              </div>

              {/* Body Areas */}
              {record.bodyAreas && record.bodyAreas.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Zonas Corporais Críticas Marcadas:</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {record.bodyAreas.map((area) => (
                      <div key={area.id} className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl text-xs">
                        <p className="font-bold text-teal-950">{area.name}</p>
                        <p className="text-[11px] text-slate-600 capitalize mt-0.5">
                          {area.type.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Answers */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <span>Respostas do Questionário de Hábitos e Histórico</span>
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {Object.entries(record.answers || {}).map(([key, value]) => {
                    if (key === 'q_observacoes_dra') return null;
                    const label = key.replace(/^q_/, '').replace(/_/g, ' ').toUpperCase();
                    const displayValue = Array.isArray(value) ? value.join(', ') : String(value);

                    return (
                      <div key={key} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs hover:bg-slate-50/50">
                        <span className="font-semibold text-slate-600 sm:col-span-1">{label}:</span>
                        <span className="text-slate-900 sm:col-span-2 font-medium">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Doctor's Technical Diagnostic */}
              <div className="p-5 bg-teal-50/40 border border-teal-200 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> Parecer Técnico e Conduta Clínica (Dra. Yasmin)
                </span>
                <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                  "{record.answers?.q_observacoes_dra || record.clinicalObservations || 'Sem observações adicionais.'}"
                </p>
              </div>

              {/* Signature Block for Print */}
              <div className="pt-10 border-t border-slate-200 text-center space-y-1">
                <div className="w-64 h-px bg-slate-300 mx-auto mb-2" />
                <p className="font-serif-luxury text-lg font-bold text-slate-900">{record.doctorName}</p>
                <p className="text-xs text-slate-500">Terapeuta Corporal & Massoterapeuta Clínica</p>
                <p className="text-[10px] text-slate-400">Emissão oficial do prontuário digital</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Nenhuma anamnese registrada para este paciente
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  A Dra. Yasmin pode iniciar o preenchimento passo a passo com perguntas personalizadas de massoterapia e estética.
                </p>
              </div>
              <button
                onClick={onStartAnamnesis}
                className="px-5 py-2.5 text-xs font-semibold bg-teal-600 text-white rounded-xl shadow-xs hover:bg-teal-700 transition cursor-pointer"
              >
                Iniciar Ficha de Anamnese Passo a Passo
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVOLUTIONS & BODY MEASUREMENTS */}
      {activeTab === 'evolucoes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Evoluções Clínicas das Sessões</h3>
              <p className="text-xs text-slate-500">Registro contínuo de resposta tecidual, medidas corporais e feedbacks.</p>
            </div>
            <button
              onClick={() => setIsEvolutionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nova Sessão</span>
            </button>
          </div>

          {evolutions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-700">Nenhuma sessão registrada ainda.</p>
              <p className="text-xs text-slate-500 mt-1">Adicione as anotações após o atendimento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evolutions.map((evo) => (
                <div key={evo.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs flex items-center justify-center">
                        #{evo.sessionNumber}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{evo.technique}</h4>
                        <span className="text-[11px] text-slate-400">Data: {new Date(evo.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="font-bold text-slate-700 block mb-1">Feedback do Paciente:</span>
                      <p className="text-slate-600">{evo.patientFeedback}</p>
                    </div>
                    <div className="p-3 bg-teal-50/40 rounded-xl border border-teal-100">
                      <span className="font-bold text-teal-950 block mb-1">Anotações da Dra. Yasmin:</span>
                      <p className="text-slate-700">{evo.therapistNotes}</p>
                    </div>
                  </div>

                  {evo.measurements && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
                      {evo.measurements.weight && <span className="text-slate-600">Peso: <b>{evo.measurements.weight} kg</b></span>}
                      {evo.measurements.waist && <span className="text-slate-600">Cintura: <b>{evo.measurements.waist} cm</b></span>}
                      {evo.measurements.abdomen && <span className="text-slate-600">Abdômen: <b>{evo.measurements.abdomen} cm</b></span>}
                      {evo.measurements.hips && <span className="text-slate-600">Quadril: <b>{evo.measurements.hips} cm</b></span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPOINTMENTS */}
      {activeTab === 'agendamentos' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Histórico e Próximas Consultas</h3>
          {patientAppointments.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhum agendamento encontrado para este paciente.</p>
          ) : (
            <div className="space-y-2">
              {patientAppointments.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{app.service}</h4>
                    <p className="text-xs text-slate-500">
                      {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time} ({app.durationMinutes} min)
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    app.status === 'confirmado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    app.status === 'agendado' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EXAMES MÉDICOS & LAUDOS ANEXADOS */}
      {activeTab === 'exames' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-teal-600" />
                  <span>Exames Médicos, Laudos & Imagens</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Anexe resultados laboratoriais, exames de imagem e laudos de liberação médica.
                </p>
              </div>

              <button
                onClick={() => setIsExamModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Anexar Novo Exame</span>
              </button>
            </div>

            {/* List of Exams */}
            {exams.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Nenhum exame anexado</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Laudos médicos, exames de sangue ou diagnósticos por imagem anexados aqui ficam salvos no prontuário do paciente e sincronizados no MongoDB.
                  </p>
                </div>
                <button
                  onClick={() => setIsExamModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-600 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Primeiro Exame</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam, index) => {
                  const examId = exam._id || exam.id || `exam_${index}`;
                  const isImage = exam.fileType?.startsWith('image/') || exam.fileUrl?.startsWith('data:image/');
                  
                  return (
                    <div 
                      key={examId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isImage 
                              ? 'bg-purple-50 text-purple-600 border-purple-200' 
                              : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}>
                            {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200/80 text-slate-700 mb-1">
                              {exam.category}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm truncate" title={exam.title}>
                              {exam.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              Arquivo: {exam.fileName} {exam.fileSize && `• ${exam.fileSize}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setSelectedExamForPreview(exam)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200 cursor-pointer"
                            title="Visualizar exame"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadExam(exam)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200 cursor-pointer"
                            title="Baixar exame"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(examId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-100 cursor-pointer"
                            title="Excluir exame"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {exam.notes && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700">
                          <span className="font-bold text-slate-900 block text-[11px] mb-0.5">Parecer / Observação Clínica:</span>
                          <p>{exam.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span>Data do Exame: <b>{new Date(exam.date).toLocaleDateString('pt-BR')}</b></span>
                        <span>Por: <b>{exam.uploadedByName || (exam.uploadedBy === 'DOCTOR' ? 'Dra. Yasmin' : 'Paciente')}</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NOVA SESSÃO / EVOLUÇÃO */}
      {isEvolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Registrar Evolução de Sessão</h3>
            <form onSubmit={handleSaveEvolution} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Técnica Aplicada</label>
                <input
                  type="text"
                  required
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Regiões Trabalhadas</label>
                <input
                  type="text"
                  value={areasTreated}
                  onChange={(e) => setAreasTreated(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Cintura (cm)</label>
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Abdômen (cm)</label>
                  <input
                    type="number"
                    value={abdomen}
                    onChange={(e) => setAbdomen(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Quadril (cm)</label>
                  <input
                    type="number"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback do Paciente</label>
                <textarea
                  rows={2}
                  value={patientFeedback}
                  onChange={(e) => setPatientFeedback(e.target.value)}
                  placeholder="Como o paciente se sentiu pós-sessão..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Anotações da Dra. Yasmin</label>
                <textarea
                  rows={2}
                  value={therapistNotes}
                  onChange={(e) => setTherapistNotes(e.target.value)}
                  placeholder="Resposta da fáscia, edema residual, orientações para a próxima sessão..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEvolutionModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  Salvar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ANEXAR NOVO EXAME */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-lg">Anexar Exame Clínico</h3>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título / Identificação do Exame *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hemograma, Ultrassonografia Abdome, Ressonância Lombar..."
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  >
                    <option value="Laudo Médico">Laudo Médico / Liberação</option>
                    <option value="Laboratorial">Laboratorial (Sangue, Urina)</option>
                    <option value="Imagem (Raio-X, RM, TC)">Imagem (Raio-X, RM, TC)</option>
                    <option value="Ultrassom">Ultrassonografia</option>
                    <option value="Outro">Outro Exame</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data de Realização</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Arquivo do Exame (PDF ou Imagem) *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer relative">
                  <input
                    type="file"
                    required={!examFileUrl}
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-teal-600 mx-auto mb-1" />
                  {examFileName ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-teal-800">{examFileName}</p>
                      <p className="text-[11px] text-slate-500">{examFileSize} • Clique para trocar</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-700">Clique ou arraste o arquivo aqui</p>
                      <p className="text-[11px] text-slate-400">PDF, JPG, PNG, WEBP (até 15MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações Clínicas / Parecer da Doutora
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Liberada para drenagem linfática; sem contraindicação vascular..."
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingExam || !examFileUrl}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {isUploadingExam ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando no banco...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Salvar no Prontuário</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR EXAME / LAUDO */}
      {selectedExamForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider block">
                  {selectedExamForPreview.category}
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                  {selectedExamForPreview.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadExam(selectedExamForPreview)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 rounded-xl text-slate-700 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar</span>
                </button>
                <button
                  onClick={() => setSelectedExamForPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 bg-slate-900/5 overflow-auto flex items-center justify-center min-h-[350px]">
              {selectedExamForPreview.fileType?.startsWith('image/') || selectedExamForPreview.fileUrl?.startsWith('data:image/') ? (
                <img 
                  src={selectedExamForPreview.fileUrl} 
                  alt={selectedExamForPreview.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe
                  src={selectedExamForPreview.fileUrl}
                  title={selectedExamForPreview.title}
                  className="w-full h-[65vh] rounded-lg border border-slate-200 bg-white"
                />
              )}
            </div>

            {selectedExamForPreview.notes && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Observações:</span>
                <p>{selectedExamForPreview.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
