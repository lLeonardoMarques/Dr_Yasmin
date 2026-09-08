import React from 'react';
import { 
  Sparkles, 
  Users, 
  FileSpreadsheet, 
  Calendar, 
  SlidersHorizontal, 
  Database, 
  LogOut, 
  User as UserIcon,
  CalendarPlus,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenBackendGuide: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
  pendingCount?: number;
}

export function Navbar({
  currentUser,
  activeView,
  onNavigate,
  onOpenBackendGuide,
  onLogout,
  onOpenLogin,
  onSync,
  isSyncing,
  pendingCount = 0
}: NavbarProps) {
  const isDoctor = currentUser?.role === 'DOCTOR';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3">
          
          {/* Clinic Brand: Toque da Beleza */}
          <div 
            onClick={() => onNavigate(isDoctor ? 'patients' : 'portal')}
            className="flex items-center gap-3 cursor-pointer shrink-0 group select-none"
            title="Ir para o início"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shadow-xs group-hover:bg-slate-800 transition shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
                  Toque da Beleza
                </span>
                {currentUser && (
                  <span className={`hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap ${
                    isDoctor 
                      ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isDoctor ? 'Administração' : 'Portal do Paciente'}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap mt-0.5">
                Massoterapia & Estética Corporal
              </span>
            </div>
          </div>

          {/* Minimalist Navigation Options (strictly NO text-wrapping on options) */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 shrink-0">
              {isDoctor ? (
                <>
                  <button
                    onClick={() => onNavigate('patients')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'patients'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="whitespace-nowrap">Pacientes</span>
                  </button>

                  <button
                    onClick={() => onNavigate('pending-users')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'pending-users'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                    title="Aprovação de novos pacientes pendentes"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="whitespace-nowrap">Pendentes</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigate('new-anamnesis')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'new-anamnesis'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Nova Anamnese</span>
                  </button>

                  <button
                    onClick={() => onNavigate('appointments')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'appointments'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="whitespace-nowrap">Agenda</span>
                  </button>

                  <button
                    onClick={() => onNavigate('edit-form')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'edit-form'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="whitespace-nowrap">Formulários</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('portal')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'portal'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="whitespace-nowrap">Meu Prontuário</span>
                  </button>

                  <button
                    onClick={() => onNavigate('book-appointment')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'book-appointment'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <CalendarPlus className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">Marcar Consulta</span>
                  </button>

                  <button
                    onClick={() => onNavigate('my-appointments')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer whitespace-nowrap shrink-0 ${
                      activeView === 'my-appointments'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="whitespace-nowrap">Minhas Consultas</span>
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right Section: Docs & Account Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* MongoDB Atlas Sync button */}
            {currentUser && onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-xs cursor-pointer border border-slate-200 whitespace-nowrap shrink-0"
                title="Puxar dados atualizados do MongoDB Atlas"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline whitespace-nowrap">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}

            {/* MongoDB Atlas / Backend JSON specification button */}
            <button
              onClick={onOpenBackendGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-teal-300 rounded-xl transition shadow-xs cursor-pointer border border-slate-800 whitespace-nowrap shrink-0"
              title="Especificação de JSONs e MongoDB Atlas"
            >
              <Database className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">JSONs & Mongo</span>
              <span className="sm:hidden whitespace-nowrap">JSONs</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 whitespace-nowrap truncate max-w-[130px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 whitespace-nowrap truncate max-w-[130px]">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer shrink-0 border border-transparent hover:border-rose-100"
                  title="Sair / Fazer Logout"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline text-xs font-medium whitespace-nowrap">Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
              >
                Acessar
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Row (Smooth horizontal scroll without text wrapping) */}
        {currentUser && (
          <div className="flex md:hidden overflow-x-auto py-2.5 border-t border-slate-100 gap-1.5 scrollbar-none whitespace-nowrap">
            {isDoctor ? (
              <>
                <button
                  onClick={() => onNavigate('patients')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                    activeView === 'patients' ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'text-slate-600'
                  }`}
                >
                  Pacientes
                </button>
                <button
                  onClick={() => onNavigate('pending-users')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                    activeView === 'pending-users' ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold' : 'text-slate-600'
                  }`}
                >
                  <span>Pendentes</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onNavigate('new-anamnesis')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                    activeView === 'new-anamnesis' ? 'bg-teal-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Nova Anamnese
                </button>
                <button
                  onClick={() => onNavigate('appointments')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                    activeView === 'appointments' ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'text-slate-600'
                  }`}
                >
                  Agenda
                </button>
                <button
                  onClick={() => onNavigate('edit-form')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                    activeView === 'edit-form' ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'text-slate-600'
                  }`}
                >
                  Formulários
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('portal')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                    activeView === 'portal' ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'text-slate-600'
                  }`}
                >
                  Meu Prontuário
                </button>
                <button
                  onClick={() => onNavigate('book-appointment')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                    activeView === 'book-appointment' ? 'bg-teal-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Marcar Consulta
                </button>
                <button
                  onClick={() => onNavigate('my-appointments')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 whitespace-nowrap ${
                    activeView === 'my-appointments' ? 'bg-teal-50 text-teal-900 border border-teal-200' : 'text-slate-600'
                  }`}
                >
                  Minhas Consultas
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
