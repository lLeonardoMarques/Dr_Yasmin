/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { BackendGuideModal } from './components/BackendGuideModal';
import { PatientList } from './components/PatientList';
import { AnamnesisWizard } from './components/AnamnesisWizard';
import { PatientRecordView } from './components/PatientRecordView';
import { PatientPortal } from './components/PatientPortal';
import { AppointmentsManager } from './components/AppointmentsManager';
import { AnamnesisFormEditor } from './components/AnamnesisFormEditor';

import { 
  User, 
  Patient, 
  AnamnesisRecord, 
  AnamnesisQuestion, 
  Appointment, 
  EvolutionSession 
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
        const [serverPatients, serverApps, serverAnamneses] = await Promise.all([
          api.getPatients(),
          api.getAllAppointments(),
          api.getAllAnamneses()
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
      } else {
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
    const newUserId = `user-${Date.now()}`;
    const newPatientId = `pat-${Date.now()}`;

    const newUser: User = {
      id: newUserId,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      role: 'PATIENT',
      password: patientData.password || '123456',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const newPatient: Patient = {
      id: newPatientId,
      userId: newUserId,
      name: patientData.name,
      email: patientData.email,
      phone: patientData.phone,
      status: 'ativo',
      treatmentType: 'Massoterapia e Estética Corporal',
      totalSessions: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatient(newPatient);

    return newUser;
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

  // Save Anamnesis Record (persists to server and local)
  const handleSaveAnamnesis = async (record: AnamnesisRecord) => {
    try {
      await api.saveAnamnesis(record);
    } catch (err) {
      console.warn('Backend save anamnesis fallback:', err);
    }

    setAnamnesisRecords(prev => {
      const existsIndex = prev.findIndex(a => a.id === record.id || a.patientId === record.patientId);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = record;
        return copy;
      }
      return [record, ...prev];
    });

    // Update patient sessions and last visit
    if (selectedPatient) {
      setPatients(prev => prev.map(p => {
        if (p.id === selectedPatient.id) {
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
  const handleUpdateAppointmentStatus = async (id: string, status: 'confirmado' | 'realizado' | 'cancelado') => {
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
    ? (anamnesisRecords.find(a => a.patientId === currentPatientContext.id) ||
       (currentUser?.role === 'PATIENT' && anamnesisRecords.length > 0 ? anamnesisRecords[0] : undefined))
    : undefined;

  const currentPatientEvolutions = currentPatientContext
    ? evolutions.filter(e => e.patientId === currentPatientContext.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-100 selection:text-teal-950 font-sans">
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

        {/* VIEW 6: PATIENT PORTAL (Restricted to Patient) */}
        {currentUser?.role === 'PATIENT' && currentPatientContext && (
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
                status: 'agendado',
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
