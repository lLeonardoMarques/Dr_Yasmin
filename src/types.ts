export type UserRole = 'DOCTOR' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface MedicalExam {
  id?: string;
  _id?: string;
  title: string;
  category: 'Laboratorial' | 'Imagem (Raio-X, RM, TC)' | 'Ultrassom' | 'Laudo Médico' | 'Outro';
  date: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: string;
  notes?: string;
  uploadedBy?: 'DOCTOR' | 'PATIENT';
  uploadedByName?: string;
  createdAt?: string;
}

export interface Patient {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: 'Feminino' | 'Masculino' | 'Outro';
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  status: 'ativo' | 'inativo' | 'retorno_pendente' | 'aguardando_aprovacao';
  treatmentType: string;
  totalSessions: number;
  lastVisit?: string;
  createdAt: string;
  notes?: string;
  exams?: MedicalExam[];
}

export interface QuestionOption {
  label: string;
  value: string;
  isContraindication?: boolean;
}

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'scale'
  | 'body_map'
  | 'boolean';

export interface AnamnesisQuestion {
  id: string;
  categoryId: string;
  label: string;
  subtitle?: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  required?: boolean;
  isAlertTrigger?: boolean; // if answering yes flags a medical alert
  alertMessage?: string;
}

export interface AnamnesisCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface BodyAreaSelection {
  id: string;
  name: string;
  type: 'dor_tensao' | 'estetica_gordura' | 'retencao_celulite' | 'relaxamento';
  intensity?: number; // 1-10
}

export interface AnamnesisRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  createdAt: string;
  updatedAt: string;
  doctorName: string;
  status: 'concluido' | 'em_andamento';
  answers: Record<string, any>;
  bodyAreas: BodyAreaSelection[];
  pressurePreference: 'Suave / Relaxante' | 'Média / Terapêutica' | 'Firme / Profunda' | 'Vigorosa / Modeladora';
  mainObjective: string;
  detectedAlerts: string[];
  clinicalObservations: string;
  recommendedTechniques: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  service: string;
  date: string;
  time: string;
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
  notes?: string;
  durationMinutes: number;
  price?: number;
}

export interface EvolutionSession {
  id: string;
  patientId: string;
  anamnesisId?: string;
  sessionNumber: number;
  date: string;
  technique: string;
  areasTreated: string[];
  patientFeedback: string;
  therapistNotes: string;
  measurements?: {
    weight?: number;
    waist?: number;
    abdomen?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
}

export interface BackendJsonDoc {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  authRequired: boolean;
  requiredRole?: string;
  requestPayload?: any;
  responsePayload: any;
}
