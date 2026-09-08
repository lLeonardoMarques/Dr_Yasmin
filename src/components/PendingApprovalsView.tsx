import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Link2, 
  ShieldCheck, 
  RefreshCw,
  Sparkles,
  ChevronRight,
  User as UserIcon,
  X
} from 'lucide-react';
import { Patient, PendingPatientRegistration } from '../types';

interface PendingApprovalsViewProps {
  pendingRegistrations: PendingPatientRegistration[];
  existingPatients: Patient[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onLink: (email: string, patientId: string, userId: string) => Promise<void>;
  onRefresh: () => void;
  isSyncing?: boolean;
  onNavigateToPatients?: () => void;
}

export function PendingApprovalsView({
  pendingRegistrations,
  existingPatients,
  onApprove,
  onReject,
  onLink,
  onRefresh,
  isSyncing,
  onNavigateToPatients
}: PendingApprovalsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [linkingTarget, setLinkingTarget] = useState<PendingPatientRegistration | null>(null);
  const [selectedExistingPatientId, setSelectedExistingPatientId] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = pendingRegistrations.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.email.toLowerCase().includes(term) ||
      item.phone.toLowerCase().includes(term)
    );
  });

  const handleApprove = async (id: string, name: string) => {
    try {
      setProcessingId(id);
      setFeedbackMessage(null);
      await onApprove(id);
      setFeedbackMessage({
        type: 'success',
        text: `Cadastro de "${name}" aprovado com sucesso! O paciente agora está com status "Ativo" e pode ser acessado na lista geral.`
      });
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Erro ao aprovar cadastro.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja recusar o cadastro de "${name}"?`)) return;

    try {
      setProcessingId(id);
      setFeedbackMessage(null);
      await onReject(id);
      setFeedbackMessage({
        type: 'success',
        text: `Cadastro de "${name}" foi recusado.`
      });
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Erro ao recusar cadastro.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecuteLink = async () => {
    if (!linkingTarget || !selectedExistingPatientId) return;

    try {
      setProcessingId(linkingTarget.id);
      setFeedbackMessage(null);
      const userId = linkingTarget.userId || linkingTarget.user?.id || linkingTarget.id;
      await onLink(linkingTarget.email, selectedExistingPatientId, userId);
      setFeedbackMessage({
        type: 'success',
        text: `Usuário "${linkingTarget.name}" vinculado com sucesso à ficha clínica!`
      });
      setLinkingTarget(null);
      setSelectedExistingPatientId('');
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Erro ao vincular paciente.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Área Administrativa Dra. Yasmin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif-luxury">
                Novos Cadastros & Aprovações Pendentes
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Quando um usuário cria uma conta via <strong>Novo Usuário</strong> com e-mail diferente do previamente cadastrado por você, o cadastro fica aguardando sua autorização. Ao aprovar ou vincular, o acesso do paciente ao prontuário é ativado instantaneamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Buscar novos cadastros"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 shadow-xs ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 self-end sm:self-center">
          <span>Cadastros Pendentes:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
            {pendingRegistrations.length}
          </span>
        </div>
      </div>

      {/* List of Pending Registrations */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-serif-luxury">
            Tudo em dia!
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm 
              ? 'Nenhum cadastro encontrado para os termos da busca informados.' 
              : 'Não há novos cadastros pendentes de aprovação no momento. Todos os pacientes cadastrados estão devidamente autorizados e ativos.'}
          </p>
          {onNavigateToPatients && (
            <button
              onClick={onNavigateToPatients}
              className="mt-5 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Ver Lista de Pacientes Ativos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isBusy = processingId === item.id;
            const dateDisplay = item.createdAt 
              ? new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recente';

            return (
              <div 
                key={item.id}
                className="bg-white rounded-3xl border border-amber-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                {/* Top indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0 border border-amber-200">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">
                          {item.name}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Aguardando Aprovação
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {dateDisplay}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.phone}</span>
                    </div>
                    {item.treatmentType && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="text-slate-700">Interesse: {item.treatmentType}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 p-2.5 bg-amber-50/70 border border-amber-100 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Este paciente cadastrou-se pelo formulário de <strong>Novo Usuário</strong>. O acesso dele permanece bloqueado até você clicar em <strong>Aprovar Cadastro</strong>.
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApprove(item.id, item.name)}
                    disabled={isBusy}
                    className="flex-1 min-w-[130px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBusy ? 'Aprovando...' : 'Aprovar Cadastro'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setLinkingTarget(item);
                      setSelectedExistingPatientId('');
                    }}
                    disabled={isBusy}
                    className="py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Vincular a uma ficha já existente cadastrada pela doutora"
                  >
                    <Link2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>Vincular à Ficha</span>
                  </button>

                  <button
                    onClick={() => handleReject(item.id, item.name)}
                    disabled={isBusy}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Recusar cadastro"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Recusar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Vincular Cadastro Pendente a Ficha Existente da Doutora */}
      {linkingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Vincular a Ficha Clínica
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unificar cadastro do usuário com paciente cadastrado
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLinkingTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900">Novo Usuário:</div>
              <div>Nome: <strong>{linkingTarget.name}</strong></div>
              <div>E-mail informado: <strong>{linkingTarget.email}</strong></div>
              <div>Telefone: <strong>{linkingTarget.phone}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Selecione a ficha do paciente cadastrado pela Dra. Yasmin:
              </label>
              <select
                value={selectedExistingPatientId}
                onChange={(e) => setSelectedExistingPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-700/30 focus:bg-white focus:outline-hidden"
              >
                <option value="">Selecione um paciente existente...</option>
                {existingPatients
                  .filter(p => p.status !== 'aguardando_aprovacao' && p.id !== linkingTarget.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email} - {p.phone})
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Ao vincular, o usuário herdará todos os prontuários, evoluções e exames já cadastrados pela Dra. Yasmin e terá seu login liberado imediatamente.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkingTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteLink}
                disabled={!selectedExistingPatientId || processingId === linkingTarget.id}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar e Liberar Acesso</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
