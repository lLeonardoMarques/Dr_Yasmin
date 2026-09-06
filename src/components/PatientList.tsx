import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Phone, 
  Mail, 
  ChevronRight, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  FileDown,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Patient, AnamnesisRecord } from '../types';
import { exportAnamnesisToWord } from '../utils/exportUtils';

interface PatientListProps {
  patients: Patient[];
  anamnesisRecords: AnamnesisRecord[];
  onSelectPatient: (patient: Patient) => void;
  onStartAnamnesisForPatient: (patient: Patient) => void;
  onAddNewPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'totalSessions'>) => Patient | Promise<Patient>;
  onSync?: () => void;
  isSyncing?: boolean;
  onDeletePatient?: (id: string) => void;
}

export function PatientList({
  patients,
  anamnesisRecords,
  onSelectPatient,
  onStartAnamnesisForPatient,
  onAddNewPatient,
  onSync,
  isSyncing,
  onDeletePatient
}: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [treatmentFilter, setTreatmentFilter] = useState<string>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newGender, setNewGender] = useState<'Feminino' | 'Masculino' | 'Outro'>('Feminino');
  const [newOccupation, setNewOccupation] = useState('');
  const [newEmergencyContact, setNewEmergencyContact] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');
  const [newTreatmentType, setNewTreatmentType] = useState('Massagem Relaxante com Aromaterapia');
  const [newNotes, setNewNotes] = useState('');
  const [startAnamnesisImmediately, setStartAnamnesisImmediately] = useState(true);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        patient.name.toLowerCase().includes(term) ||
        patient.phone.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term) ||
        (patient.notes && patient.notes.toLowerCase().includes(term));

      const matchesStatus = 
        statusFilter === 'todos' || patient.status === statusFilter;

      const matchesTreatment = 
        treatmentFilter === 'todos' || 
        (patient.treatmentType && patient.treatmentType.toLowerCase().includes(treatmentFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesTreatment;
    });
  }, [patients, searchTerm, statusFilter, treatmentFilter]);

  const handleCreatePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) return;

    const created = await onAddNewPatient({
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      birthDate: newBirthDate,
      gender: newGender,
      occupation: newOccupation,
      emergencyContact: newEmergencyContact,
      emergencyPhone: newEmergencyPhone,
      treatmentType: newTreatmentType,
      status: 'ativo',
      notes: newNotes
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewBirthDate('');
    setNewOccupation('');
    setNewNotes('');

    if (startAnamnesisImmediately) {
      onStartAnamnesisForPatient(created);
    } else {
      onSelectPatient(created);
    }
  };

  // Quick stats
  const activeCount = patients.filter(p => p.status === 'ativo').length;
  const totalAnamneses = anamnesisRecords.length;

  return (
    <div className="space-y-6" id="patient-management-section">
      {/* Top Banner with Quick Actions & Stats */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold border border-teal-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" /> Controle de Prontuários & Anamneses
              </span>
            </div>
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Painel Clínico de Pacientes
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Gerencie fichas de massoterapia e estética corporal, histórico de sessões e inicie novas anamneses interativas com a Dra. Yasmin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-teal-300 font-semibold text-xs rounded-xl border border-slate-700 shadow-xs transition cursor-pointer"
                title="Sincronizar com banco de dados MongoDB Atlas"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Atualizando...' : 'Sincronizar Banco'}</span>
              </button>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Cadastrar Novo Paciente</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <p className="text-slate-400 text-xs font-medium">Total de Pacientes</p>
            <p className="text-2xl font-bold text-white mt-0.5">{patients.length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Pacientes Ativos</p>
            <p className="text-2xl font-bold text-teal-400 mt-0.5">{activeCount}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Fichas de Anamnese</p>
            <p className="text-2xl font-bold text-teal-300 mt-0.5">{totalAnamneses}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium">Especialidade</p>
            <p className="text-xs font-semibold text-slate-200 mt-1.5">Massoterapia & Estética</p>
          </div>
        </div>
      </div>

      {/* Search & Custom Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-full md:grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Busca rápida por nome, telefone, e-mail ou observações..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition text-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-44 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="todos">Status: Todos</option>
              <option value="ativo">Ativos</option>
              <option value="retorno_pendente">Retorno Pendente</option>
              <option value="inativo">Inativos</option>
            </select>

            {/* Treatment Type Filter */}
            <select
              value={treatmentFilter}
              onChange={(e) => setTreatmentFilter(e.target.value)}
              className="w-full md:w-56 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="todos">Tratamento: Todos</option>
              <option value="Drenagem">Drenagem Linfática</option>
              <option value="Relaxante">Massagem Relaxante</option>
              <option value="Modeladora">Modeladora / Celulite</option>
              <option value="Miofascial">Liberação Miofascial</option>
              <option value="Pós-Cirúrgica">Pós-Operatório</option>
            </select>
          </div>
        </div>

        {/* Filter tags feedback */}
        {(searchTerm || statusFilter !== 'todos' || treatmentFilter !== 'todos') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtros ativos:</span>
            {searchTerm && (
              <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md font-medium">
                Busca: "{searchTerm}"
              </span>
            )}
            {statusFilter !== 'todos' && (
              <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                Status: {statusFilter}
              </span>
            )}
            {treatmentFilter !== 'todos' && (
              <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                Tratamento: {treatmentFilter}
              </span>
            )}
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('todos'); setTreatmentFilter('todos'); }}
              className="text-teal-700 hover:text-teal-900 underline ml-2 font-medium cursor-pointer"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Patient Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>Mostrando {filteredPatients.length} de {patients.length} pacientes</span>
          <span>Especialidade: Massoterapia & Estética Corporal</span>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <UserPlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Nenhum paciente encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente alterar os termos de busca ou cadastrar um novo paciente.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-teal-600 text-white rounded-xl shadow-xs hover:bg-teal-700 transition cursor-pointer"
            >
              Cadastrar Paciente Agora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPatients.map((patient) => {
              const latestAnamnesis = anamnesisRecords.find(a => a.patientId === patient.id);
              const hasAlerts = latestAnamnesis && latestAnamnesis.detectedAlerts && latestAnamnesis.detectedAlerts.length > 0;

              return (
                <div
                  key={patient.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-xs transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header with Avatar, Name, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-base group-hover:bg-teal-50 group-hover:text-teal-700 transition">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-900 transition">
                              {patient.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              patient.status === 'ativo' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                              patient.status === 'retorno_pendente' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {patient.status === 'ativo' ? 'Ativo' :
                               patient.status === 'retorno_pendente' ? 'Retorno Pendente' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-xs text-teal-700 font-medium mt-0.5">
                            {patient.treatmentType || 'Massoterapia Personalizada'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-1 rounded-lg">
                          {patient.totalSessions || 0} sessões
                        </span>
                      </div>
                    </div>

                    {/* Patient Details & Contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                      {patient.occupation && (
                        <div className="col-span-1 sm:col-span-2 text-[11px] text-slate-500">
                          Profissão: <span className="font-medium text-slate-700">{patient.occupation}</span>
                        </div>
                      )}
                    </div>

                    {/* Anamnesis Status Badge */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      {latestAnamnesis ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            Anamnese Concluída ({new Date(latestAnamnesis.createdAt).toLocaleDateString('pt-BR')})
                          </span>
                          {hasAlerts && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200" title="Possui alertas clínicos">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Alerta Clínico
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Anamnese Pendente
                        </span>
                      )}

                      {patient.lastVisit && (
                        <span className="text-[11px] text-slate-400">
                          Última sessão: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {patient.notes && (
                      <p className="text-xs text-slate-500 line-clamp-1 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{patient.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {latestAnamnesis && (
                        <button
                          onClick={() => exportAnamnesisToWord(latestAnamnesis, patient)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                          title="Exportar Prontuário em formato Word (.doc)"
                        >
                          <FileDown className="w-3.5 h-3.5 text-slate-600" />
                          <span>Word</span>
                        </button>
                      )}

                      {onDeletePatient && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Deseja realmente excluir ${patient.name}? Esta ação removerá a ficha no MongoDB Atlas.`)) {
                              onDeletePatient(patient.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Excluir paciente do MongoDB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStartAnamnesisForPatient(patient)}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>{latestAnamnesis ? 'Refazer Anamnese' : 'Fazer Anamnese'}</span>
                      </button>

                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Prontuário Completo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Novo Paciente (Dra. Yasmin) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                  Prontuário Eletrônico
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                  Cadastrar Novo Paciente
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatientSubmit} className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome completo do paciente"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="paciente@exemplo.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gênero
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 cursor-pointer"
                  >
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Profissão / Ocupação
                  </label>
                  <input
                    type="text"
                    value={newOccupation}
                    onChange={(e) => setNewOccupation(e.target.value)}
                    placeholder="Ex: Arquiteta"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contato de Emergência
                  </label>
                  <input
                    type="text"
                    value={newEmergencyContact}
                    onChange={(e) => setNewEmergencyContact(e.target.value)}
                    placeholder="Ex: Carlos (Esposo)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefone de Emergência
                  </label>
                  <input
                    type="tel"
                    value={newEmergencyPhone}
                    onChange={(e) => setNewEmergencyPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tratamento Inicial Pretendido
                </label>
                <select
                  value={newTreatmentType}
                  onChange={(e) => setNewTreatmentType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 cursor-pointer"
                >
                  <option value="Massagem Relaxante com Aromaterapia">Massagem Relaxante com Aromaterapia</option>
                  <option value="Drenagem Linfática Manual (Método Clínico)">Drenagem Linfática Manual (Método Clínico)</option>
                  <option value="Massagem Modeladora Corporal Turbinada">Massagem Modeladora Corporal Turbinada</option>
                  <option value="Liberação Miofascial & Alívio de Dores">Liberação Miofascial & Alívio de Dores</option>
                  <option value="Protocolo Pós-Operatório Estético">Protocolo Pós-Operatório Estético</option>
                  <option value="Massagem com Pedras Vulcânicas Aquecidas">Massagem com Pedras Vulcânicas Aquecidas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Queixas Iniciais / Observações Clínicas
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Queixa de peso nas pernas e estresse intenso no trabalho..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 p-3 bg-teal-50/70 border border-teal-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={startAnamnesisImmediately}
                    onChange={(e) => setStartAnamnesisImmediately(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Iniciar formulário de <b>Anamnese passo a passo</b> imediatamente após cadastrar
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar e Avançar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
