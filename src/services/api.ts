// src/services/api.ts

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app')
  )) {
    return 'https://servidor-clinica-yasmin.onrender.com/api';
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

// ========== HELPERS ==========
const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('toque_auth_token');

const getHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ========== API OBJECT ==========
export const api = {
  // ---------- UTILITY ----------
  getToken: () => {
    return getToken();
  },

  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('toque_auth_token', token);
  },

  getSavedUser: () => {
    try {
      const savedUser = localStorage.getItem('auth_user') || localStorage.getItem('toque_current_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch {
      return null;
    }
  },

  setSavedUser: (user: any) => {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('toque_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  clearToken: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('toque_auth_token');
    localStorage.removeItem('toque_current_user');
    localStorage.removeItem('toque_active_view');
    localStorage.removeItem('toque_selected_patient');
  },

  // ---------- AUTH ----------
  login: async (email: string, password: string) => {
    try {
      console.log('📤 Fazendo login em:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('📡 Login response:', data);
      
      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return data;
      }
      throw new Error(data.error || 'Erro no login');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      console.log('📤 Registrando em:', `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('📡 Register response:', data);
      
      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return data;
      }
      throw new Error(data.error || 'Erro no registro');
    } catch (error: any) {
      console.error('❌ Register error:', error);
      throw error;
    }
  },

  getMe: async () => {
    const token = getToken();
    if (!token) {
      console.log('🔑 No token found, skipping getMe');
      return null;
    }
    
    try {
      console.log('📤 Verificando sessão em:', `${API_BASE_URL}/auth/me`);
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Resposta não é JSON, backend pode não estar rodando');
        return null;
      }
      
      const data = await response.json();
      console.log('📡 GetMe response:', data);
      
      if (data.success) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return data;
      }
      return null;
    } catch (error) {
      console.error('❌ GetMe error:', error);
      return null;
    }
  },

  // ---------- PATIENTS ----------
  getPatients: async () => {
    try {
      console.log('📤 Buscando pacientes em:', `${API_BASE_URL}/patients`);
      
      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: getHeaders()
      });
      
      const data = await response.json();
      console.log('📡 Patients response:', data);
      
      if (data.success) {
        return data.patients.map((p: any) => ({
          id: p._id || p.id,
          userId: p.userId,
          name: p.name,
          email: p.email,
          phone: p.phone,
          birthDate: p.birthDate,
          gender: p.gender,
          occupation: p.occupation,
          emergencyContact: p.emergencyContact,
          emergencyPhone: p.emergencyPhone,
          status: p.status || 'ativo',
          treatmentType: p.treatmentType || 'Massoterapia e Estética Corporal',
          notes: p.notes,
          totalSessions: p.totalSessions || 0,
          lastVisit: p.lastVisit,
          exams: p.exams || [],
          createdAt: p.createdAt || new Date().toISOString().split('T')[0]
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ GetPatients error:', error);
      return [];
    }
  },

  createPatient: async (patientData: any) => {
    try {
      console.log('📤 Criando paciente em:', `${API_BASE_URL}/patients`);
      
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(patientData)
      });
      const data = await response.json();
      console.log('📡 Create patient response:', data);
      
      if (data.success) {
        const p = data.patient;
        return {
          id: p._id || p.id,
          userId: p.userId,
          name: p.name,
          email: p.email,
          phone: p.phone,
          birthDate: p.birthDate,
          gender: p.gender,
          occupation: p.occupation,
          emergencyContact: p.emergencyContact,
          emergencyPhone: p.emergencyPhone,
          status: p.status || 'ativo',
          treatmentType: p.treatmentType || 'Massoterapia e Estética Corporal',
          notes: p.notes,
          totalSessions: p.totalSessions || 0,
          lastVisit: p.lastVisit,
          exams: p.exams || [],
          createdAt: p.createdAt || new Date().toISOString().split('T')[0]
        };
      }
      throw new Error(data.error || 'Erro ao criar paciente');
    } catch (error: any) {
      console.error('❌ Create patient error:', error);
      throw error;
    }
  },

  updatePatient: async (patientId: string, patientData: any) => {
    try {
      console.log('📤 Atualizando paciente em:', `${API_BASE_URL}/patients/${patientId}`);
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(patientData)
      });
      const data = await response.json();
      if (data.success) {
        return data.patient;
      }
      throw new Error(data.error || 'Erro ao atualizar paciente');
    } catch (error: any) {
      console.error('❌ UpdatePatient error:', error);
      throw error;
    }
  },

  // ---------- ANAMNESIS ----------
  saveAnamnesis: async (record: any) => {
    try {
      console.log('📤 Salvando anamnese em:', `${API_BASE_URL}/anamnesis`);
      
      const response = await fetch(`${API_BASE_URL}/anamnesis`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          patientId: record.patientId,
          doctorName: record.doctorName || 'Dra. Yasmin Oliveira',
          pressurePreference: record.pressurePreference || 'Média / Terapêutica',
          mainObjective: record.mainObjective,
          bodyAreas: record.bodyAreas || [],
          answers: record.answers || {},
          detectedAlerts: record.detectedAlerts || [],
          clinicalObservations: record.clinicalObservations || '',
          recommendedTechniques: record.recommendedTechniques || []
        })
      });
      const data = await response.json();
      console.log('📡 Save anamnesis response:', data);
      
      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Erro ao salvar anamnese');
    } catch (error: any) {
      console.error('❌ Save anamnesis error:', error);
      throw error;
    }
  },

  getAllAnamneses: async () => {
    try {
      console.log('📤 Buscando anamneses em:', `${API_BASE_URL}/anamnesis`);
      
      const response = await fetch(`${API_BASE_URL}/anamnesis`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 All anamneses response:', data);
      
      if (data.success) {
        return data.records.map((a: any) => ({
          id: a._id || a.id,
          patientId: a.patientId,
          doctorName: a.doctorName,
          pressurePreference: a.pressurePreference,
          mainObjective: a.mainObjective,
          bodyAreas: a.bodyAreas || [],
          answers: a.answers || {},
          detectedAlerts: a.detectedAlerts || [],
          clinicalObservations: a.clinicalObservations || '',
          recommendedTechniques: a.recommendedTechniques || [],
          status: a.status || 'concluido',
          createdAt: a.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Get all anamneses error:', error);
      return [];
    }
  },

  // ---------- APPOINTMENTS ----------
  bookAppointment: async (data: any) => {
    try {
      console.log('📤 Agendando consulta em:', `${API_BASE_URL}/appointments`);
      
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log('📡 Book appointment response:', result);
      
      if (result.success) {
        const a = result.appointment;
        return {
          id: a._id || a.id,
          patientId: a.patientId,
          patientName: a.patientName,
          patientEmail: data.patientEmail || '',
          patientPhone: a.patientPhone,
          service: a.service,
          date: a.date,
          time: a.time,
          status: a.status || 'agendado',
          notes: a.notes,
          durationMinutes: 60,
          createdAt: a.createdAt
        };
      }
      throw new Error(result.error || 'Erro ao agendar');
    } catch (error: any) {
      console.error('❌ Book appointment error:', error);
      throw error;
    }
  },

  getMyAppointments: async () => {
    try {
      console.log('📤 Buscando minhas consultas em:', `${API_BASE_URL}/appointments/my`);
      
      const response = await fetch(`${API_BASE_URL}/appointments/my`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 My appointments response:', data);
      
      if (data.success) {
        return data.appointments.map((a: any) => ({
          id: a._id || a.id,
          patientId: a.patientId,
          patientName: a.patientName,
          patientEmail: a.patientEmail || '',
          patientPhone: a.patientPhone,
          service: a.service,
          date: a.date,
          time: a.time,
          status: a.status || 'agendado',
          notes: a.notes,
          durationMinutes: 60,
          createdAt: a.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Get my appointments error:', error);
      return [];
    }
  },

  getAllAppointments: async () => {
    try {
      console.log('📤 Buscando todas consultas em:', `${API_BASE_URL}/appointments`);
      
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 All appointments response:', data);
      
      if (data.success) {
        return data.appointments.map((a: any) => ({
          id: a._id || a.id,
          patientId: a.patientId,
          patientName: a.patientName,
          patientEmail: a.patientEmail || '',
          patientPhone: a.patientPhone,
          service: a.service,
          date: a.date,
          time: a.time,
          status: a.status || 'agendado',
          notes: a.notes,
          durationMinutes: 60,
          createdAt: a.createdAt
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Get all appointments error:', error);
      return [];
    }
  },

  updateAppointmentStatus: async (id: string, status: string) => {
    try {
      console.log('📤 Atualizando consulta em:', `${API_BASE_URL}/appointments/${id}`);
      
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      console.log('📡 Update appointment response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao atualizar status');
      }
      return data;
    } catch (error: any) {
      console.error('❌ Update appointment error:', error);
      throw error;
    }
  },

  // ---------- PATIENTS (CURRENT PATIENT PROFILE) ----------
  getMyPatientProfile: async () => {
    try {
      console.log('📤 Buscando meu perfil de paciente em:', `${API_BASE_URL}/patients/me`);
      const response = await fetch(`${API_BASE_URL}/patients/me`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 My patient profile response:', data);
      if (data.success && data.patient) {
        return data.patient;
      }
      return null;
    } catch (error) {
      console.error('❌ GetMyPatientProfile error:', error);
      return null;
    }
  },

  getMyAnamneses: async () => {
    try {
      console.log('📤 Buscando minhas anamneses em:', `${API_BASE_URL}/anamnesis/my`);
      const response = await fetch(`${API_BASE_URL}/anamnesis/my`, {
        headers: getHeaders()
      });
      const data = await response.json();
      console.log('📡 My anamneses response:', data);
      if (data.success && Array.isArray(data.records)) {
        return data.records;
      }
      return [];
    } catch (error) {
      console.error('❌ GetMyAnamneses error:', error);
      return [];
    }
  },

  deletePatient: async (patientId: string) => {
    try {
      console.log('📤 Excluindo paciente em:', `${API_BASE_URL}/patients/${patientId}`);
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ DeletePatient error:', error);
      throw error;
    }
  },

  // ---------- EXAMS (ANEXAR EXAMES) ----------
  uploadExam: async (patientId: string, examData: any) => {
    try {
      console.log('📤 Anexando exame em:', `${API_BASE_URL}/patients/${patientId}/exams`);
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/exams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(examData)
      });
      const data = await response.json();
      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Erro ao anexar exame');
    } catch (error: any) {
      console.error('❌ UploadExam error:', error);
      throw error;
    }
  },

  getPatientExams: async (patientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/exams`, {
        headers: getHeaders()
      });
      const data = await response.json();
      if (data.success) {
        return data.exams || [];
      }
      return [];
    } catch (error) {
      console.error('❌ GetPatientExams error:', error);
      return [];
    }
  },

  deleteExam: async (patientId: string, examId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/exams/${examId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ DeleteExam error:', error);
      throw error;
    }
  },

  uploadMyExam: async (examData: any) => {
    try {
      console.log('📤 Paciente enviando exame em:', `${API_BASE_URL}/patients/me/exams`);
      const response = await fetch(`${API_BASE_URL}/patients/me/exams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(examData)
      });
      const data = await response.json();
      if (data.success) {
        return data;
      }
      throw new Error(data.error || 'Erro ao anexar exame');
    } catch (error: any) {
      console.error('❌ UploadMyExam error:', error);
      throw error;
    }
  },

  // ---------- QUESTIONS (PERGUNTAS NO BANCO) ----------
  getQuestions: async () => {
    try {
      console.log('📤 Buscando perguntas no MongoDB em:', `${API_BASE_URL}/questions`);
      const response = await fetch(`${API_BASE_URL}/questions`);
      const data = await response.json();
      if (data.success && Array.isArray(data.questions)) {
        return data.questions;
      }
      return null;
    } catch (error) {
      console.error('❌ GetQuestions error:', error);
      return null;
    }
  },

  saveQuestion: async (questionData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(questionData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ SaveQuestion error:', error);
      throw error;
    }
  },

  updateQuestion: async (id: string, questionData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(questionData)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ UpdateQuestion error:', error);
      throw error;
    }
  },

  deleteQuestion: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ DeleteQuestion error:', error);
      throw error;
    }
  },

  seedQuestions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/seed`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ SeedQuestions error:', error);
      throw error;
    }
  },

  // ---------- USERS (GERENCIAMENTO DE USUÁRIOS) ----------
  getUsers: async (filter?: { role?: string; status?: string }) => {
    try {
      let url = `${API_BASE_URL}/users`;
      const params = new URLSearchParams();
      if (filter?.role) params.append('role', filter.role);
      if (filter?.status) params.append('status', filter.status);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, { headers: getHeaders() });
      const data = await response.json();
      if (data.success) {
        return data.users || [];
      }
      return [];
    } catch (error) {
      console.error('❌ GetUsers error:', error);
      return [];
    }
  },

  updateUser: async (id: string, updateData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });
      return await response.json();
    } catch (error) {
      console.error('❌ UpdateUser error:', error);
      throw error;
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ DeleteUser error:', error);
      throw error;
    }
  },

  // ---------- HEALTH ----------
  health: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return null;
    }
  }
};

export default api;