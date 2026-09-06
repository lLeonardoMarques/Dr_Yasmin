import { BackendJsonDoc } from '../types';

export const API_ENDPOINTS_DOCS: BackendJsonDoc[] = [
  {
    endpoint: '/api/auth/register',
    method: 'POST',
    description: 'Cadastra um novo usuário no sistema (paciente ou profissional). Exige nome, e-mail, telefone e senha.',
    authRequired: false,
    requestPayload: {
      name: "Mariana Souza",
      email: "mariana.souza@email.com",
      phone: "(11) 98765-4321",
      password: "senhaSegura123*",
      role: "PATIENT"
    },
    responsePayload: {
      success: true,
      message: "Usuário cadastrado com sucesso",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        id: "66d92f1b4e5f7a0012345678",
        name: "Mariana Souza",
        email: "mariana.souza@email.com",
        phone: "(11) 98765-4321",
        role: "PATIENT",
        createdAt: "2026-09-06T12:00:00.000Z"
      }
    }
  },
  {
    endpoint: '/api/auth/login',
    method: 'POST',
    description: 'Autentica a Dra. Yasmin (acesso total) ou um Paciente (acesso restrito às suas consultas e ficha).',
    authRequired: false,
    requestPayload: {
      email: "dra.yasmin@clinica.com",
      password: "adminPassword2026!"
    },
    responsePayload: {
      success: true,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        id: "66d92f004e5f7a0012340001",
        name: "Dra. Yasmin Oliveira",
        email: "dra.yasmin@clinica.com",
        phone: "(11) 99123-4567",
        role: "DOCTOR"
      }
    }
  },
  {
    endpoint: '/api/patients',
    method: 'POST',
    description: 'Cria novo prontuário e ficha de paciente (exclusivo para Dra. Yasmin ou gerado no cadastro de paciente).',
    authRequired: true,
    requiredRole: 'DOCTOR ou PATIENT',
    requestPayload: {
      name: "Camila Rodrigues",
      email: "camila.rodrigues@email.com",
      phone: "(11) 97654-3210",
      birthDate: "1994-06-18",
      gender: "Feminino",
      occupation: "Designer de Interiores",
      emergencyContact: "Carlos (Esposo)",
      emergencyPhone: "(11) 97111-2222",
      treatmentType: "Drenagem Linfática e Modeladora",
      notes: "Queixa de inchaço nos membros inferiores ao fim do dia."
    },
    responsePayload: {
      success: true,
      patient: {
        _id: "66d931aa4e5f7a0012349999",
        name: "Camila Rodrigues",
        email: "camila.rodrigues@email.com",
        phone: "(11) 97654-3210",
        birthDate: "1994-06-18",
        status: "ativo",
        treatmentType: "Drenagem Linfática e Modeladora",
        totalSessions: 0,
        createdAt: "2026-09-06T12:15:00.000Z"
      }
    }
  },
  {
    endpoint: '/api/patients',
    method: 'GET',
    description: 'Lista pacientes com suporte a busca rápida (query) e filtros (treatmentType, status). Exclusivo Dra. Yasmin.',
    authRequired: true,
    requiredRole: 'DOCTOR',
    responsePayload: {
      success: true,
      total: 24,
      patients: [
        {
          _id: "66d931aa4e5f7a0012349999",
          name: "Camila Rodrigues",
          email: "camila.rodrigues@email.com",
          phone: "(11) 97654-3210",
          status: "ativo",
          treatmentType: "Drenagem Linfática e Modeladora",
          lastVisit: "2026-09-02",
          totalSessions: 4
        }
      ]
    }
  },
  {
    endpoint: '/api/anamnesis',
    method: 'POST',
    description: 'Salva a Ficha de Anamnese completa preenchida no fluxo interativo passo a passo.',
    authRequired: true,
    requiredRole: 'DOCTOR',
    requestPayload: {
      patientId: "66d931aa4e5f7a0012349999",
      pressurePreference: "Média / Terapêutica",
      mainObjective: "Alívio de dor crônica na região lombar e drenagem de retenção em membros inferiores",
      bodyAreas: [
        { id: "lombar", name: "Lombar", type: "dor_tensao", intensity: 8 },
        { id: "trapézio", name: "Pescoço e Trapézio", type: "dor_tensao", intensity: 6 },
        { id: "pernas", name: "Pernas e Panturrilhas", type: "retencao_celulite", intensity: 5 }
      ],
      answers: {
        agua_litros: "2.5L ao dia",
        sono_qualidade: "Irregular (acorda com cansaço)",
        atividade_fisica: "Musculação 2x na semana",
        nivel_estresse: "Alto",
        hipertensao: "Não",
        varizes_trombose: "Varizes leves em membros inferiores",
        diabetes: "Não",
        protese_metalica: "Não possui",
        alergias: "Sensibilidade a fragrâncias cítricas fortes",
        gestante_lactante: "Não",
        dor_frequencia: "Diária ao final do expediente de trabalho",
        grau_celulite: "Grau II em glúteos e coxas posteriores"
      },
      detectedAlerts: ["Varizes leves em membros inferiores (evitar pressão excessiva localizada)"],
      clinicalObservations: "Paciente com postura sentada prolongada. Recomendado protocolo misto: Liberação Miofascial em trapézio/lombar + Drenagem Linfática Manual suave nas pernas.",
      recommendedTechniques: ["Massagem Relaxante com Óleo Aquecido", "Liberação Miofascial", "Drenagem Linfática Manual"]
    },
    responsePayload: {
      success: true,
      message: "Ficha de anamnese salva com sucesso no prontuário do paciente",
      anamnesisId: "66d934bb4e5f7a0012348888",
      createdAt: "2026-09-06T12:30:00.000Z"
    }
  },
  {
    endpoint: '/api/appointments',
    method: 'POST',
    description: 'Agendamento de nova consulta. Pacientes podem solicitar horários e Dra. Yasmin confirma.',
    authRequired: true,
    requestPayload: {
      patientId: "66d931aa4e5f7a0012349999",
      service: "Massagem Relaxante com Aromaterapia (60min)",
      date: "2026-09-15",
      time: "14:30",
      notes: "Foco especial na tensão dos ombros."
    },
    responsePayload: {
      success: true,
      message: "Consulta agendada com sucesso!",
      appointment: {
        _id: "66d936cc4e5f7a0012347777",
        patientName: "Camila Rodrigues",
        service: "Massagem Relaxante com Aromaterapia (60min)",
        date: "2026-09-15",
        time: "14:30",
        status: "agendado"
      }
    }
  },
  {
    endpoint: '/api/appointments/my',
    method: 'GET',
    description: 'Retorna todas as consultas agendadas e histórico do paciente logado.',
    authRequired: true,
    requiredRole: 'PATIENT',
    responsePayload: {
      success: true,
      appointments: [
        {
          _id: "66d936cc4e5f7a0012347777",
          service: "Massagem Relaxante com Aromaterapia (60min)",
          date: "2026-09-15",
          time: "14:30",
          status: "agendado",
          doctorName: "Dra. Yasmin"
        }
      ]
    }
  }
];

export const MONGO_ATLAS_GUIDE = {
  title: "Guia Passo a Passo: Criação do Banco MongoDB Atlas & Servidor Node.js",
  steps: [
    {
      step: 1,
      title: "Criação da Conta e Cluster no MongoDB Atlas",
      instructions: [
        "Acesse https://www.mongodb.com/cloud/atlas e crie uma conta gratuita.",
        "Selecione 'Build a Database' e escolha a opção M0 (Cluster Gratuito / Free Tier).",
        "Escolha a nuvem (AWS ou Google Cloud) e a região mais próxima (ex: sa-east-1 São Paulo).",
        "Clique em 'Create Cluster' (leva cerca de 1 a 2 minutos para provisionar)."
      ]
    },
    {
      step: 2,
      title: "Criação do Usuário do Banco de Dados (Database User)",
      instructions: [
        "No menu lateral esquerdo do Atlas, acesse 'Security' -> 'Database Access'.",
        "Clique em 'Add New Database User'.",
        "Método de autenticação: Password (Senha).",
        "Defina um Username (ex: yasmin_admin) e gere uma Senha Forte (ex: YasminClinica@2026).",
        "Nas permissões ('Database User Privileges'), selecione 'Read and write to any database'.",
        "Clique em 'Add User'."
      ]
    },
    {
      step: 3,
      title: "Configuração de Acesso de Rede (Network Access)",
      instructions: [
        "No menu lateral esquerdo, acesse 'Security' -> 'Network Access'.",
        "Clique em 'Add IP Address'.",
        "Para desenvolvimento ou hospedagem em nuvem (Vercel, Render, Heroku), escolha 'Allow Access from Anywhere' (0.0.0.0/0).",
        "Clique em 'Confirm' e aguarde o status mudar para 'Active'."
      ]
    },
    {
      step: 4,
      title: "Obter a String de Conexão (Connection URI)",
      instructions: [
        "Vá em 'Database' no menu e clique no botão 'Connect' no seu Cluster.",
        "Escolha a opção 'Drivers' (Node.js).",
        "Copie a URL fornecida, que possui o seguinte formato:",
        "mongodb+srv://<usuario>:<senha>@cluster0.abcde.mongodb.net/clinica_yasmin?retryWrites=true&w=majority",
        "Substitua <usuario> e <senha> pelas credenciais criadas no Passo 2."
      ]
    }
  ],
  serverCodeJs: `// ==============================================================================
// SERVIDOR COMPLETO EXPRESS + MONGOOSE (Node.js) PARA SISTEMA DRA. YASMIN
// Arquivo: server.js
// Instalação de dependências:
// npm init -y
// npm install express mongoose dotenv cors bcryptjs jsonwebtoken
// Execução: node server.js ou nodemon server.js
// ==============================================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_dra_yasmin_super_segura_2026';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yasmin_admin:SUA_SENHA_AQUI@cluster0.abcde.mongodb.net/clinica_yasmin?retryWrites=true&w=majority';

// -----------------------------------------------------------------------------
// 1. MIDDLEWARES BÁSICOS
// -----------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// 2. CONEXÃO COM O BANCO DE DADOS MONGO ATLAS
// -----------------------------------------------------------------------------
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado com sucesso ao MongoDB Atlas (Clínica Dra. Yasmin)'))
  .catch(err => {
    console.error('❌ Erro na conexão com MongoDB Atlas:', err.message);
    process.exit(1);
  });

// -----------------------------------------------------------------------------
// 3. SCHEMAS E MODELOS DO MONGOOSE
// -----------------------------------------------------------------------------

// Esquema de Usuário (Dra. Yasmin ou Paciente)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['DOCTOR', 'PATIENT'], default: 'PATIENT' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Esquema de Paciente (Prontuário base)
const PatientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  birthDate: { type: String },
  gender: { type: String, enum: ['Feminino', 'Masculino', 'Outro'], default: 'Feminino' },
  occupation: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  status: { type: String, enum: ['ativo', 'inativo', 'retorno_pendente'], default: 'ativo' },
  treatmentType: { type: String, default: 'Massoterapia e Estética Corporal' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', PatientSchema);

// Esquema de Ficha de Anamnese Especializada
const AnamnesisSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorName: { type: String, default: 'Dra. Yasmin' },
  pressurePreference: { 
    type: String, 
    enum: ['Suave / Relaxante', 'Média / Terapêutica', 'Firme / Profunda', 'Vigorosa / Modeladora'],
    default: 'Média / Terapêutica' 
  },
  mainObjective: { type: String, required: true },
  bodyAreas: [{
    id: String,
    name: String,
    type: String,
    intensity: Number
  }],
  answers: { type: mongoose.Schema.Types.Mixed, required: true }, // Respostas dinâmicas das perguntas
  detectedAlerts: [{ type: String }],
  clinicalObservations: { type: String },
  recommendedTechniques: [{ type: String }],
  status: { type: String, enum: ['concluido', 'em_andamento'], default: 'concluido' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Anamnesis = mongoose.model('Anamnesis', AnamnesisSchema);

// Esquema de Agendamento de Consultas
const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['agendado', 'confirmado', 'realizado', 'cancelado'], default: 'agendado' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// -----------------------------------------------------------------------------
// 4. MIDDLEWARES DE AUTENTICAÇÃO E PERMISSÃO
// -----------------------------------------------------------------------------

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token de autenticação não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Formato de token inválido' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = decoded; // { id, role, email }
    next();
  });
}

function requireDoctor(req, res, next) {
  if (req.user && req.user.role === 'DOCTOR') {
    next();
  } else {
    res.status(403).json({ error: 'Acesso negado: Exclusivo para Dra. Yasmin' });
  }
}

// -----------------------------------------------------------------------------
// 5. ROTAS DE AUTENTICAÇÃO
// -----------------------------------------------------------------------------

// Registro de Usuário (Nome, Telefone, E-mail, Senha)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Nome, e-mail, telefone e senha são obrigatórios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: assignedRole
    });

    // Se for paciente, cria automaticamente o registro na tabela de pacientes
    if (assignedRole === 'PATIENT') {
      await Patient.create({
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        treatmentType: 'Massoterapia e Estética Corporal'
      });
    }

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// 6. ROTAS DE PACIENTES (Dra. Yasmin: Total | Paciente: Apenas os seus dados)
// -----------------------------------------------------------------------------

// Listar Pacientes com Busca e Filtros (Exclusivo Dra. Yasmin)
app.get('/api/patients', authMiddleware, requireDoctor, async (req, res) => {
  try {
    const { search, treatmentType, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (treatmentType) filter.treatmentType = treatmentType;
    if (status) filter.status = status;

    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cadastrar Paciente Manualmente (Dra. Yasmin)
app.post('/api/patients', authMiddleware, requireDoctor, async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// 7. ROTAS DE ANAMNESE E PRONTUÁRIO
// -----------------------------------------------------------------------------

// Salvar Ficha de Anamnese (Exclusivo Dra. Yasmin)
app.post('/api/anamnesis', authMiddleware, requireDoctor, async (req, res) => {
  try {
    const anamnesis = await Anamnesis.create(req.body);
    // Atualiza status do paciente
    await Patient.findByIdAndUpdate(req.body.patientId, {
      $inc: { totalSessions: 1 },
      lastVisit: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ success: true, anamnesis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter Anamneses de um Paciente
app.get('/api/anamnesis/patient/:patientId', authMiddleware, async (req, res) => {
  try {
    // Se for paciente, garante que ele só acesse os próprios dados
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findById(req.params.patientId);
      if (!patient || patient.email !== req.user.email) {
        return res.status(403).json({ error: 'Você só pode visualizar seus próprios registros' });
      }
    }

    const records = await Anamnesis.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// 8. ROTAS DE AGENDAMENTO DE CONSULTAS
// -----------------------------------------------------------------------------

// Paciente ou Dra. Yasmin agenda consulta
app.post('/api/appointments', authMiddleware, async (req, res) => {
  try {
    const { patientId, service, date, time, notes } = req.body;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Paciente não encontrado' });

    const appointment = await Appointment.create({
      patientId,
      patientName: patient.name,
      patientPhone: patient.phone,
      service,
      date,
      time,
      notes,
      status: 'agendado'
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar Consultas do Paciente Logado
app.get('/api/appointments/my', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findOne({ email: req.user.email });
    if (!patient) return res.json({ success: true, appointments: [] });

    const appointments = await Appointment.find({ patientId: patient._id }).sort({ date: 1, time: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dra. Yasmin lista todas as consultas
app.get('/api/appointments', authMiddleware, requireDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1, time: 1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dra. Yasmin atualiza status da consulta (confirmar/realizar/cancelar)
app.patch('/api/appointments/:id', authMiddleware, requireDoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// INICIALIZAÇÃO DO SERVIDOR
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(\`🚀 Servidor da Clínica Dra. Yasmin rodando na porta \${PORT}\`);
  console.log(\`📌 Documentação e schemas ativos para integração com MongoDB Atlas\`);
});
`,
  envFileExample: `# ==============================================================================
# CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - CLÍNICA DRA. YASMIN
# Salvar como .env na raiz do backend
# ==============================================================================
PORT=5000
NODE_ENV=production

# String de Conexão obtida no painel do MongoDB Atlas:
MONGO_URI=mongodb+srv://yasmin_admin:SuaSenhaSegura2026@cluster0.abcde.mongodb.net/clinica_yasmin?retryWrites=true&w=majority

# Chave secreta para criptografia de tokens JWT:
JWT_SECRET=super_secret_yasmin_jwt_token_2026_massoterapia_estetica
`
};
