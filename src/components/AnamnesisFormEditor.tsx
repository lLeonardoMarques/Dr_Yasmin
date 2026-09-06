import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Save, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { AnamnesisQuestion, AnamnesisCategory, QuestionType } from '../types';

interface AnamnesisFormEditorProps {
  questions: AnamnesisQuestion[];
  categories: AnamnesisCategory[];
  onUpdateQuestions: (updatedQuestions: AnamnesisQuestion[]) => void;
}

export function AnamnesisFormEditor({
  questions,
  categories,
  onUpdateQuestions
}: AnamnesisFormEditorProps) {
  const [questionList, setQuestionList] = useState<AnamnesisQuestion[]>(questions);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New question form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0].id);
  const [newType, setNewType] = useState<QuestionType>('radio');
  const [newOptionsText, setNewOptionsText] = useState('Sim, Não');
  const [newIsAlert, setNewIsAlert] = useState(false);
  const [newAlertMsg, setNewAlertMsg] = useState('');

  const handleAddNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const parsedOptions = newOptionsText.split(',').map(o => ({
      label: o.trim(),
      value: o.trim().toLowerCase().replace(/\s+/g, '_')
    }));

    const newQuestionItem: AnamnesisQuestion = {
      id: `q_custom_${Date.now()}`,
      categoryId: newCategoryId,
      label: newLabel.trim(),
      subtitle: newSubtitle.trim() || undefined,
      type: newType,
      options: ['radio', 'select', 'checkbox'].includes(newType) ? parsedOptions : undefined,
      required: false,
      isAlertTrigger: newIsAlert,
      alertMessage: newAlertMsg || undefined
    };

    const updated = [...questionList, newQuestionItem];
    setQuestionList(updated);
    onUpdateQuestions(updated);
    setIsAddingNew(false);

    // Reset
    setNewLabel('');
    setNewSubtitle('');
    setNewOptionsText('Sim, Não');
    setNewIsAlert(false);
    setNewAlertMsg('');
    triggerSaveFeedback();
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questionList.filter(q => q.id !== id);
    setQuestionList(updated);
    onUpdateQuestions(updated);
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const filteredQuestions = selectedCategory === 'todos'
    ? questionList
    : questionList.filter(q => q.categoryId === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="anamnesis-form-editor">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
            Configuração dos Formulários
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Personalizar Perguntas da Anamnese
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-lg">
            A Dra. Yasmin pode adicionar novas perguntas, editar campos clínicos e marcar gatilhos de contraindicação específicos para massoterapia e estética corporal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Alterações Salvas!
            </span>
          )}
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Nova Pergunta</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('todos')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            selectedCategory === 'todos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todas as Categorias ({questionList.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Modal / Card for Adding New Question */}
      {isAddingNew && (
        <form onSubmit={handleAddNewQuestion} className="bg-white rounded-2xl p-6 border-2 border-teal-500 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Nova Pergunta no Formulário Clínico</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Enunciado da Pergunta *</label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ex: Faz uso de anti-inflamatórios regularmente?"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoria Clínica</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Resposta</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as QuestionType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              >
                <option value="radio">Múltipla Escolha (1 Opção)</option>
                <option value="checkbox">Caixas de Seleção (Várias Opções)</option>
                <option value="select">Menu Dropdown</option>
                <option value="scale">Escala de Intensidade (1 a 5)</option>
                <option value="textarea">Texto Livre Longo</option>
                <option value="text">Texto Curto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opções (separadas por vírgula)</label>
              <input
                type="text"
                value={newOptionsText}
                onChange={(e) => setNewOptionsText(e.target.value)}
                placeholder="Ex: Sim, Não, Ocasionalmente"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsAlert}
                onChange={(e) => setNewIsAlert(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-xs font-bold text-amber-950">
                Esta pergunta é um sinal de alerta / contraindicação clínica
              </span>
            </label>
            {newIsAlert && (
              <input
                type="text"
                value={newAlertMsg}
                onChange={(e) => setNewAlertMsg(e.target.value)}
                placeholder="Mensagem de alerta da Dra. Yasmin se responder afirmativo..."
                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              Salvar Pergunta
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, index) => {
          const category = categories.find(c => c.id === q.categoryId);
          return (
            <div
              key={q.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {category?.title.split('.')[1]?.trim() || category?.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Tipo: {q.type}
                  </span>
                  {q.isAlertTrigger && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" /> Alerta
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{q.label}</h3>
                {q.subtitle && <p className="text-xs text-slate-500">{q.subtitle}</p>}
                {q.options && q.options.length > 0 && (
                  <p className="text-[11px] text-slate-400">
                    Opções: {q.options.map(o => o.label).join(' • ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Excluir pergunta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
