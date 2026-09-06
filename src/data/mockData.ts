import { 
  User, 
  Patient, 
  AnamnesisCategory, 
  AnamnesisQuestion, 
  AnamnesisRecord, 
  Appointment, 
  EvolutionSession 
} from '../types';

export const DOCTOR_PROFILE: User = {
  id: 'doc-yasmin-01',
  name: 'Dra. Yasmin Oliveira',
  email: 'admin@toquedabeleza.com',
  phone: '(11) 99123-4567',
  role: 'DOCTOR',
  createdAt: '2026-01-01'
};

export const INITIAL_PATIENTS: Patient[] = [];

export const ANAMNESIS_CATEGORIES: AnamnesisCategory[] = [
  {
    id: 'cat-habitos',
    title: '1. Hábitos de Vida & Rotina',
    description: 'Estilo de vida, sono, estresse, hidratação e atividade diária do paciente.',
    iconName: 'HeartPulse'
  },
  {
    id: 'cat-saude',
    title: '2. Histórico Clínico & Contraindicações',
    description: 'Alergias, patologias vasculares, cirurgias, próteses e sinais de alerta.',
    iconName: 'ShieldAlert'
  },
  {
    id: 'cat-queixas',
    title: '3. Queixas Principais & Foco Terapêutico',
    description: 'Motivo da consulta, intensidade da dor, tensões e objetivos corporais.',
    iconName: 'Activity'
  },
  {
    id: 'cat-estetica',
    title: '4. Avaliação Estética Corporal',
    description: 'Análise de retenção de líquidos, celulite, flacidez e tônus tecidual.',
    iconName: 'Sparkles'
  },
  {
    id: 'cat-mapa',
    title: '5. Mapa Corporal & Preferência de Pressão',
    description: 'Seleção das zonas prioritárias para massagem e intensidade do toque.',
    iconName: 'UserCheck'
  },
  {
    id: 'cat-conclusao',
    title: '6. Diagnóstico & Conduta da Dra. Yasmin',
    description: 'Parecer profissional, plano de sessões recomendadas e consentimento.',
    iconName: 'FileCheck'
  }
];

export const INITIAL_QUESTIONS: AnamnesisQuestion[] = [
  // Categoria 1: Hábitos
  {
    id: 'q_agua',
    categoryId: 'cat-habitos',
    label: 'Qual a sua ingestão média diária de água?',
    subtitle: 'Essencial para a resposta à drenagem linfática e hidratação dos tecidos.',
    type: 'select',
    required: true,
    options: [
      { label: 'Menos de 1 litro ao dia (Baixa)', value: '< 1L' },
      { label: 'Entre 1L e 2 litros ao dia (Média)', value: '1L - 2L' },
      { label: 'Mais de 2 litros ao dia (Adequada)', value: '> 2L' },
      { label: 'Apenas sucos / chás / refrigerantes', value: 'pouca_agua' }
    ]
  },
  {
    id: 'q_sono',
    categoryId: 'cat-habitos',
    label: 'Como você avalia a qualidade do seu sono?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Reparador (acordo descansada/o)', value: 'reparador' },
      { label: 'Interrompido / Acordo várias vezes', value: 'interrompido' },
      { label: 'Insônia / Dificuldade para iniciar o sono', value: 'insonia' },
      { label: 'Acordo com dores no corpo e cansaço', value: 'cansaco_dores' }
    ]
  },
  {
    id: 'q_estresse',
    categoryId: 'cat-habitos',
    label: 'Como avalia o seu nível atual de estresse e ansiedade?',
    type: 'scale',
    required: true,
    options: [
      { label: '1 - Baixo / Tranquilo', value: '1' },
      { label: '2 - Leve', value: '2' },
      { label: '3 - Moderado', value: '3' },
      { label: '4 - Alto / Tenso frequentemente', value: '4' },
      { label: '5 - Severo / Sobrecarga extrema', value: '5' }
    ]
  },
  {
    id: 'q_atividade',
    categoryId: 'cat-habitos',
    label: 'Pratica atividade física regularmente?',
    type: 'radio',
    options: [
      { label: 'Sedentária(o)', value: 'sedentario' },
      { label: '1 a 2 vezes por semana', value: 'leve' },
      { label: '3 a 5 vezes por semana', value: 'regular' },
      { label: 'Atleta / Treinos diários intensos', value: 'intenso' }
    ]
  },
  {
    id: 'q_postura',
    categoryId: 'cat-habitos',
    label: 'Como é a sua postura principal durante o dia de trabalho?',
    type: 'select',
    options: [
      { label: 'Sentada(o) em computador por mais de 6h', value: 'computador_sentado' },
      { label: 'Em pé por longos períodos', value: 'em_pe' },
      { label: 'Com movimentação constante', value: 'movimento' },
      { label: 'Carrega peso / Esforço repetitivo', value: 'esforco_peso' }
    ]
  },

  // Categoria 2: Histórico Clínico & Contraindicações
  {
    id: 'q_hipertensao',
    categoryId: 'cat-saude',
    label: 'Possui diagnóstico de alteração na Pressão Arterial?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Não, pressão normal / controlada', value: 'normal' },
      { label: 'Hipertensão (Pressão Alta)', value: 'hipertensao', isContraindication: true },
      { label: 'Hipotensão (Pressão Baixa)', value: 'hipotensao' }
    ],
    isAlertTrigger: true,
    alertMessage: 'Atenção especial à temperatura e manobras estimulantes.'
  },
  {
    id: 'q_circulacao',
    categoryId: 'cat-saude',
    label: 'Apresenta varizes, trombose ou fragilidade capilar?',
    subtitle: 'Contraindicação para pressões profundas em membros inferiores se houver histórico de trombose.',
    type: 'checkbox',
    required: true,
    options: [
      { label: 'Nenhum problema circulatório', value: 'nenhum' },
      { label: 'Vasinhos superficiais (Telangiectasias)', value: 'vasinhos' },
      { label: 'Varizes visíveis / proeminentes', value: 'varizes', isContraindication: true },
      { label: 'Histórico de Trombose / Flebite', value: 'trombose', isContraindication: true },
      { label: 'Hematomas fáceis com qualquer toque', value: 'hematomas' }
    ],
    isAlertTrigger: true,
    alertMessage: 'Em caso de trombose recente, massagem profunda é contraindicada.'
  },
  {
    id: 'q_cirurgias_proteses',
    categoryId: 'cat-saude',
    label: 'Possui próteses, pinos metálicos ou cirurgias recentes?',
    type: 'textarea',
    placeholder: 'Ex: Prótese de silicone (2 anos), cirurgia de cesariana, pinos no tornozelo, etc.'
  },
  {
    id: 'q_alergias',
    categoryId: 'cat-saude',
    label: 'Possui alergia a óleos essenciais, cremes ou cosméticos?',
    type: 'textarea',
    placeholder: 'Ex: Alergia a canela, lavanda, parabenos, perfume forte ou nenhum relato...'
  },
  {
    id: 'q_gestante',
    categoryId: 'cat-saude',
    label: 'Está gestante ou em período pós-parto imediato?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Não', value: 'nao' },
      { label: 'Gestante (Necessita posicionamento lateral e drenagem gestacional)', value: 'gestante', isContraindication: true },
      { label: 'Lactante / Pós-parto recente', value: 'lactante' }
    ]
  },

  // Categoria 3: Queixas Principais
  {
    id: 'q_objetivo_principal',
    categoryId: 'cat-queixas',
    label: 'Qual o seu principal objetivo na sessão de hoje?',
    subtitle: 'Para que a Dra. Yasmin personalize o atendimento.',
    type: 'select',
    required: true,
    options: [
      { label: 'Alívio de dores musculares e tensões crônicas', value: 'alivio_dor' },
      { label: 'Relaxamento profundo, alívio do estresse e bem-estar', value: 'relaxamento' },
      { label: 'Drenagem de retenção de líquidos e inchaço', value: 'drenagem' },
      { label: 'Redução de medidas, celulite e contorno corporal', value: 'modeladora' },
      { label: 'Pós-operatório / Recuperação de cirurgia estética', value: 'pos_op' },
      { label: 'Liberação miofascial esportiva', value: 'esportiva' }
    ]
  },
  {
    id: 'q_intensidade_dor',
    categoryId: 'cat-queixas',
    label: 'Se você sente dor ou desconforto, qual o nível (0 a 10)?',
    type: 'scale',
    options: [
      { label: '0 - Sem dor', value: '0' },
      { label: '2 - Leve incômodo', value: '2' },
      { label: '5 - Dor moderada', value: '5' },
      { label: '8 - Dor intensa / limitante', value: '8' },
      { label: '10 - Dor insuportável', value: '10' }
    ]
  },

  // Categoria 4: Estética Corporal
  {
    id: 'q_celulite',
    categoryId: 'cat-estetica',
    label: 'Grau percebido de celulite / fibro edema geloide:',
    type: 'radio',
    options: [
      { label: 'Não perceptível', value: 'grau_0' },
      { label: 'Grau I (Visível apenas ao pinçar a pele)', value: 'grau_1' },
      { label: 'Grau II (Visível em pé, sem contração)', value: 'grau_2' },
      { label: 'Grau III (Nódulos evidentes com desconforto)', value: 'grau_3' }
    ]
  },
  {
    id: 'q_retencao_liquidos',
    categoryId: 'cat-estetica',
    label: 'Sente retenção de líquidos ou inchaço frequente?',
    type: 'radio',
    options: [
      { label: 'Raramente ou nunca', value: 'raro' },
      { label: 'Sim, principalmente no final da tarde', value: 'fim_de_tarde' },
      { label: 'Sim, relacionado ao período menstrual', value: 'periodo_menstrual' },
      { label: 'Inchaço constante em pernas e abdômen', value: 'constante' }
    ]
  },
  {
    id: 'q_flacidez',
    categoryId: 'cat-estetica',
    label: 'Possui queixa de flacidez na pele ou muscular?',
    type: 'select',
    options: [
      { label: 'Não me incomoda', value: 'nenhuma' },
      { label: 'Flacidez leve no abdômen pós-emagrecimento', value: 'abdomen' },
      { label: 'Flacidez na região interna de coxas e braços', value: 'coxas_bracos' },
      { label: 'Flacidez em glúteos', value: 'gluteos' }
    ]
  },

  // Categoria 5: Mapa Corporal & Pressão
  {
    id: 'q_pressao_preferida',
    categoryId: 'cat-mapa',
    label: 'Qual a sua preferência quanto à pressão do toque/massagem?',
    type: 'radio',
    required: true,
    options: [
      { label: 'Suave / Leve (Foco em toque relaxante e sensorial)', value: 'Suave / Relaxante' },
      { label: 'Média / Terapêutica (Firme na medida certa, sem dor aguda)', value: 'Média / Terapêutica' },
      { label: 'Firme / Profunda (Liberação de nós e fáscia muscular)', value: 'Firme / Profunda' },
      { label: 'Vigorosa / Modeladora (Ritmo acelerado para contorno corporal)', value: 'Vigorosa / Modeladora' }
    ]
  },

  // Categoria 6: Diagnóstico & Conduta
  {
    id: 'q_observacoes_dra',
    categoryId: 'cat-conclusao',
    label: 'Parecer Técnico e Conduta Clínica (Dra. Yasmin)',
    subtitle: 'Espaço para anotações do exame palpatório, tônus muscular e plano de tratamento.',
    type: 'textarea',
    placeholder: 'Descreva a avaliação palpatória, presença de trigger points, aderências teciduais e protocolo indicado...'
  }
];

export const BODY_AREAS_LIST = [
  { id: 'cervical', name: 'Pescoço e Cervical', group: 'Superior' },
  { id: 'trapezio', name: 'Trapézio e Ombros', group: 'Superior' },
  { id: 'escapulas', name: 'Dorsal e Escápulas', group: 'Costas' },
  { id: 'lombar', name: 'Lombar e Quadril', group: 'Costas' },
  { id: 'bracos', name: 'Braços e Antebraços', group: 'Superior' },
  { id: 'abdomen', name: 'Abdômen', group: 'Tronco' },
  { id: 'flancos', name: 'Flancos (Cintura)', group: 'Tronco' },
  { id: 'gluteos', name: 'Glúteos', group: 'Inferior' },
  { id: 'coxas_ant', name: 'Coxas (Anterior)', group: 'Inferior' },
  { id: 'coxas_post', name: 'Coxas (Posterior / Culote)', group: 'Inferior' },
  { id: 'panturrilhas', name: 'Panturrilhas e Pernas', group: 'Inferior' },
  { id: 'pes', name: 'Pés e Tornozelos', group: 'Inferior' }
];

export const INITIAL_ANAMNESIS_RECORDS: AnamnesisRecord[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_EVOLUTIONS: EvolutionSession[] = [];

export const CLINIC_SERVICES = [
  { id: 's1', name: 'Massagem Relaxante com Aromaterapia', duration: '60 min', price: 'R$ 160,00', desc: 'Manobras suaves e envolventes para alívio do estresse e bem-estar integral.' },
  { id: 's2', name: 'Drenagem Linfática Manual (Método Clínico)', duration: '60 min', price: 'R$ 180,00', desc: 'Estimulação do fluxo linfático, eliminação de toxinas e combate à retenção de líquidos.' },
  { id: 's3', name: 'Massagem Modeladora Corporal Turbinada', duration: '50 min', price: 'R$ 190,00', desc: 'Manobras rápidas e profundas para reorganização do tecido adiposo e contorno.' },
  { id: 's4', name: 'Liberação Miofascial & Alívio de Dores', duration: '60 min', price: 'R$ 200,00', desc: 'Tratamento de pontos-gatilho (trigger points), contraturas e tensões musculares crônicas.' },
  { id: 's5', name: 'Protocolo Pós-Operatório Estético', duration: '60 min', price: 'R$ 210,00', desc: 'Cuidados especializados para prevenção e tratamento de fibroses, seromas e edema.' },
  { id: 's6', name: 'Massagem com Pedras Vulcânicas Aquecidas', duration: '75 min', price: 'R$ 230,00', desc: 'Termoterapia profunda com pedras de basalto para relaxamento muscular supremo.' }
];
