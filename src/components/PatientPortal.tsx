import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Sparkles, 
  CalendarPlus, 
  FileText, 
  FileDown, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Phone, 
  Activity,
  Heart,
  Sliders,
  Paperclip,
  UploadCloud,
  Download,
  Eye,
  X,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { Patient, AnamnesisRecord, Appointment, MedicalExam } from '../types';
import { CLINIC_SERVICES, DOCTOR_PROFILE } from '../data/mockData';
import { exportAnamnesisToWord, printAnamnesisPdf } from '../utils/exportUtils';
import { api } from '../services/api';

interface PatientPortalProps {
  currentPatient: Patient;
  patientRecord?: AnamnesisRecord;
  appointments: Appointment[];
  onBookAppointment: (appointmentData: { service: string; date: string; time: string; notes?: string }) => void;
  initialTab?: 'ficha' | 'agendar' | 'consultas' | 'exames';
}

export function PatientPortal({
  currentPatient,
  patientRecord,
  appointments,
  onBookAppointment,
  initialTab = 'ficha'
}: PatientPortalProps) {
  const [activeTab, setActiveTab] = useState<'ficha' | 'agendar' | 'consultas' | 'exames'>(initialTab);

  // Exams State
  const [exams, setExams] = useState<MedicalExam[]>(currentPatient.exams || []);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState<MedicalExam | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [examCategory, setExamCategory] = useState<MedicalExam['category']>('Outro');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examNotes, setExamNotes] = useState('');
  const [examFileUrl, setExamFileUrl] = useState('');
  const [examFileName, setExamFileName] = useState('');
  const [examFileType, setExamFileType] = useState('application/pdf');
  const [examFileSize, setExamFileSize] = useState('');
  const [isUploadingExam, setIsUploadingExam] = useState(false);

  // Booking Form State
  const [selectedService, setSelectedService] = useState(CLINIC_SERVICES[0].name);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const myAppointments = appointments.filter(
    a => a.patientId === currentPatient.id || a.patientEmail === currentPatient.email
  );

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) return;

    onBookAppointment({
      service: selectedService,
      date: bookingDate,
      time: bookingTime,
      notes: bookingNotes
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab('consultas');
    }, 1500);
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

  const handleUploadExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle || !examFileUrl) {
      alert('Por favor informe o título e selecione um arquivo.');
      return;
    }

    setIsUploadingExam(true);
    try {
      const examData: MedicalExam = {
        title: examTitle.trim(),
        category: examCategory,
        date: examDate,
        fileUrl: examFileUrl,
        fileName: examFileName || 'exame_paciente.pdf',
        fileType: examFileType,
        fileSize: examFileSize,
        notes: examNotes.trim(),
        uploadedBy: 'PATIENT',
        uploadedByName: currentPatient.name
      };

      const result = await api.uploadMyExam(examData);
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
      alert(err.message || 'Erro ao enviar exame');
    } finally {
      setIsUploadingExam(false);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="patient-portal">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 inline-block mb-2">
              Área Exclusiva do Paciente
            </span>
            <h1 className="font-serif-luxury text-3xl font-bold tracking-tight text-white">
              Olá, {currentPatient.name.split(' ')[0]}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg">
              Consulte seu prontuário clínico de massoterapia e agende novas consultas diretamente com a Dra. Yasmin.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('agendar')}
            className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>+ Marcar Nova Consulta</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl px-6 p-2 shadow-xs gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ficha')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'ficha'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Minha Ficha & Prontuário</span>
        </button>

        <button
          onClick={() => setActiveTab('agendar')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'agendar'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Marcar Nova Consulta</span>
        </button>

        <button
          onClick={() => setActiveTab('consultas')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'consultas'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Minhas Consultas ({myAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exames')}
          className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'exames'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Paperclip className="w-4 h-4" />
          <span>Meus Exames & Laudos ({exams.length})</span>
        </button>
      </div>

      {/* TAB 1: MINHA FICHA */}
      {activeTab === 'ficha' && (
        <div className="space-y-6">
          {/* Card com os dados do prontuário inseridos pela Dra. Yasmin */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-serif-luxury text-xl font-bold text-slate-900">
                  Seu Plano de Tratamento Clínico
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                Status: {currentPatient.status === 'ativo' ? 'Em Tratamento' : currentPatient.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80">
                <span className="text-xs font-bold text-teal-900 block mb-1">Procedimento Prescrito:</span>
                <p className="text-sm font-bold text-slate-900">{currentPatient.treatmentType || 'Massoterapia & Estética Corporal'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-600 block mb-1">Sessões Realizadas:</span>
                <p className="text-sm font-bold text-slate-900">{currentPatient.totalSessions || 0} sessões</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-600 block mb-1">Última Visita:</span>
                <p className="text-sm font-bold text-slate-900">
                  {currentPatient.lastVisit ? new Date(currentPatient.lastVisit).toLocaleDateString('pt-BR') : 'Aguardando 1ª sessão'}
                </p>
              </div>
            </div>

            {currentPatient.notes && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-700 block mb-1">Observações Clínicas da Dra. Yasmin:</span>
                <p className="text-xs sm:text-sm text-slate-800 italic">"{currentPatient.notes}"</p>
              </div>
            )}
          </div>

          {patientRecord ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
                    Sua Ficha de Anamnese & Parecer Clínico
                  </h2>
                  <p className="text-xs text-slate-500">
                    Preenchida com Dra. Yasmin em {new Date(patientRecord.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportAnamnesisToWord(patientRecord, currentPatient)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <FileDown className="w-3.5 h-3.5 text-teal-700" />
                    <span>Baixar Word (.doc)</span>
                  </button>
                  <button
                    onClick={printAnamnesisPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-700" />
                    <span>Imprimir / PDF</span>
                  </button>
                </div>
              </div>

              {/* Doctor's Advice Box */}
              <div className="p-5 bg-teal-50/40 border border-teal-200 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" /> Orientações da Dra. Yasmin:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 italic leading-relaxed">
                  "{patientRecord.clinicalObservations || 'Plano de tratamento em andamento.'}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-600 block mb-1">Seu Objetivo Principal:</span>
                  <p className="text-sm font-semibold text-slate-900">{patientRecord.mainObjective}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-xs font-bold text-slate-600 block mb-1">Sua Preferência de Pressão:</span>
                  <span className="inline-block px-3 py-1 bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs rounded-lg">
                    {patientRecord.pressurePreference}
                  </span>
                </div>
              </div>

              {/* Areas marked */}
              {patientRecord.bodyAreas && patientRecord.bodyAreas.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Áreas de Foco no seu Atendimento:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {patientRecord.bodyAreas.map(area => (
                      <span key={area.id} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                        {area.name} ({area.type.replace('_', ' ')})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Activity className="w-10 h-10 text-teal-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">
                Sua anamnese será realizada na sua primeira consulta
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                A Dra. Yasmin fará uma avaliação personalizada detalhada no consultório para identificar suas necessidades corporais.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MARCAR NOVA CONSULTA */}
      {activeTab === 'agendar' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
              Solicitar Agendamento de Consulta
            </h2>
            <p className="text-xs text-slate-500">
              Escolha a terapia desejada, a data e horário de sua preferência. A Dra. Yasmin confirmará seu horário.
            </p>
          </div>

          {bookingSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sua solicitação de consulta foi enviada com sucesso para a Dra. Yasmin!</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Service Selection Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                1. Selecione o Procedimento:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CLINIC_SERVICES.map((serv) => {
                  const isSelected = selectedService === serv.name;
                  return (
                    <button
                      key={serv.id}
                      type="button"
                      onClick={() => setSelectedService(serv.name)}
                      className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-teal-700">{serv.duration}</span>
                          <span className="text-xs font-bold text-slate-900">{serv.price}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{serv.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{serv.desc}</p>
                      </div>
                      {isSelected && (
                        <span className="mt-3 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                          ✓ Selecionado
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Data Desejada *
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Horário Preferencial *
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900 font-medium"
                >
                  {['09:00', '10:30', '14:00', '15:30', '17:00', '18:30'].map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. Observações / Queixa do Dia (Opcional)
              </label>
              <textarea
                rows={2}
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Ex: Muita dor na região dos ombros ou foco em drenagem para diminuir o inchaço..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Confirmar Solicitação de Agendamento</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MINHAS CONSULTAS */}
      {activeTab === 'consultas' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-luxury text-2xl font-bold text-slate-900">
              Seus Agendamentos
            </h2>
            <button
              onClick={() => setActiveTab('agendar')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition cursor-pointer"
            >
              + Marcar Outra
            </button>
          </div>

          {myAppointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Você ainda não possui consultas agendadas. Clique em "Marcar Nova Consulta" acima.
            </div>
          ) : (
            <div className="space-y-3">
              {myAppointments.map(app => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{app.service}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📅 {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time}
                    </p>
                    {app.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">"{app.notes}"</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                    app.status === 'confirmado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    app.status === 'agendado' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {app.status === 'confirmado' ? 'Confirmado' : 'Aguardando Confirmação'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEUS EXAMES & LAUDOS */}
      {activeTab === 'exames' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-teal-600" />
                  <span>Meus Exames, Imagens & Laudos</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Arquivos compartilhados entre você e a Dra. Yasmin. Você pode enviar exames de sangue, laudos médicos ou fotos para avaliação clínica.
                </p>
              </div>

              <button
                onClick={() => setIsExamModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Enviar Novo Exame</span>
              </button>
            </div>

            {exams.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-800 text-sm">Nenhum exame cadastrado ainda</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Envie exames complementares ou visualize laudos disponibilizados pela Dra. Yasmin em suas consultas.
                  </p>
                </div>
                <button
                  onClick={() => setIsExamModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:border-teal-500 hover:text-teal-600 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enviar Meu Primeiro Exame</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam, index) => {
                  const examId = exam._id || exam.id || `exam_${index}`;
                  const isImage = exam.fileType?.startsWith('image/') || exam.fileUrl?.startsWith('data:image/');
                  const isDoctor = exam.uploadedBy === 'DOCTOR';

                  return (
                    <div 
                      key={examId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition space-y-3"
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
                              {exam.fileName} {exam.fileSize && `• ${exam.fileSize}`}
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
                        </div>
                      </div>

                      {exam.notes && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700">
                          <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                            {isDoctor ? 'Parecer da Dra. Yasmin:' : 'Minha Observação:'}
                          </span>
                          <p>{exam.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Data: <b>{new Date(exam.date).toLocaleDateString('pt-BR')}</b></span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDoctor ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isDoctor ? 'Anexado pela Dra. Yasmin' : 'Enviado por Você'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR NOVO EXAME */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-lg">Enviar Exame ou Laudo</h3>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome / Título do Exame *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hemograma completo, Exame de Imagem, Liberação do Cardiologista..."
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Exame</label>
                  <select
                    value={examCategory}
                    onChange={(e) => setExamCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  >
                    <option value="Laboratorial">Laboratorial (Sangue / Urina)</option>
                    <option value="Laudo Médico">Laudo Médico / Atestado</option>
                    <option value="Imagem (Raio-X, RM, TC)">Exame de Imagem (RM, Tomografia, Raio-X)</option>
                    <option value="Ultrassom">Ultrassom</option>
                    <option value="Outro">Outro Documento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data da Realização</label>
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
                  Selecione o Arquivo (PDF ou Imagem) *
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
                  Observações para a Dra. Yasmin (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Exame realizado recentemente a pedido do meu ortopedista..."
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
                      <span>Enviando para o consultório...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enviar Exame</span>
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
