import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Send, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  Copy,
  Terminal,
  RefreshCw,
  Sliders,
  Trash2
} from 'lucide-react';
import { formatFCFA, formatDateFr, getDebtUrgencyStatus, getDaysDiffFromToday } from '../utils/storage';
import { generateWhatsappMessage, buildWhatsappLink, formatCleanPhone } from '../utils/whatsappAi';

const WhatsappRelanceModule = ({ 
  sales = [], 
  storeInfo = {}, 
  waLogs = [], 
  onSendWhatsappLog, 
  onDeleteWaLog,
  onClearAllWaLogs,
  onOpenCreditModal 
}) => {
  // Only credit sales with pending debt (> 0)
  const creditSales = sales.filter(s => {
    const due = s.remainingDue !== undefined ? s.remainingDue : (s.remainingBalance || 0);
    const isCredit = s.paymentType === 'CREDIT' || s.paymentType === 'CREDIT_TOTAL' || s.paymentType === 'ADVANCE_PARTIAL' || s.status === 'UNPAID' || s.status === 'PARTIALLY_PAID' || s.status === 'PARTIAL';
    return isCredit && due > 0;
  });

  // Active filter tab: 'ALL' | 'J-2' | 'JOUR_J' | 'OVERDUE'
  const [activeUrgencyTab, setActiveUrgencyTab] = useState('ALL');
  
  // Selected sale for preview & editing
  const [selectedSale, setSelectedSale] = useState(creditSales[0] || null);

  // AI Generator Settings
  const [selectedTone, setSelectedTone] = useState('STANDARD'); // 'DOUX' | 'STANDARD' | 'URGENT'
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showWebhookLog, setShowWebhookLog] = useState(false);

  // Update selected sale and sync message text
  const handleSelectSale = (sale) => {
    setSelectedSale(sale);
    const urgencyInfo = getDebtUrgencyStatus(sale.dueDate);
    const due = sale.remainingDue !== undefined ? sale.remainingDue : (sale.remainingBalance || 0);
    const generated = generateWhatsappMessage({
      clientName: sale.clientName,
      storeName: storeInfo.name,
      amountDue: due,
      dueDate: sale.dueDate,
      saleDate: sale.createdAt,
      tone: selectedTone,
      urgencyCode: urgencyInfo.code
    });
    setCustomMessage(generated);
  };

  // Re-generate message when tone changes
  const handleToneChange = (newTone) => {
    setSelectedTone(newTone);
    if (selectedSale) {
      const urgencyInfo = getDebtUrgencyStatus(selectedSale.dueDate);
      const generated = generateWhatsappMessage({
        clientName: selectedSale.clientName,
        storeName: storeInfo.name,
        amountDue: selectedSale.remainingDue,
        dueDate: selectedSale.dueDate,
        saleDate: selectedSale.createdAt,
        tone: newTone,
        urgencyCode: urgencyInfo.code
      });
      setCustomMessage(generated);
    }
  };

  // Copy message to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger 1-Click WhatsApp Direct Send & Log Simulation
  const handleTriggerWhatsapp = (sale) => {
    const due = sale.remainingDue !== undefined ? sale.remainingDue : (sale.remainingBalance || 0);
    const textToSend = customMessage || generateWhatsappMessage({
      clientName: sale.clientName,
      storeName: storeInfo.name,
      amountDue: due,
      dueDate: sale.dueDate,
      saleDate: sale.createdAt,
      tone: selectedTone,
      urgencyCode: getDebtUrgencyStatus(sale.dueDate).code
    });

    const waUrl = buildWhatsappLink(sale.clientPhone, textToSend);

    // Save log entry
    onSendWhatsappLog({
      id: `log-${Date.now()}`,
      clientId: sale.clientId,
      clientName: sale.clientName,
      phone: formatCleanPhone(sale.clientPhone),
      message: textToSend,
      sentAt: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: 'DIRECT_WA_CLICK',
      status: 'DELIVERED'
    });

    window.open(waUrl, '_blank');
  };

  // Filter Sales by urgency tab
  const filteredSales = creditSales.filter(s => {
    const status = getDebtUrgencyStatus(s.dueDate);
    if (activeUrgencyTab === 'J-2') return status.code === 'DUE_SOON';
    if (activeUrgencyTab === 'JOUR_J') return status.code === 'DUE_TODAY';
    if (activeUrgencyTab === 'OVERDUE') return status.code === 'OVERDUE';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-[#064E3B] text-white p-6 rounded-2rem border border-emerald-600 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/40">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-sans">
              Relances WhatsApp des Créances
            </h2>
          </div>
          <p className="text-xs text-emerald-100/80 mt-1">
            Envoi immédiat en 1-clic des rappels WhatsApp pour recouvrir vos crédits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWebhookLog(!showWebhookLog)}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-2rem border border-white/10 flex items-center space-x-2 transition-all"
          >
            <Terminal className="w-4 h-4 text-emerald-300" />
            <span>{showWebhookLog ? 'Masquer le Journal' : 'Journal des Relances'} ({waLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filter Tabs & Credit Sales List */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Urgency Filter Tabs */}
          <div className="flex bg-emerald-900/40 p-1.5 rounded-2rem border border-emerald-700/50 text-xs font-bold">
            <button
              onClick={() => setActiveUrgencyTab('ALL')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeUrgencyTab === 'ALL' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-200 hover:text-white'}`}
            >
              Tous ({creditSales.length})
            </button>
            <button
              onClick={() => setActiveUrgencyTab('J-2')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeUrgencyTab === 'J-2' ? 'bg-blue-600 text-white shadow' : 'text-emerald-200 hover:text-white'}`}
            >
              J-2
            </button>
            <button
              onClick={() => setActiveUrgencyTab('JOUR_J')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeUrgencyTab === 'JOUR_J' ? 'bg-amber-600 text-white shadow' : 'text-emerald-200 hover:text-white'}`}
            >
              Jour J
            </button>
            <button
              onClick={() => setActiveUrgencyTab('OVERDUE')}
              className={`flex-1 py-2 rounded-xl transition-all ${activeUrgencyTab === 'OVERDUE' ? 'bg-red-600 text-white shadow' : 'text-emerald-200 hover:text-white'}`}
            >
              En Retard
            </button>
          </div>

          {/* Sales List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredSales.length === 0 ? (
              <div className="bg-white p-8 rounded-2rem border border-gray-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-sm text-gray-800">Aucune créance dans cette catégorie !</p>
                <p className="text-xs text-gray-500">Toutes vos relances sont à jour.</p>
              </div>
            ) : (
              filteredSales.map((sale) => {
                const urgency = getDebtUrgencyStatus(sale.dueDate);
                const due = sale.remainingDue !== undefined ? sale.remainingDue : (sale.remainingBalance || 0);
                const isSelected = selectedSale?.id === sale.id;

                return (
                  <div
                    key={sale.id}
                    onClick={() => handleSelectSale(sale)}
                    className={`p-4 rounded-2rem border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                        : 'bg-white border-gray-200 hover:border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-gray-900">{sale.clientName}</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${urgency.badgeColor}`}>
                        {urgency.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                      <span>Reste à payer : <strong className="text-red-600 font-extrabold text-sm">{formatFCFA(due)}</strong></span>
                      <span className="text-[11px] text-gray-400">Échéance : {formatDateFr(sale.dueDate)}</span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {sale.clientPhone || 'Pas de numéro'}
                      </span>
                      <span className="text-emerald-700 font-bold hover:underline">
                        Sélectionner pour relancer →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: AI Message Generator & Direct Sending */}
        <div className="lg:col-span-7">
          {!selectedSale ? (
            <div className="bg-white p-12 rounded-2rem border border-gray-200 text-center space-y-3">
              <MessageSquareText className="w-12 h-12 text-gray-300 mx-auto animate-bounce" />
              <h3 className="font-bold text-base text-gray-700">Sélectionnez une créance à relancer</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Choisissez un client débiteur dans la liste à gauche pour personnaliser et envoyer le message de rappel WhatsApp en 1-clic.
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2rem border border-gray-200 shadow-lg space-y-5">
              
              {/* Selected Sale Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Client Sélectionné
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 mt-1">
                    {selectedSale.clientName}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    WhatsApp: <strong>{selectedSale.clientPhone || 'N/A'}</strong> • Reste dû: <strong className="text-red-600">{formatFCFA(selectedSale.remainingDue)}</strong>
                  </p>
                </div>

                {onOpenCreditModal && (
                  <button
                    onClick={() => onOpenCreditModal(selectedSale)}
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center space-x-1"
                  >
                    <span>Régler l'acompte</span>
                  </button>
                )}
              </div>

              {/* Tone Switcher */}
              <div className="space-y-2">
                <label className="block font-bold text-xs text-gray-700">Ton de la Relance WhatsApp :</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'DOUX', label: '😊 Cordial / Amical' },
                    { id: 'STANDARD', label: '⚡ Standard Pro' },
                    { id: 'URGENT', label: '🚨 Ferme / Impératif' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleToneChange(t.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        selectedTone === t.id
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Message Box */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-xs text-gray-700">Aperçu du message :</label>
                  <button
                    onClick={handleCopy}
                    className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copié !' : 'Copier le texte'}</span>
                  </button>
                </div>

                <textarea
                  rows="6"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3.5 rounded-2rem bg-[#F0FDF4] border border-emerald-200 text-xs font-sans leading-relaxed focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                />
              </div>

              {/* 1-Click WhatsApp Direct Dispatch Button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleTriggerWhatsapp(selectedSale)}
                  className="w-full py-3.5 rounded-2rem bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4.5 h-4.5" />
                  <span>Envoyer la Relance sur WhatsApp (1-Clic)</span>
                  <ExternalLink className="w-4 h-4 text-emerald-200" />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Webhook & Historique des Relances WhatsApp */}
      {showWebhookLog && (
        <div className="bg-[#064E3B] text-white p-6 rounded-2rem border border-emerald-600 space-y-4 text-xs shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-emerald-700 pb-3">
            <h4 className="font-bold text-emerald-300 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Historique des Relances Envoyées ({waLogs.length})
            </h4>
            <div className="flex items-center gap-2">
              {waLogs.length > 0 && onClearAllWaLogs && (
                <button
                  onClick={onClearAllWaLogs}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/40 text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider tout l'historique</span>
                </button>
              )}
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                Service Actif
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {waLogs.length === 0 ? (
              <p className="text-emerald-200/50 italic py-4 text-center">Aucun historique de relance enregistrée.</p>
            ) : (
              waLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1.5 flex items-start justify-between gap-3 group hover:bg-white/10 transition-all">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span>WhatsApp Direct → {log.clientName} ({log.phone})</span>
                      <span className="text-emerald-200/70 font-mono">{log.sentAt}</span>
                    </div>
                    <p className="text-emerald-100/90 leading-relaxed font-sans">"{log.message}"</p>
                    <span className="text-[10px] text-emerald-400 font-bold inline-block bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      ENVOYÉ AVEC SUCCÈS
                    </span>
                  </div>

                  {onDeleteWaLog && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Supprimer cette relance de l'historique pour ${log.clientName} ?`)) {
                          onDeleteWaLog(log.id);
                        }
                      }}
                      title="Supprimer cet historique"
                      className="p-1.5 rounded-lg text-emerald-300/60 hover:text-red-300 hover:bg-red-500/20 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default WhatsappRelanceModule;
