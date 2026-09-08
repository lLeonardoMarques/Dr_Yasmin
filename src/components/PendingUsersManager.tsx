import React, { useState } from 'react';
import { 
  UserCheck, 
  UserX, 
  Link2, 
  Clock, 
  Mail, 
  Phone, 
  Calendar, 
  Search, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  User as UserIcon
} from 'lucide-react';
import { Patient, PendingPatientUser } from '../types';

interface PendingUsersManagerProps {
  pendingUsers: PendingPatientUser[];
  existingPatients: Patient[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onLink: (email: string, patientId: string, userId: string) => Promise<void>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const PendingUsersManager: React.FC<PendingUsersManagerProps> = ({
  pendingUsers,
  existingPatients,
  onApprove,
  onReject,
  onLink,
  onRefresh,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedLinkTarget, setSelectedLinkTarget] = useState<{ [pendingId: string]: string }>({});

  const filtered = pendingUsers.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.toLowerCase().includes(term)
    );
  });

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Deseja realmente recusar o acesso deste usuário?')) return;
    try {
      setProcessingId(id);
      await onReject(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLink = async (pendingId: string, pendingEmail: string, userId?: string | null) => {
    const targetPatientId = selectedLinkTarget[pendingId];
    if (!targetPatientId || !userId) {
      alert('Selecione uma ficha clínica existente para vincular.');
      return;
    }
    try {
      setProcessingId(pendingId);
      await onLink(pendingEmail, pendingId, userId);
    } finally {
      setProcessingId(null);
    }
  };

  // Find candidate matches for each pending user
  const findMatchCandidate = (pending: PendingPatientUser) => {
    const cleanPhoneDigits = (pending.phone || '').replace(/\D/g, '');
    return existingPatients.find(p => {
      if (p.id === pending.id) return false;
      const pEmail = (p.email || '').toLowerCase().trim();
      if (pEmail && pEmail === pending.email?.toLowerCase().trim()) return true;
      const pPhoneDigits = (p.phone || '').replace(/\D/g, '');
      if (cleanPhoneDigits.length >= 8 && pPhoneDigits.length >= 8) {
        if (pPhoneDigits === cleanPhoneDigits || pPhoneDigits.endsWith(cleanPhoneDigits) || cleanPhoneDigits.endsWith(pPhoneDigits)) {
          return true;
        }
      }
      return false;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-stone-800">
                  Usuários Pendentes de Aprovação
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingUsers.length} {pendingUsers.length === 1 ? 'solicitação' : 'solicitações'}
                </span>
              </div>
              <p className="text-sm text-stone-600 mt-1">
                Controle de segurança: novos pacientes cadastrados aguardando liberação pela Dra. Yasmin.
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-700 text-sm font-medium hover:bg-stone-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            Atualizar Lista
          </button>
        </div>
      </div>

      {/* Control / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-stone-500 flex items-center gap-2 self-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Aprovação libera imediatamente prontuário, agendamentos e anamneses</span>
        </div>
      </div>

      {/* List of Pending Users */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800">
            {searchTerm ? 'Nenhum usuário encontrado na busca' : 'Nenhuma solicitação pendente!'}
          </h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto mt-1">
            {searchTerm 
              ? 'Tente buscar com outro termo ou limpe a busca.' 
              : 'Todos os novos cadastros foram revisados e aprovados. Quando um novo paciente se registrar, ele aparecerá aqui.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((pending) => {
            const matchCandidate = findMatchCandidate(pending);
            const isProcessing = processingId === pending.id;

            return (
              <div 
                key={pending.id}
                className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* User Profile Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-lg shrink-0">
                      {pending.name ? pending.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-stone-800">{pending.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Aguardando Liberação
                        </span>
                        {matchCandidate && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Ficha Coincidente Localizada
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          {pending.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          {pending.phone || 'Sem telefone'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          Cadastrado em: {pending.createdAt ? new Date(pending.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                    <button
                      onClick={() => handleApprove(pending.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      {isProcessing ? 'Processando...' : 'Aprovar Acesso'}
                    </button>

                    <button
                      onClick={() => handleReject(pending.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                    >
                      <UserX className="w-4 h-4" />
                      Recusar
                    </button>
                  </div>
                </div>

                {/* Candidate Match Notification & Quick Link */}
                {matchCandidate && (
                  <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-blue-900">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <strong>Possível cadastro prévio encontrado:</strong> Ficha de{' '}
                        <span className="font-semibold">{matchCandidate.name}</span> ({matchCandidate.email || matchCandidate.phone}).
                        Deseja unificar o histórico?
                      </div>
                    </div>

                    <button
                      onClick={() => onLink(pending.email, pending.id, pending.userId || '')}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shrink-0 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Unificar Fichas
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PendingUsersManager;
