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
  Sliders
} from 'lucide-react';
import { formatFCFA, formatDateFr, getDebtUrgencyStatus, getDaysDiffFromToday } from '../utils/storage';
import { generateWhatsappMessage, buildWhatsappLink, formatCleanPhone } from '../utils/whatsappAi';

const WhatsappRelanceModule = ({ 
  sales, 
  storeInfo, 
  waLogs, 
  onSendWhatsappLog, 
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
              Relances WhatsApp des Créances (Rouge)
            </h2>
          </div>
          <p className="text-xs text-emerald-100/80 mt-1">
            Envoi immédiat en 1-clic des rappels WhatsApp pour recouvrir vos crédits.
          </p>
        </div>

        <button
          onClick={() => setShowWebhookLog(!showWebhookLog)}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-2rem border border-white/10 flex items-center space-x-2 transition-all"
        >
          <Terminal className="w-4 h-4 text-emerald-300" />
          <span>{showWebhookLog ? 'Masquer Logs Webhook' : 'Voir Logs API Webhook'}</span>
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Urgency Filter Tabs */}
          <div className="bg-white p-2 rounded-2rem border border-emerald-200 shadow-sm flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveUrgencyTab('ALL')}
              className={`px-3.5 py-2 rounded-2rem text-xs font-semibold transition-all whitespace-nowrap ${
                activeUrgencyTab === 'ALL' ? 'bg-[#064E3B] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Toutes ({creditSales.length})
            </button>

            <button
              onClick={() => setActiveUrgencyTab('OVERDUE')}
              className={`px-3.5 py-2 rounded-2rem text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeUrgencyTab === 'OVERDUE' ? 'bg-red-600 text-white font-bold' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Retards ({creditSales.filter(s => getDebtUrgencyStatus(s.dueDate).code === 'OVERDUE').length})
            </button>

            <button
              onClick={() => setActiveUrgencyTab('JOUR_J')}
              className={`px-3.5 py-2 rounded-2rem text-xs font-semibold transition-all whitespace-nowrap ${
                activeUrgencyTab === 'JOUR_J' ? 'bg-red-500 text-white font-bold' : 'text-red-800 hover:bg-red-50'
              }`}
            >
              Jour J ({creditSales.filter(s => getDebtUrgencyStatus(s.dueDate).code === 'DUE_TODAY').length})
            </button>

            <button
              onClick={() => setActiveUrgencyTab('J-2')}
              className={`px-3.5 py-2 rounded-2rem text-xs font-semibold transition-all whitespace-nowrap ${
                activeUrgencyTab === 'J-2' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              J-2 Doux ({creditSales.filter(s => getDebtUrgencyStatus(s.dueDate).code === 'DUE_SOON').length})
            </button>
          </div>

          {/* List of Pending Debt Cards */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredSales.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2rem border border-dashed border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-[#064E3B]">Aucune créance dans cette catégorie !</h4>
                <p className="text-xs text-gray-500 mt-1">Vos relances sont à jour.</p>
              </div>
            ) : (
              filteredSales.map((sale) => {
                const statusInfo = getDebtUrgencyStatus(sale.dueDate);
                const isSelected = selectedSale?.id === sale.id;

                return (
                  <div
                    key={sale.id}
                    onClick={() => handleSelectSale(sale)}
                    className={`p-4 rounded-2rem border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#064E3B] text-white border-emerald-500 shadow-xl scale-[1.01]'
                        : 'bg-white hover:bg-emerald-50/50 border-emerald-100 text-gray-900 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {sale.clientName}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${statusInfo.badgeColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-300' : 'text-gray-500'}`}>
                          📱 {sale.clientPhone}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-red-500 font-bold block">Reste dû (Rouge)</span>
                        <span className="font-bold text-sm text-red-500">
                          {formatFCFA(sale.remainingDue !== undefined ? sale.remainingDue : (sale.remainingBalance || 0))}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-emerald-700/40 flex items-center justify-between text-[11px]">
                      <span className={isSelected ? 'text-emerald-200' : 'text-gray-500'}>
                        Échéance : {formatDateFr(sale.dueDate)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSale(sale);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1 ${
                          isSelected ? 'bg-white text-[#064E3B]' : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Relancer WA</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right 6 Cols */}
        <div className="lg:col-span-6">
          {!selectedSale ? (
            <div className="bg-white p-12 rounded-2rem border border-dashed border-emerald-200 text-center space-y-3">
              <Bot className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-[#064E3B]">Sélectionnez un client à relancer</h3>
              <p className="text-xs text-gray-500">
                Cliquez sur une créance en rouge pour générer le message WhatsApp.
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2rem border border-emerald-200 shadow-md space-y-5">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-bold">
                    Destinataire WhatsApp
                  </span>
                  <h3 className="font-bold text-lg text-gray-900 font-sans">
                    {selectedSale.clientName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    N° WhatsApp : <strong className="text-gray-800">{formatCleanPhone(selectedSale.clientPhone)}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-red-600 font-bold block">Solde en Rouge</span>
                  <span className="font-bold text-lg text-red-600">
                    {formatFCFA(selectedSale.remainingDue)}
                  </span>
                </div>
              </div>

              {/* Tone Selection Tabs */}
              <div className="space-y-1.5">
                <label className="block font-bold text-xs text-gray-700">
                  Tonalité du Message IA :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToneChange('DOUX')}
                    className={`py-2 px-3 rounded-2rem text-xs font-semibold transition-all border ${
                      selectedTone === 'DOUX'
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    😊 Doux (J-2)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToneChange('STANDARD')}
                    className={`py-2 px-3 rounded-2rem text-xs font-semibold transition-all border ${
                      selectedTone === 'STANDARD'
                        ? 'bg-[#064E3B] text-white border-emerald-800 font-bold shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    👔 Professionnel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToneChange('URGENT')}
                    className={`py-2 px-3 rounded-2rem text-xs font-semibold transition-all border ${
                      selectedTone === 'URGENT'
                        ? 'bg-red-600 text-white border-red-700 font-bold shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ⚠️ Urgent (J+3)
                  </button>
                </div>
              </div>

              {/* Editable Message Box */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-xs text-gray-700">Aperçu & Édition du Message :</label>
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
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleTriggerWhatsapp(selectedSale)}
                  className="w-full py-3.5 rounded-2rem bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl flex items-center justify-center space-x-2 btn-magnetic"
                >
                  <Send className="w-4.5 h-4.5" />
                  <span>Envoyer la Relance sur WhatsApp (1-Clic)</span>
                  <ExternalLink className="w-4 h-4 text-emerald-200" />
                </button>

                <p className="text-[11px] text-gray-400 text-center">
                  Génère le lien direct <code className="bg-emerald-50 px-1 py-0.5 rounded text-emerald-800">https://wa.me/{formatCleanPhone(selectedSale.clientPhone)}</code> avec le message pré-rempli.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Webhook API Simulation Drawer */}
      {showWebhookLog && (
        <div className="bg-[#064E3B] text-white p-6 rounded-2rem border border-emerald-600 space-y-4 text-xs shadow-2xl">
          <div className="flex items-center justify-between border-b border-emerald-700 pb-3">
            <h4 className="font-bold text-emerald-300 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Journal des Webhooks & API WhatsApp Cloud
            </h4>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
              Service Actif
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {waLogs.length === 0 ? (
              <p className="text-emerald-200/50 italic">Aucun log récent d'API.</p>
            ) : (
              waLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] space-y-1">
                  <div className="flex justify-between text-emerald-300 font-bold">
                    <span>[POST] /api/v1/whatsapp/send-template</span>
                    <span>{log.sentAt}</span>
                  </div>
                  <p className="text-white">Client : {log.clientName} ({log.phone})</p>
                  <p className="text-emerald-100/70 truncate">Payload : "{log.message}"</p>
                  <span className="text-[10px] text-emerald-400 font-bold">STATUS: 200 OK (DELIVERED_TO_DEVICE)</span>
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
