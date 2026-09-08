import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Plus, 
  Search,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { Appointment, Patient } from '../types';
import { CLINIC_SERVICES } from '../data/mockData';

interface AppointmentsManagerProps {
  appointments: Appointment[];
  patients: Patient[];
  onUpdateStatus: (appointmentId: string, newStatus: 'pendente' | 'confirmado' | 'realizado' | 'cancelado') => void;
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
}

export function AppointmentsManager({
  appointments,
  patients,
  onUpdateStatus,
  onAddAppointment
}: AppointmentsManagerProps) {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New appointment state
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedService, setSelectedService] = useState(CLINIC_SERVICES[0].name);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [notes, setNotes] = useState('');

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !selectedDate || !selectedTime) return;

    onAddAppointment({
      patientId: patient.id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmado',
      notes,
      durationMinutes: 60
    });

    setIsAddModalOpen(false);
    setNotes('');
  };

  const filteredAppointments = appointments.filter((app) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      app.patientName.toLowerCase().includes(term) ||
      app.service.toLowerCase().includes(term) ||
      app.patientPhone.includes(term);

    const matchesStatus = filterStatus === 'todos' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="appointments-manager">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
            Agenda Clínica
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Controle de Consultas & Agendamentos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie horários solicitados por pacientes e confirme sessões de massoterapia e estética.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Agendamento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente, procedimento ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-44 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendentes de Confirmação</option>
            <option value="agendado">Solicitados</option>
            <option value="confirmado">Confirmados</option>
            <option value="realizado">Realizados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Appointments Cards */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          filteredAppointments.map((app) => (
            <div
              key={app.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 hover:border-teal-300 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 shrink-0">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{app.patientName}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                      app.status === 'confirmado' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      (app.status === 'pendente' || app.status === 'agendado') ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      app.status === 'realizado' ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {app.status === 'confirmado' ? 'Confirmado' :
                       app.status === 'pendente' ? 'Pendente de Aprovação' :
                       app.status === 'agendado' ? 'Solicitado pelo Paciente' :
                       app.status === 'realizado' ? 'Realizado' : 'Cancelado'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-teal-700 mt-0.5">{app.service}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>📅 {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time}</span>
                    <span>📞 {app.patientPhone}</span>
                  </p>
                  {app.notes && (
                    <p className="text-xs text-slate-600 italic mt-1 bg-slate-50 border border-slate-200/60 p-2 rounded-lg">
                      "{app.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2">
                {(app.status === 'pendente' || app.status === 'agendado') && (
                  <button
                    onClick={() => onUpdateStatus(app.id, 'confirmado')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprovar Consulta</span>
                  </button>
                )}

                {app.status === 'confirmado' && (
                  <button
                    onClick={() => onUpdateStatus(app.id, 'realizado')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Marcar como Realizado</span>
                  </button>
                )}

                {app.status !== 'cancelado' && app.status !== 'realizado' && (
                  <button
                    onClick={() => onUpdateStatus(app.id, 'cancelado')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Cancelar Agendamento"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Novo Agendamento */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Novo Agendamento na Clínica</h3>
            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Selecione o Paciente *</label>
                {patients.length > 0 ? (
                  <select
                    value={selectedPatientId || patients[0]?.id || ''}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    Nenhum paciente cadastrado ainda. Cadastre um paciente na aba <strong>Pacientes</strong> para vincular a esta consulta.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Procedimento Clínico *</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                >
                  {CLINIC_SERVICES.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.duration})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horário *</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    {['08:30', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações da Sessão</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Foco nas costas, trazer toalhas..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={patients.length === 0}
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
