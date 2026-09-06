import { useState } from 'react';
import { 
  Database, 
  Server, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  ShieldCheck, 
  KeyRound, 
  Globe2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { API_ENDPOINTS_DOCS, MONGO_ATLAS_GUIDE } from '../data/backendDoc';
import { downloadBackendDocumentationFile } from '../utils/exportUtils';

interface BackendGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BackendGuideModal({ isOpen, onClose }: BackendGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'mongo' | 'server' | 'env'>('endpoints');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const currentEndpoint = API_ENDPOINTS_DOCS[selectedEndpointIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        id="backend-guide-modal"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 px-2 py-0.5 rounded-full bg-teal-900/40 border border-teal-700/50">
                  Documentação Técnica de Integração
                </span>
                <span className="text-xs text-slate-400">Node.js + MongoDB Atlas</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                Especificação de JSONs, Servidor e Conexão em Nuvem
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadBackendDocumentationFile}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs transition cursor-pointer"
              title="Baixar especificação em arquivo .json"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo JSON Completo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-2 py-3.5 px-4 font-medium text-sm border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'endpoints'
                ? 'border-teal-600 text-teal-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Rotas e Estrutura de JSONs (Envio/Recebimento)</span>
          </button>
          <button
            onClick={() => setActiveTab('mongo')}
            className={`flex items-center gap-2 py-3.5 px-4 font-medium text-sm border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'mongo'
                ? 'border-teal-600 text-teal-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Guia Passo a Passo MongoDB Atlas</span>
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`flex items-center gap-2 py-3.5 px-4 font-medium text-sm border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'server'
                ? 'border-teal-600 text-teal-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Código Completo: server.js (Node.js/Express)</span>
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-2 py-3.5 px-4 font-medium text-sm border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'env'
                ? 'border-teal-600 text-teal-700 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Variáveis de Ambiente (.env)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto grow space-y-6">
          {/* TAB 1: ENDPOINTS & JSONS */}
          {activeTab === 'endpoints' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Endpoint Selector Sidebar */}
              <div className="lg:col-span-4 space-y-2 border-r border-slate-200 pr-0 lg:pr-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Endpoints Disponíveis
                </p>
                {API_ENDPOINTS_DOCS.map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEndpointIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition text-sm flex flex-col gap-1 cursor-pointer ${
                      selectedEndpointIndex === idx
                        ? 'border-teal-500 bg-teal-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        ep.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                        ep.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ep.method}
                      </span>
                      {ep.requiredRole && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {ep.requiredRole}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-800 mt-1 truncate">
                      {ep.endpoint}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {ep.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Endpoint Details */}
              <div className="lg:col-span-8 space-y-5">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                      currentEndpoint.method === 'POST' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {currentEndpoint.method}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {currentEndpoint.endpoint}
                    </span>
                    {currentEndpoint.authRequired ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> Requer Bearer Token ({currentEndpoint.requiredRole || 'Auth'})
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        Público (Sem Token)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {currentEndpoint.description}
                  </p>
                </div>

                {/* Request Payload */}
                {currentEndpoint.requestPayload && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        JSON Enviado (Request Body):
                      </span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(currentEndpoint.requestPayload, null, 2), 'req')}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      >
                        {copiedCode === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode === 'req' ? 'Copiado!' : 'Copiar JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                      {JSON.stringify(currentEndpoint.requestPayload, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Payload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      JSON Recebido em Resposta (Response Body):
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(currentEndpoint.responsePayload, null, 2), 'res')}
                      className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    >
                      {copiedCode === 'res' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode === 'res' ? 'Copiado!' : 'Copiar JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-teal-400 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                    {JSON.stringify(currentEndpoint.responsePayload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONGO ATLAS GUIDE */}
          {activeTab === 'mongo' && (
            <div className="space-y-6">
              <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <p className="font-semibold text-teal-900">
                    Hospedagem Gratuita no MongoDB Atlas (Free Tier M0)
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    O MongoDB Atlas armazena com segurança na nuvem todos os pacientes, fichas de anamnese da Dra. Yasmin e consultas. Siga os 4 passos abaixo para criar seu cluster e obter a chave de conexão.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MONGO_ATLAS_GUIDE.steps.map((step) => (
                  <div 
                    key={step.step}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                          {step.step}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {step.title}
                        </h3>
                      </div>
                      <ul className="mt-3 space-y-2 text-xs text-slate-600">
                        {step.instructions.map((inst, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Architecture Diagram */}
              <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Fluxo de Conexão da Arquitetura
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs font-bold text-teal-300">Front-End (React + Vite)</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Envia requisições HTTP REST com payloads em JSON e token JWT no header.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs font-bold text-emerald-300">Servidor Node.js (Express)</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Processa regras de negócio, valida permissões (Dra. Yasmin vs Paciente) e criptografa senhas.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs font-bold text-blue-300">MongoDB Atlas (Nuvem)</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cluster em nuvem seguro com réplicas automáticas e criptografia de dados em repouso.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVER.JS CODE */}
          {activeTab === 'server' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Arquivo server.js Pronto para Execução
                  </h3>
                  <p className="text-xs text-slate-500">
                    Código completo em JavaScript (Express + Mongoose + JWT) com todas as rotas e regras de controle de acesso.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(MONGO_ATLAS_GUIDE.serverCodeJs, 'server-code')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
                  >
                    {copiedCode === 'server-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'server-code' ? 'Código Copiado!' : 'Copiar Todo o Código'}</span>
                  </button>
                  <button
                    onClick={downloadBackendDocumentationFile}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Estrutura</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed border border-slate-800">
                  {MONGO_ATLAS_GUIDE.serverCodeJs}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: ENV CONFIG */}
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Arquivo de Configuração .env
                  </h3>
                  <p className="text-xs text-slate-500">
                    Armazene na raiz do servidor para manter a senha do MongoDB Atlas e chaves JWT protegidas.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(MONGO_ATLAS_GUIDE.envFileExample, 'env-code')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer"
                >
                  {copiedCode === 'env-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'env-code' ? 'Copiado!' : 'Copiar .env'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-teal-400 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                {MONGO_ATLAS_GUIDE.envFileExample}
              </pre>

              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">Instruções de Inicialização Local:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Crie uma pasta no seu computador chamada <code className="bg-slate-200 px-1 py-0.5 rounded">servidor-dra-yasmin</code>.</li>
                  <li>Salve o código da aba anterior como <code className="bg-slate-200 px-1 py-0.5 rounded">server.js</code> e este arquivo como <code className="bg-slate-200 px-1 py-0.5 rounded">.env</code>.</li>
                  <li>Execute no terminal: <code className="bg-slate-200 px-1 py-0.5 rounded">npm init -y</code> e em seguida <code className="bg-slate-200 px-1 py-0.5 rounded">npm install express mongoose dotenv cors bcryptjs jsonwebtoken</code>.</li>
                  <li>Inicie o servidor com: <code className="bg-slate-200 px-1 py-0.5 rounded">node server.js</code>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500">
            Estrutura padronizada para Dra. Yasmin | Massoterapia & Estética Corporal
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer"
            >
              Fechar Guia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
