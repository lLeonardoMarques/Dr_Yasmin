/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, X, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { BackendGuideModal } from './components/BackendGuideModal';
import { PatientList } from './components/PatientList';
import { AnamnesisWizard } from './components/AnamnesisWizard';
import { PatientRecordView } from './components/PatientRecordView';
import { PatientPortal } from './components/PatientPortal';
import { AppointmentsManager } from './components/AppointmentsManager';
import { AnamnesisFormEditor } from './components/AnamnesisFormEditor';
import { PendingUsersManager } from './components/PendingUsersManager';

import { 
  User, 
  Patient, 
  AnamnesisRecord, 
  AnamnesisQuestion, 
  Appointment, 
  EvolutionSession,
  PendingPatientUser 
} from './types';

import { 
  DOCTOR_PROFILE, 
  INITIAL_PATIENTS, 
  INITIAL_ANAMNESIS_RECORDS, 
  INITIAL_QUESTIONS, 
  ANAMNESIS_CATEGORIES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_EVOLUTIONS 
} from './data/mockData';
import { api } from './utils/api';

export default function App() {
  // 1. Current user & Authentication - persists across F5 / page reloads
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return api.getSavedUser();
  });

  // Restore & revalidate authenticated session from server token in background
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getMe().then(res => {
        if (res && res.user) {
          setCurrentUser(res.user);
          api.setSavedUser(res.user);
          setIsLoginModalOpen(false);
        }
      }).catch(() => {
        // Keeps cached session if server is spinning up
      });
    }
  }, []);

  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    // Purge legacy mock data from storage
    localStorage.removeItem('yasmin_patients');
    localStorage.removeItem('yasmin_anamneses');
    localStorage.removeItem('yasmin_appointments');
    localStorage.removeItem('yasmin_evolutions');
    localStorage.removeItem('toque_registered_users');

    const saved = localStorage.getItem('toque_prod_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const clean = parsed.filter(u => !u.id.startsWith('user-pat-00'));
        if (clean.length > 0) return clean;
      } catch {
        // ignore parse error
      }
    }

    const doctorUser: User = {
      ...DOCTOR_PROFILE,
      password: '123456'
    };

    return [doctorUser];
  });

  // 2. Patients list (starts clean in production)
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('toque_prod_patients');
    if (saved) {
      try {
        const parsed: Patient[] = JSON.parse(saved);
        return parsed.filter(p => !p.id.startsWith('pat-00'));
      } catch {
        return [];
      }
    }
    return [];
  });

  // 3. Anamnesis Records
  const [anamnesisRecords, setAnamnesisRecords] = useState<AnamnesisRecord[]>(() => {
    const saved = localStorage.getItem('toque_prod_anamneses');
    if (saved) {
      try {
        const parsed: AnamnesisRecord[] = JSON.parse(saved);
        return parsed.filter(a => !a.id.startsWith('anam-00'));
      } catch {
        return [];
      }
    }
    return [];
  });

  // 4. Questionnaire Questions
  const [questions, setQuestions] = useState<AnamnesisQuestion[]>(() => {
    const saved = localStorage.getItem('toque_prod_questions');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  // 5. Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('toque_prod_appointments');
    if (saved) {
      try {
        const parsed: Appointment[] = JSON.parse(saved);
        return parsed.filter(a => !a.id.startsWith('app-00'));
      } catch {
        return [];
      }
    }
    return [];
  });

  // 6. Evolutions
  const [evolutions, setEvolutions] = useState<EvolutionSession[]>(() => {
    const saved = localStorage.getItem('toque_prod_evolutions');
    if (saved) {
      try {
        const parsed: EvolutionSession[] = JSON.parse(saved);
        return parsed.filter(e => !e.id.startsWith('evo-00'));
      } catch {
        return [];
      }
    }
    return [];
  });

  // 7. Pending Users waiting for Dra. Yasmin's approval
  const [pendingUsers, setPendingUsers] = useState<PendingPatientUser[]>([]);

  // Navigation State - persists across F5 / page reloads
  const [activeView, setActiveView] = useState<string>(() => {
    const savedView = localStorage.getItem('toque_active_view');
    if (savedView) return savedView;
    const savedUser = api.getSavedUser();
    if (savedUser) {
      return savedUser.role === 'DOCTOR' ? 'patients' : 'portal';
    }
    return 'patients';
  });

  // Selected Patient - persists across F5 / page reloads
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const saved = localStorage.getItem('toque_selected_patient');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [isBackendGuideOpen, setIsBackendGuideOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Login Modal is ONLY open initially if no user is currently logged in
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    const savedUser = api.getSavedUser();
    return !savedUser;
  });

  // Persist active view
  useEffect(() => {
    if (activeView) {
      localStorage.setItem('toque_active_view', activeView);
    }
  }, [activeView]);

  // Persist selected patient
  useEffect(() => {
    if (selectedPatient) {
      localStorage.setItem('toque_selected_patient', JSON.stringify(selectedPatient));
    } else {
      localStorage.removeItem('toque_selected_patient');
    }
  }, [selectedPatient]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('toque_prod_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    localStorage.setItem('toque_prod_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('toque_prod_anamneses', JSON.stringify(anamnesisRecords));
  }, [anamnesisRecords]);

  useEffect(() => {
    localStorage.setItem('toque_prod_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('toque_prod_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('toque_prod_evolutions', JSON.stringify(evolutions));
  }, [evolutions]);

  useEffect(() => {
    localStorage.setItem('yasmin_anamneses', JSON.stringify(anamnesisRecords));
  }, [anamnesisRecords]);

  useEffect(() => {
    localStorage.setItem('yasmin_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('yasmin_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('yasmin_evolutions', JSON.stringify(evolutions));
  }, [evolutions]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Real-time synchronization with MongoDB Atlas database
  const syncDataFromServer = useCallback(async (silent = false) => {
    if (!currentUser) return;
    if (!silent) setIsSyncing(true);

    try {
      if (currentUser.role === 'DOCTOR') {
        const [serverPatients, serverApps, serverAnamneses, serverPending] = await Promise.all([
          api.getPatients(),
          api.getAllAppointments(),
          api.getAllAnamneses(),
          api.getPendingPatients()
        ]);

        // When records are deleted in MongoDB, serverPatients won't contain them
        // Directly setting state ensures deletions in DB reflect on the frontend
        if (Array.isArray(serverPatients)) {
          setPatients(serverPatients);
        }
        if (Array.isArray(serverApps)) {
          setAppointments(serverApps);
        }
        if (Array.isArray(serverAnamneses)) {
          setAnamnesisRecords(serverAnamneses);
        }
        if (Array.isArray(serverPending)) {
          setPendingUsers(serverPending);
        }
      } else {
        // Re-check current user approval state from server
        try {
          const meRes = await api.getMe();
          if (meRes && meRes.user) {
            if (meRes.user.status !== currentUser.status || meRes.user.isApproved !== currentUser.isApproved) {
              setCurrentUser(meRes.user);
              api.setSavedUser(meRes.user);
            }
          }
        } catch {
          // Keep offline state
        }

        const [myProfile, myRecords, myApps] = await Promise.all([
          api.getMyPatientProfile(),
          api.getMyAnamneses(),
          api.getMyAppointments()
        ]);

        if (myProfile) {
          setSelectedPatient(myProfile);
          setPatients(prev => [myProfile, ...prev.filter(p => p.id !== myProfile.id)]);
        }
        if (Array.isArray(myRecords)) {
          setAnamnesisRecords(myRecords);
        }
        if (Array.isArray(myApps)) {
          setAppointments(myApps);
        }
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Sync data from server error:', err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  }, [currentUser]);

  // Synchronize with server database on login, on focus, and periodic polling (8s)
  useEffect(() => {
    if (!currentUser) return;

    // Initial sync
    syncDataFromServer();

    // Periodic sync every 8 seconds so deletions/updates in MongoDB reflect live
    const interval = setInterval(() => {
      syncDataFromServer(true);
    }, 8000);

    const handleWindowFocus = () => {
      syncDataFromServer(true);
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [currentUser, syncDataFromServer]);

  // Delete Patient and synchronize with MongoDB
  const handleDeletePatient = async (patientId: string) => {
    try {
      await api.deletePatient(patientId);
    } catch (err) {
      console.warn('Backend delete patient error:', err);
    }
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setAnamnesisRecords(prev => prev.filter(a => a.patientId !== patientId));
    setAppointments(prev => prev.filter(a => a.patientId !== patientId));
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(null);
    }
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    api.setSavedUser(user);
    setIsLoginModalOpen(false);
    if (user.role === 'DOCTOR') {
      const savedView = localStorage.getItem('toque_active_view');
      if (savedView && savedView !== 'portal' && savedView !== 'my-appointments' && savedView !== 'book-appointment') {
        setActiveView(savedView);
      } else {
        setActiveView('patients');
      }
    } else {
      // Find patient associated with user email
      const matched = patients.find(p => p.email.toLowerCase() === user.email.toLowerCase());
      if (matched) {
        setSelectedPatient(matched);
      }
      setActiveView('portal');
    }
  };

  const handleLogout = () => {
    api.clearToken();
    localStorage.removeItem('toque_selected_patient');
    setCurrentUser(null);
    setSelectedPatient(null);
    setIsLoginModalOpen(true);
  };

  const handleRegisterPatient = (patientData: { name: string; email: string; phone: string; password?: string }): User => {
    const cleanEmail = patientData.email.trim().toLowerCase();
    const cleanPhoneDigits = patientData.phone.replace(/\D/g, '');

    // Check if matches an existing patient registered previously by Dra. Yasmin (email and phone match)
    const matchedPatient = patients.find(p => {
      const emailMatches = p.email && p.email.trim().toLowerCase() === cleanEmail;
      const phoneMatches = p.phone && p.phone.replace(/\D/g, '') === cleanPhoneDigits;
      return emailMatches && phoneMatches;
    });

    const isDirectMatch = !!matchedPatient;
    const newUserId = `user-${Date.now()}`;
    const newPatientId = matchedPatient ? matchedPatient.id : `pat-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      role: 'PATIENT',
      password: patientData.password || '123456',
      status: isDirectMatch ? 'ativo' : 'pending',
      isApproved: isDirectMatch,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isDirectMatch) {
      // Direct access because Dra. Yasmin already registered this patient
      setPatients(prev => prev.map(p => p.id === matchedPatient.id ? { ...p, userId: newUserId } : p));
      setSelectedPatient({ ...matchedPatient, userId: newUserId });
    } else {
      // Pending user waiting for approval
      const newPending: PendingPatientUser = {
        id: newUserId,
        userId: newUserId,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setPendingUsers(prev => [newPending, ...prev]);

      const newPatient: Patient = {
        id: newPatientId,
        userId: newUserId,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        status: 'pendente',
        treatmentType: 'Massoterapia e Estética Corporal',
        totalSessions: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setPatients(prev => [newPatient, ...prev]);
      setSelectedPatient(newPatient);
    }

    setRegisteredUsers(prev => [...prev, newUser]);
    return newUser;
  };

  // Approve a pending user (Dra. Yasmin)
  const handleApprovePendingUser = async (id: string) => {
    try {
      setIsSyncing(true);
      await api.approvePatient(id);
      setToastNotification({
        type: 'success',
        title: 'Paciente Aprovado!',
        message: 'Acesso liberado com sucesso. O paciente agora tem permissão para acessar o prontuário e anexar exames.'
      });
      await syncDataFromServer(true);
    } catch (err: any) {
      console.error('Erro ao aprovar usuário:', err);
      // Fallback local update
      setPendingUsers(prev => prev.filter(p => p.id !== id && p.userId !== id));
      setPatients(prev => prev.map(p => (p.userId === id || p.id === id) ? { ...p, status: 'ativo' } : p));
      setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'ativo', isApproved: true } : u));
      setToastNotification({
        type: 'success',
        title: 'Paciente Aprovado',
        message: 'Acesso liberado localmente.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Reject a pending user (Dra. Yasmin)
  const handleRejectPendingUser = async (id: string) => {
    try {
      setIsSyncing(true);
      await api.rejectPatient(id);
      setToastNotification({
        type: 'info',
        title: 'Solicitação Recusada',
        message: 'O cadastro do usuário foi recusado com sucesso.'
      });
      await syncDataFromServer(true);
    } catch (err: any) {
      console.error('Erro ao recusar usuário:', err);
      // Fallback local update
      setPendingUsers(prev => prev.filter(p => p.id !== id && p.userId !== id));
      setToastNotification({
        type: 'info',
        title: 'Solicitação Recusada',
        message: 'Cadastro removido da lista de pendentes.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Link pending user with an existing patient profile
  const handleLinkPendingUser = async (email: string, patientId: string, userId: string) => {
    try {
      setIsSyncing(true);
      await api.linkPatient({ email, patientId, userId });
      setToastNotification({
        type: 'success',
        title: 'Fichas Vinculadas!',
        message: 'O usuário foi unificado ao histórico clínico existente com sucesso.'
      });
      await syncDataFromServer(true);
    } catch (err: any) {
      console.error('Erro ao vincular usuário:', err);
      // Fallback local update
      setPendingUsers(prev => prev.filter(p => p.userId !== userId && p.email !== email));
      setPatients(prev => prev.map(p => p.id === patientId ? { ...p, userId, email } : p));
      setRegisteredUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'ativo', isApproved: true } : u));
      setToastNotification({
        type: 'success',
        title: 'Fichas Vinculadas',
        message: 'Histórico unificado com sucesso.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Add new patient from Dra. Yasmin panel (persists to server and local)
  const handleAddNewPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'totalSessions'>): Promise<Patient> => {
    try {
      const serverPatient = await api.createPatient(patientData);
      if (serverPatient) {
        setPatients(prev => [serverPatient, ...prev.filter(p => p.id !== serverPatient.id)]);
        setSelectedPatient(serverPatient);
        return serverPatient;
      }
    } catch (err) {
      console.warn('Backend unavailable, using local fallback:', err);
    }

    const newPatientId = `pat-${Date.now()}`;
    const newPatient: Patient = {
      ...patientData,
      id: newPatientId,
      totalSessions: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Also register user so they can login as patient later
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newPatient.name,
      email: newPatient.email,
      phone: newPatient.phone,
      role: 'PATIENT',
      createdAt: newPatient.createdAt
    };

    setPatients(prev => [newPatient, ...prev]);
    setRegisteredUsers(prev => [...prev, newUser]);
    setSelectedPatient(newPatient);
    return newPatient;
  };

  // Save Anamnesis Record (persists to server and local with 100% amarração)
  const handleSaveAnamnesis = async (record: AnamnesisRecord) => {
    let savedRecord = { ...record };
    let savedPatient = selectedPatient;

    try {
      const res = await api.saveAnamnesis(record);
      if (res && res.anamnesis) {
        savedRecord = {
          ...savedRecord,
          id: res.anamnesis.id,
          patientId: res.anamnesis.patientId,
          patientName: res.anamnesis.patientName || savedRecord.patientName,
          patientEmail: res.anamnesis.patientEmail || savedRecord.patientEmail,
          patientPhone: res.anamnesis.patientPhone || savedRecord.patientPhone,
          createdAt: res.anamnesis.createdAt || savedRecord.createdAt
        };
      }
      if (res && res.patient) {
        savedPatient = {
          ...res.patient,
          createdAt: res.patient.createdAt || savedPatient?.createdAt || new Date().toISOString().split('T')[0]
        };
        setPatients(prev => {
          const filtered = prev.filter(p => p.id !== res.patient.id && p.email.toLowerCase() !== res.patient.email.toLowerCase() && p.id !== record.patientId);
          return [savedPatient!, ...filtered];
        });
        setSelectedPatient(savedPatient);
      }
      setToastNotification({
        type: 'success',
        title: 'Anamnese Gravada com Sucesso!',
        message: `A ficha clínica de ${savedRecord.patientName || 'paciente'} foi salva e amarrada 100% no banco de dados da Dra. Yasmin.`
      });
    } catch (err: any) {
      console.warn('Backend save anamnesis fallback:', err);
      setToastNotification({
        type: 'warning',
        title: 'Anamnese Salva Localmente',
        message: 'A ficha foi salva no dispositivo. O servidor reportou: ' + (err.message || 'modo offline')
      });
    }

    setAnamnesisRecords(prev => {
      const existsIndex = prev.findIndex(a => 
        a.id === savedRecord.id || 
        a.patientId === savedRecord.patientId ||
        (a.patientEmail && savedRecord.patientEmail && a.patientEmail.toLowerCase() === savedRecord.patientEmail.toLowerCase())
      );
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = savedRecord;
        return copy;
      }
      return [savedRecord, ...prev];
    });

    // Update patient sessions and last visit
    if (savedPatient) {
      setPatients(prev => prev.map(p => {
        if (p.id === savedPatient!.id || (savedPatient!.email && p.email.toLowerCase() === savedPatient!.email.toLowerCase())) {
          return {
            ...p,
            totalSessions: (p.totalSessions || 0) + 1,
            lastVisit: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      }));
    }

    setActiveView('patient-record');
  };

  // Add Evolution Session
  const handleAddEvolution = (evolutionData: Omit<EvolutionSession, 'id' | 'patientId'>) => {
    if (!selectedPatient) return;
    const newEvo: EvolutionSession = {
      ...evolutionData,
      id: `evo-${Date.now()}`,
      patientId: selectedPatient.id
    };
    setEvolutions(prev => [newEvo, ...prev]);

    // Update patient sessions count
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        return {
          ...p,
          totalSessions: (p.totalSessions || 0) + 1,
          lastVisit: evolutionData.date
        };
      }
      return p;
    }));
  };

  // Add Appointment (persists to server and local)
  const handleAddAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      const serverApp = await api.bookAppointment({
        patientId: appointmentData.patientId,
        service: appointmentData.service,
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes
      });
      if (serverApp) {
        setAppointments(prev => [serverApp, ...prev.filter(a => a.id !== serverApp.id)]);
        return;
      }
    } catch (err) {
      console.warn('Backend appointment fallback:', err);
    }

    const newApp: Appointment = {
      ...appointmentData,
      id: `app-${Date.now()}`
    };
    setAppointments(prev => [newApp, ...prev]);
  };

  // Update Appointment Status (persists to server and local)
  const handleUpdateAppointmentStatus = async (id: string, status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado') => {
    try {
      await api.updateAppointmentStatus(id, status);
    } catch (err) {
      console.warn('Backend update appointment status fallback:', err);
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  // Get current patient context safely matching by email or userId
  const currentPatientContext: Patient | undefined = currentUser?.role === 'PATIENT'
    ? (patients.find(p => p.email.toLowerCase() === currentUser.email.toLowerCase() || (p.userId && p.userId === currentUser.id)) || selectedPatient || {
        id: `pat-${currentUser.id}`,
        userId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        status: 'ativo',
        treatmentType: 'Massoterapia e Estética Corporal',
        totalSessions: 0,
        createdAt: currentUser.createdAt
      })
    : (selectedPatient || undefined);

  const currentPatientRecord = currentPatientContext
    ? (anamnesisRecords.find(a => 
        a.patientId === currentPatientContext.id || 
        (a.patientEmail && currentPatientContext.email && a.patientEmail.toLowerCase() === currentPatientContext.email.toLowerCase())
      ) ||
       (currentUser?.role === 'PATIENT' && anamnesisRecords.length > 0 ? anamnesisRecords[0] : undefined))
    : undefined;

  const currentPatientEvolutions = currentPatientContext
    ? evolutions.filter(e => e.patientId === currentPatientContext.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-950 font-sans">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 ${
            toastNotification.type === 'success' 
              ? 'bg-teal-900 border-teal-700 text-white' 
              : toastNotification.type === 'warning'
              ? 'bg-amber-900 border-amber-700 text-white'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-tight">{toastNotification.title}</p>
              <p className="text-[11px] text-teal-100/90 mt-0.5 leading-relaxed">{toastNotification.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="text-white/70 hover:text-white transition p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onOpenBackendGuide={() => setIsBackendGuideOpen(true)}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSync={() => syncDataFromServer(false)}
        isSyncing={isSyncing}
        pendingCount={pendingUsers.length}
      />

      {/* Main App Container */}
      <main className="grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW 1: PATIENTS LIST (Exclusive to Dra. Yasmin) */}
        {currentUser?.role === 'DOCTOR' && activeView === 'patients' && (
          <PatientList
            patients={patients}
            anamnesisRecords={anamnesisRecords}
            onSelectPatient={(patient) => {
              setSelectedPatient(patient);
              setActiveView('patient-record');
            }}
            onStartAnamnesisForPatient={(patient) => {
              setSelectedPatient(patient);
              setActiveView('new-anamnesis');
            }}
            onAddNewPatient={handleAddNewPatient}
            onSync={() => syncDataFromServer(false)}
            isSyncing={isSyncing}
            onDeletePatient={handleDeletePatient}
            pendingCount={pendingUsers.length}
            onNavigatePendingUsers={() => setActiveView('pending-users')}
          />
        )}

        {/* VIEW: PENDING PATIENTS MANAGER (Exclusive to Dra. Yasmin) */}
        {currentUser?.role === 'DOCTOR' && activeView === 'pending-users' && (
          <PendingUsersManager
            pendingUsers={pendingUsers}
            existingPatients={patients}
            onApprove={handleApprovePendingUser}
            onReject={handleRejectPendingUser}
            onLink={handleLinkPendingUser}
            onRefresh={() => syncDataFromServer(false)}
            isLoading={isSyncing}
          />
        )}

        {/* VIEW 2: STEP-BY-STEP ANAMNESIS WIZARD */}
        {currentUser?.role === 'DOCTOR' && activeView === 'new-anamnesis' && selectedPatient && (
          <AnamnesisWizard
            patient={selectedPatient}
            questions={questions}
            categories={ANAMNESIS_CATEGORIES}
            doctorName={DOCTOR_PROFILE.name}
            onSaveAnamnesis={handleSaveAnamnesis}
            onCancel={() => setActiveView('patients')}
            initialRecord={currentPatientRecord}
          />
        )}

        {currentUser?.role === 'DOCTOR' && activeView === 'new-anamnesis' && !selectedPatient && (
          <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-serif-luxury">Selecione o Paciente para a Anamnese</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {patients.length > 0 
                ? 'Escolha um paciente cadastrado abaixo para iniciar a avaliação clínica:' 
                : 'Nenhum paciente cadastrado no sistema ainda. Cadastre um novo paciente para abrir a ficha de anamnese.'}
            </p>
            {patients.length > 0 ? (
              <div className="pt-2 flex flex-col gap-2 max-h-60 overflow-y-auto">
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="p-3.5 text-left border border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50/40 transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.phone} • {p.treatmentType}</p>
                    </div>
                    <span className="text-xs font-semibold text-teal-700">Iniciar Avaliação &rarr;</span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => setActiveView('patients')}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Ir para Pacientes e Cadastrar
              </button>
            )}
          </div>
        )}

        {/* VIEW 3: PATIENT RECORD & EVOLUTION VIEW (Dra. Yasmin) */}
        {currentUser?.role === 'DOCTOR' && activeView === 'patient-record' && selectedPatient && (
          <PatientRecordView
            patient={selectedPatient}
            record={currentPatientRecord}
            evolutions={currentPatientEvolutions}
            appointments={appointments}
            onBack={() => setActiveView('patients')}
            onStartAnamnesis={() => setActiveView('new-anamnesis')}
            onAddEvolution={handleAddEvolution}
          />
        )}

        {currentUser?.role === 'DOCTOR' && activeView === 'patient-record' && !selectedPatient && (
          <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Nenhum paciente selecionado</h2>
            <p className="text-xs text-slate-500">Selecione um paciente na lista para visualizar o prontuário e evoluções clínicas.</p>
            <button
              onClick={() => setActiveView('patients')}
              className="px-4 py-2 bg-teal-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Voltar para Lista de Pacientes
            </button>
          </div>
        )}

        {/* VIEW 4: APPOINTMENTS MANAGER (Dra. Yasmin) */}
        {currentUser?.role === 'DOCTOR' && activeView === 'appointments' && (
          <AppointmentsManager
            appointments={appointments}
            patients={patients}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onAddAppointment={handleAddAppointment}
          />
        )}

        {/* VIEW 5: QUESTIONNAIRE FORM EDITOR (Dra. Yasmin) */}
        {currentUser?.role === 'DOCTOR' && activeView === 'edit-form' && (
          <AnamnesisFormEditor
            questions={questions}
            categories={ANAMNESIS_CATEGORIES}
            onUpdateQuestions={(updated) => setQuestions(updated)}
          />
        )}

        {/* VIEW: PATIENT WAITING APPROVAL SCREEN */}
        {currentUser?.role === 'PATIENT' && (currentUser.status === 'pending' || currentUser.isApproved === false) && (
          <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-3xl border border-amber-200/90 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                Cadastro em Análise
              </span>
              <h2 className="text-2xl font-bold text-stone-900 font-serif-luxury">
                Aguardando Aprovação da Dra. Yasmin
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                Olá, <strong>{currentUser.name}</strong>! Recebemos sua solicitação de acesso com sucesso. Por motivos de segurança e sigilo profissional dos prontuários médicos, seu cadastro está aguardando liberação da Dra. Yasmin.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs text-stone-600 space-y-2 text-left">
              <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Assim que seu acesso for liberado, você poderá:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>Visualizar sua ficha de anamnese e histórico de atendimentos</li>
                <li>Anexar fotos, laudos e exames diretamente ao seu prontuário</li>
                <li>Solicitar agendamento de novas consultas e sessões</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => syncDataFromServer(false)}
                disabled={isSyncing}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Verificando...' : 'Verificar Aprovação Agora'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Sair / Trocar Usuário
              </button>
            </div>
          </div>
        )}

        {/* VIEW 6: PATIENT PORTAL (Restricted to Approved Patient) */}
        {currentUser?.role === 'PATIENT' && currentUser.status !== 'pending' && currentUser.isApproved !== false && currentPatientContext && (
          <PatientPortal
            currentPatient={currentPatientContext}
            patientRecord={currentPatientRecord}
            appointments={appointments}
            onBookAppointment={({ service, date, time, notes }) => {
              handleAddAppointment({
                patientId: currentPatientContext.id,
                patientName: currentPatientContext.name,
                patientEmail: currentPatientContext.email,
                patientPhone: currentPatientContext.phone,
                service,
                date,
                time,
                status: 'pendente', // Consultas marcadas por pacientes ficam pendentes para aprovação da Dra.
                notes,
                durationMinutes: 60
              });
            }}
            initialTab={activeView === 'book-appointment' ? 'agendar' : activeView === 'my-appointments' ? 'consultas' : 'ficha'}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Toque da Beleza • Massoterapia & Estética Corporal. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackendGuideOpen(true)}
              className="text-slate-600 hover:text-teal-700 font-semibold cursor-pointer transition"
            >
              Documentação JSON & MongoDB Atlas
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-teal-700 hover:text-teal-800 font-semibold cursor-pointer transition"
            >
              {currentUser ? 'Trocar de Usuário / Login' : 'Acessar Conta'}
            </button>
          </div>
        </div>
      </footer>

      {/* Backend & MongoDB Atlas Modal */}
      <BackendGuideModal
        isOpen={isBackendGuideOpen}
        onClose={() => setIsBackendGuideOpen(false)}
      />

      {/* Login & Register Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onLogin={handleLogin}
        onRegisterPatient={handleRegisterPatient}
        onOpenBackendGuide={() => {
          setIsLoginModalOpen(false);
          setIsBackendGuideOpen(true);
        }}
        registeredUsers={registeredUsers}
        onClose={currentUser ? () => setIsLoginModalOpen(false) : undefined}
      />
    </div>
  );
}
