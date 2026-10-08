import React, { useState, useEffect } from 'react';
import { db } from './db';
import { Feather, Plus, Trash2, Heart, Lock, Unlock, KeyRound, Sparkles, MessageSquare } from 'lucide-react';

const AUSTEN_THEME = {
  bgStyle: {
    backgroundColor: '#fdfbf7',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cg fill='%237a2e39' fill-opacity='0.07'%3E%3Ccircle cx='35' cy='35' r='12'/%3E%3Cpath d='M35 18c-7 0-12 5-12 10 0 10 12 18 12 18s12-8 12-18c0-5-5-10-12-10z'/%3E%3Cpath d='M10 60 Q 30 45 50 65 M22 56 Q 16 48 10 50 M32 58 Q 40 50 44 52' stroke='%234a3b32' stroke-width='1.5' stroke-opacity='0.1' fill='none'/%3E%3Ccircle cx='105' cy='105' r='10'/%3E%3Cpath d='M105 90c-6 0-10 4-10 8 0 8 10 14 10 14s10-6 10-14c0-4-4-8-10-8z'/%3E%3Cpath d='M80 120 Q 100 100 125 125 M92 112 Q 86 104 80 106' stroke='%234a3b32' stroke-width='1.5' stroke-opacity='0.1' fill='none'/%3E%3C/g%3E%3C/svg%3E")`
  },
  card: 'bg-[#f7f3eb]/95 border-2 border-double border-[#d8cea8] shadow-md shadow-[#8c7a6b]/10 relative overflow-hidden',
  text: 'text-[#4a3b32]',
  primary: 'bg-[#7a2e39] text-[#fdfbf7] hover:bg-[#5e222b] font-serif shadow-sm',
  font: 'font-handwriting text-2xl leading-relaxed',
  title: 'Diário do Desabafo'
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Nova propriedade: categoria ativa ('desabafo' ou 'ideia')
  const [activeCategory, setActiveCategory] = useState('desabafo');

  // Estados de Segurança / Senha
  const [savedPin, setSavedPin] = useState(localStorage.getItem('diario_pin') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!localStorage.getItem('diario_pin'));
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');

  const theme = AUSTEN_THEME;

  useEffect(() => {
    if (isAuthenticated) {
      loadEntries();
    }
  }, [isAuthenticated]);

  async function loadEntries() {
    const allEntries = await db.entries.orderBy('createdAt').reverse().toArray();
    setEntries(allEntries);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!content.trim()) return;

    await db.entries.add({
      title: title.trim() || (activeCategory === 'ideia' ? 'Insight' : 'Desabafo'),
      content,
      category: activeCategory,
      createdAt: new Date().toISOString()
    });

    setTitle('');
    setContent('');
    loadEntries();
  }

  async function handleDelete(id) {
    await db.entries.delete(id);
    loadEntries();
  }

  function handleUnlock(e) {
    e.preventDefault();
    if (inputPin === savedPin) {
      setIsAuthenticated(true);
      setPinError('');
      setInputPin('');
    } else {
      setPinError('Senha incorreta. Tente novamente.');
    }
  }

  function handleSaveNewPin(e) {
    e.preventDefault();
    if (newPin.length < 4) {
      alert('A senha deve ter no mínimo 4 caracteres ou dígitos.');
      return;
    }
    localStorage.setItem('diario_pin', newPin);
    setSavedPin(newPin);
    setShowPinModal(false);
    setNewPin('');
    alert('Senha salva com sucesso no seu dispositivo!');
  }

  function handleRemovePin() {
    if (confirm('Deseja realmente remover a proteção por senha?')) {
      localStorage.removeItem('diario_pin');
      setSavedPin('');
      setShowPinModal(false);
      alert('Proteção por senha removida.');
    }
  }

  // Filtrar registros com base na categoria selecionada
  const filteredEntries = entries.filter((item) => (item.category || 'desabafo') === activeCategory);

  // TELA DE BLOQUEIO
  if (!isAuthenticated) {
    return (
      <div style={theme.bgStyle} className={`min-h-screen flex items-center justify-center p-4 ${theme.text} ${theme.font}`}>
        <form onSubmit={handleUnlock} className={`max-w-md w-full p-8 rounded-xl ${theme.card} space-y-6 text-center shadow-xl`}>
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-current/5">
              <Lock size={40} className="opacity-80" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Diário Protegido</h1>
            <p className="text-sm opacity-70 mt-1 font-sans">Digite sua senha para acessar seus registros confidenciais.</p>
          </div>

          <input
            type="password"
            placeholder="Digite a senha..."
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value)}
            className="w-full text-center text-2xl tracking-widest p-3 rounded-lg border border-current/20 bg-transparent outline-none font-sans"
            autoFocus
            required
          />

          {pinError && <p className="text-red-500 text-sm font-sans">{pinError}</p>}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg transition-all cursor-pointer font-sans ${theme.primary}`}
          >
            Desbloquear Diário
          </button>
        </form>
      </div>
    );
  }

  return (
    <div 
      style={theme.bgStyle} 
      className={`min-h-screen ${theme.text} ${theme.font} transition-colors duration-300 p-4 md:p-8 relative`}
    >
      <header className="max-w-3xl mx-auto flex justify-between items-center mb-8 pb-4 border-b border-current/15">
        <div className="flex items-center gap-3">
          <Feather className="text-[#7a2e39] opacity-90" size={28} />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{theme.title}</h1>
        </div>
        
        <button
          onClick={() => setShowPinModal(true)}
          className="p-2 rounded-lg border border-current/20 hover:bg-current/10 transition-all cursor-pointer"
          title="Configurar senha de segurança"
        >
          {savedPin ? <Lock size={18} className="text-emerald-600" /> : <Unlock size={18} className="opacity-60" />}
        </button>
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        
        {/* Seletor de Categoria (Desabafos vs Ideias) */}
        <div className="flex gap-3 justify-center font-sans text-sm">
          <button
            onClick={() => setActiveCategory('desabafo')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all cursor-pointer ${
              activeCategory === 'desabafo'
                ? 'bg-[#7a2e39] text-white border-[#7a2e39] font-medium shadow-sm'
                : 'bg-[#f7f3eb]/80 border-[#d8cea8] opacity-75 hover:opacity-100'
            }`}
          >
            <MessageSquare size={16} />
            Desabafos
          </button>

          <button
            onClick={() => setActiveCategory('ideia')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all cursor-pointer ${
              activeCategory === 'ideia'
                ? 'bg-[#7a2e39] text-white border-[#7a2e39] font-medium shadow-sm'
                : 'bg-[#f7f3eb]/80 border-[#d8cea8] opacity-75 hover:opacity-100'
            }`}
          >
            <Sparkles size={16} />
            Ideias & Insights
          </button>
        </div>

        {/* Caixa de Entrada */}
        <form onSubmit={handleSave} className={`p-6 md:p-8 rounded-xl ${theme.card} space-y-4 backdrop-blur-xs relative`}>
          
          <div className="absolute top-3 right-4 pointer-events-none select-none text-[#7a2e39] opacity-40 text-lg">
            {activeCategory === 'ideia' ? '✨ 💡' : '🌹 🌿'}
          </div>

          <input
            type="text"
            placeholder={activeCategory === 'ideia' ? "Título do insight ou ideia..." : "Título ou data de hoje..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-xl md:text-2xl font-semibold outline-none placeholder:opacity-35"
          />

          <textarea
            rows="6"
            placeholder={
              activeCategory === 'ideia'
                ? "Registre sua ideia, projeto ou pensamento criativo..."
                : "Escreva aqui seu desabafo..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent outline-none resize-none placeholder:opacity-35 leading-relaxed border-t border-current/10 pt-3"
            required
          />

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all cursor-pointer ${theme.primary}`}
            >
              <Plus size={18} /> {activeCategory === 'ideia' ? 'Salvar Ideia' : 'Salvar Desabafo'}
            </button>
          </div>
        </form>

        {/* Lista de Registros Filtrada */}
        <section className="space-y-4">
          <div className="flex items-center justify-between opacity-80 border-b pb-2 border-current/10">
            <h2 className="text-xl font-semibold">
              {activeCategory === 'ideia' ? 'Suas Ideias & Insights' : 'Seus Desabafos'}
            </h2>
            <span className="text-sm italic opacity-70">
              {activeCategory === 'ideia' ? '✨ Caderno de Inspirações' : '🌹 Páginas de Memória'}
            </span>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 opacity-50 italic space-y-2">
              <p>
                {activeCategory === 'ideia' 
                  ? 'Nenhuma ideia registrada ainda. Registre seus lampejos de inspiração!' 
                  : 'Nenhum desabafo registrado ainda. Escreva o que estiver no seu coração.'}
              </p>
            </div>
          ) : (
            filteredEntries.map((item) => (
              <div key={item.id} className={`p-6 rounded-xl ${theme.card} space-y-3 relative group transition-all`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xl md:text-2xl">{item.title}</h3>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-40 hover:opacity-100 text-red-500 transition-opacity p-1 cursor-pointer"
                    title="Excluir registro"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="whitespace-pre-wrap opacity-90 leading-relaxed">{item.content}</p>
                <div className="flex justify-between items-center text-xs opacity-50 pt-2 border-t border-current/10 font-sans">
                  <span>{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                  {activeCategory === 'ideia' ? (
                    <Sparkles size={14} className="opacity-50 text-amber-700" />
                  ) : (
                    <Heart size={14} className="opacity-50 text-[#7a2e39]" />
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* MODAL DE CONFIGURAÇÃO DA SENHA */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans text-slate-800">
          <div className="bg-white p-6 md:p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-2 font-bold text-xl">
              <KeyRound className="text-slate-700" size={22} />
              <h3>Segurança do Diário</h3>
            </div>
            
            <p className="text-sm text-slate-600">
              {savedPin ? 'Sua senha está ativa. Deseja alterar ou remover?' : 'Defina uma senha de acesso para proteger seu diário neste dispositivo.'}
            </p>

            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <input
                type="password"
                placeholder="Digite a nova senha (ex: 1234)..."
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-slate-800"
                required
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Salvar Senha
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-2 border rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {savedPin && (
              <button
                onClick={handleRemovePin}
                className="w-full text-center text-xs text-red-600 hover:underline pt-2 cursor-pointer block"
              >
                Remover senha existente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}