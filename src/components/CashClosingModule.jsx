import React, { useState } from 'react';
import { 
  Lock, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Clock, 
  History, 
  UserCheck, 
  FileText, 
  Sparkles,
  TrendingUp,
  CreditCard,
  Building,
  Check
} from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';

const CashClosingModule = ({ 
  sales = [], 
  payments = [], 
  expenses = [], 
  cashClosings = [], 
  storeInfo, 
  onSaveCashClosing,
  userRole = 'ADMIN'
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [physicalCashCounted, setPhysicalCashCounted] = useState('');
  const [closingNote, setClosingNote] = useState('');
  const [selectedHistoricalClosing, setSelectedHistoricalClosing] = useState(null);

  // Filter movements for selected date
  const daySales = sales.filter(s => s.createdAt && s.createdAt.startsWith(selectedDate));
  const dayPayments = payments.filter(p => p.date && p.date.startsWith(selectedDate));
  const dayExpenses = expenses.filter(e => e.date && e.date.startsWith(selectedDate));

  // 1. Encaissements Espèces directs (Comptant)
  const cashSalesTotal = daySales.reduce((acc, s) => {
    if (s.paymentType === 'CASH') return acc + s.totalAmount;
    return acc;
  }, 0);

  // 2. Acomptes reçus en Espèces lors de ventes à crédit
  const cashAdvancesTotal = daySales.reduce((acc, s) => {
    if (s.paymentType === 'CREDIT' && (s.advanceMethod === 'CASH' || !s.advanceMethod)) {
      return acc + (s.advancePaid || 0);
    }
    return acc;
  }, 0);

  // 3. Règlements de créances du jour en Espèces
  const cashRepaymentsTotal = dayPayments.reduce((acc, p) => {
    if (p.paymentMethod === 'CASH') return acc + (p.amount || 0);
    return acc;
  }, 0);

  // 4. Sorties de caisse / Dépenses payées en Espèces
  const cashExpensesTotal = dayExpenses.reduce((acc, exp) => {
    if (exp.paymentMethod === 'CASH') return acc + (exp.amount || 0);
    return acc;
  }, 0);

  // 5. Total Théorique Espèces attendu dans le tiroir physique
  const theoreticalCashTotal = Math.max(0, (cashSalesTotal + cashAdvancesTotal + cashRepaymentsTotal) - cashExpensesTotal);

  // 6. Encaissements Mobile Money (Orange Money, Moov Money, Wave)
  const mobileMoneyTotal = daySales.reduce((acc, s) => {
    if (s.advanceMethod && s.advanceMethod !== 'CASH') return acc + (s.advancePaid || 0);
    return acc;
  }, 0) + dayPayments.reduce((acc, p) => {
    if (p.paymentMethod !== 'CASH') return acc + (p.amount || 0);
    return acc;
  }, 0);

  // Total Chiffre d'Affaires du jour (tous canaux confondus)
  const totalDailyRevenue = daySales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Calcul de l'écart
  const counted = physicalCashCounted !== '' ? Number(physicalCashCounted) : theoreticalCashTotal;
  const difference = counted - theoreticalCashTotal;

  const handleValidateClosing = (e) => {
    e.preventDefault();
    const newClosing = {
      id: `close-${Date.now()}`,
      date: selectedDate,
      closedAt: new Date().toISOString(),
      cashSalesTotal,
      cashAdvancesTotal,
      cashPaymentsTotal: cashRepaymentsTotal,
      cashExpensesTotal,
      theoreticalCashTotal,
      physicalCashCounted: counted,
      difference,
      mobileMoneyTotal,
      totalDailyRevenue,
      closedBy: storeInfo.ownerName || 'Gérant Boutique',
      note: closingNote.trim() || 'Clôture de caisse quotidienne standard.'
    };

    onSaveCashClosing(newClosing);
    alert('✅ Clôture de caisse enregistrée avec succès !');
    setPhysicalCashCounted('');
    setClosingNote('');
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#064E3B] font-sans">
              Clôture de Caisse & Rapport Journalier (Z de Caisse)
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-300">
              Rapprochement
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pointage quotidien des espèces, contrôle du tiroir-caisse et calcul des écarts de caisse avant fermeture.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200 text-xs font-semibold text-gray-700">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handlePrintZReport}
            className="px-4 py-2.5 rounded-2xl bg-[#064E3B] hover:bg-emerald-950 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Rapport Z</span>
          </button>
        </div>
      </div>

      {/* Main Reconciliation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Theoretical Cashflow Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#064E3B] flex items-center justify-between border-b border-gray-100 pb-3">
              <span>Flux de Trésorerie du {formatDateFr(selectedDate)}</span>
              <span className="text-xs text-gray-500 font-normal">{daySales.length} vente(s) enregistrée(s)</span>
            </h3>

            {/* Inflows */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                + Entrées de Caisse (Espèces Physiques)
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-gray-700 font-medium">Ventes Comptant (Espèces directes)</span>
                <span className="font-bold text-emerald-700 text-sm">+{formatFCFA(cashSalesTotal)}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-gray-700 font-medium">Acomptes reçus sur Ventes à Crédit (Espèces)</span>
                <span className="font-bold text-emerald-700 text-sm">+{formatFCFA(cashAdvancesTotal)}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-gray-700 font-medium">Règlements de Dettes / Rentrées Créances (Espèces)</span>
                <span className="font-bold text-emerald-700 text-sm">+{formatFCFA(cashRepaymentsTotal)}</span>
              </div>
            </div>

            {/* Outflows */}
            <div className="space-y-2 text-xs pt-2">
              <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                - Sorties de Caisse (Dépenses Boutique)
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-2xl bg-red-50/60 border border-red-100">
                <span className="text-gray-700 font-medium">Dépenses payées en Espèces (Petite Caisse)</span>
                <span className="font-bold text-red-600 text-sm">-{formatFCFA(cashExpensesTotal)}</span>
              </div>
            </div>

            {/* Digital Money (Orange Money / Moov) */}
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-900">Encaissements Mobile Money (Hors Tiroir-Caisse)</span>
                <p className="text-[10px] text-blue-700">Orange Money / Moov Money / Wave reçus aujourd'hui</p>
              </div>
              <span className="font-bold text-blue-700 text-sm">{formatFCFA(mobileMoneyTotal)}</span>
            </div>

            {/* Net Theoretical Cash in Drawer */}
            <div className="p-4 rounded-2xl bg-[#064E3B] text-white flex justify-between items-center shadow-lg">
              <div>
                <span className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">
                  Solde Théorique Attendu dans le Tiroir
                </span>
                <div className="text-xs text-emerald-100 mt-0.5">Espèces physiques à compter</div>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {formatFCFA(theoreticalCashTotal)}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Physical Cash Counting & Validation Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-[#064E3B] border-b border-gray-100 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Pointage & Validation du Soir
            </h3>

            <form onSubmit={handleValidateClosing} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Montant physique compté dans le tiroir (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder={`ex: ${theoreticalCashTotal}`}
                  value={physicalCashCounted}
                  onChange={(e) => setPhysicalCashCounted(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-300 font-extrabold text-gray-900 text-base focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                />
              </div>

              {/* Instant Difference Badge */}
              <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                difference === 0 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : difference > 0 
                  ? 'bg-blue-50 border-blue-200 text-blue-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    {difference === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4" />}
                    {difference === 0 ? 'Caisse Équilibrée' : difference > 0 ? 'Excédent de Caisse' : 'Déficit de Caisse'}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {difference === 0 
                      ? 'Le montant compté correspond parfaitement au théorique.' 
                      : `Écart constaté : ${difference > 0 ? '+' : ''}${formatFCFA(difference)}`}
                  </div>
                </div>

                <div className="text-right font-extrabold text-sm">
                  {difference > 0 ? `+${formatFCFA(difference)}` : formatFCFA(difference)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Observations de clôture (Optionnel)
                </label>
                <textarea
                  rows="2"
                  placeholder="ex: RAS, vérification effectuée avec Mme Kaboré."
                  value={closingNote}
                  onChange={(e) => setClosingNote(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-gray-50 border border-gray-300 focus:outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all btn-magnetic"
              >
                <Check className="w-4 h-4" />
                <span>Valider la Clôture du Jour ({formatFCFA(counted)})</span>
              </button>

            </form>

          </div>

        </div>

      </div>

      {/* Historical Closings */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden print:hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs text-gray-800 uppercase tracking-wide">
              Historique des Clôtures de Caisse ({cashClosings.length})
            </h3>
          </div>
        </div>

        {cashClosings.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            Aucune clôture de caisse précédente enregistrée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Théorique Espèces</th>
                  <th className="p-3.5">Compté Physique</th>
                  <th className="p-3.5">Écart de Caisse</th>
                  <th className="p-3.5">Mobile Money</th>
                  <th className="p-3.5">Clôturé par</th>
                  <th className="p-3.5">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cashClosings.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900">
                      {formatDateFr(c.date)}
                    </td>
                    <td className="p-3.5 font-semibold text-gray-700">
                      {formatFCFA(c.theoreticalCashTotal)}
                    </td>
                    <td className="p-3.5 font-extrabold text-[#064E3B]">
                      {formatFCFA(c.physicalCashCounted)}
                    </td>
                    <td className="p-3.5 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        c.difference === 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : c.difference > 0 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {c.difference === 0 ? 'Équilibré (0 FCFA)' : `${c.difference > 0 ? '+' : ''}${formatFCFA(c.difference)}`}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-blue-700">
                      {formatFCFA(c.mobileMoneyTotal || 0)}
                    </td>
                    <td className="p-3.5 text-gray-600">
                      {c.closedBy || 'Gérant'}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Validé
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINTABLE RAPPORT Z SHEET (Only visible on window.print()) */}
      <div className="hidden print:block p-8 bg-white text-black font-mono text-xs max-w-lg mx-auto">
        <div className="text-center pb-4 border-b border-black">
          <h1 className="font-bold text-base uppercase">{storeInfo.name}</h1>
          <p>{storeInfo.city} • Tél : {storeInfo.phone}</p>
          <h2 className="text-sm font-extrabold mt-2 uppercase">*** RAPPORT Z - CLÔTURE DE CAISSE ***</h2>
          <p>Date : {formatDateFr(selectedDate)} | Imprimé le : {new Date().toLocaleTimeString('fr-FR')}</p>
        </div>

        <div className="py-4 space-y-2 border-b border-black">
          <div className="flex justify-between">
            <span>Nombre total de ventes :</span>
            <span className="font-bold">{daySales.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Chiffre d'Affaires Brut du Jour :</span>
            <span className="font-bold">{formatFCFA(totalDailyRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ventes Espèces directes :</span>
            <span>+{formatFCFA(cashSalesTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Acomptes Espèces :</span>
            <span>+{formatFCFA(cashAdvancesTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Règlements Dettes Espèces :</span>
            <span>+{formatFCFA(cashRepaymentsTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dépenses Espèces (Petite Caisse) :</span>
            <span>-{formatFCFA(cashExpensesTotal)}</span>
          </div>
          <div className="flex justify-between font-bold pt-1 border-t border-dotted border-gray-400">
            <span>SOLDE THÉORIQUE ESPÈCES :</span>
            <span>{formatFCFA(theoreticalCashTotal)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>MONTANT RÉEL COMPTÉ :</span>
            <span>{formatFCFA(counted)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>ÉCART DE CAISSE :</span>
            <span>{difference > 0 ? `+${formatFCFA(difference)}` : formatFCFA(difference)}</span>
          </div>
        </div>

        <div className="py-4 space-y-1 border-b border-black">
          <div className="flex justify-between">
            <span>Mobile Money (Orange/Moov) :</span>
            <span className="font-bold">{formatFCFA(mobileMoneyTotal)}</span>
          </div>
        </div>

        <div className="pt-6 text-center space-y-4">
          <div className="flex justify-between px-4 pt-8">
            <div className="text-center">
              <p>Signature Caissier</p>
              <div className="h-12"></div>
            </div>
            <div className="text-center">
              <p>Signature Gérant</p>
              <div className="h-12"></div>
            </div>
          </div>
          <p className="text-[10px] italic">StockFlow Pro • Gestion Commerciale Intégrée</p>
        </div>
      </div>

    </div>
  );
};

export default CashClosingModule;
