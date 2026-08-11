import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, DollarSign, PhoneCall } from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';

const CreditModal = ({ sale, onClose, onAddPayment }) => {
  const [amount, setAmount] = useState(sale ? sale.remainingDue : '');
  const [paymentMethod, setPaymentMethod] = useState('ORANGE_MONEY'); // CASH | ORANGE_MONEY | MOOV_MONEY
  const [note, setNote] = useState('');

  if (!sale) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddPayment({
      saleId: sale.id,
      clientId: sale.clientId,
      clientName: sale.clientName,
      amount: Math.min(parsedAmount, sale.remainingDue),
      paymentMethod,
      note: note.trim() || 'Règlement de créance'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2rem max-w-md w-full p-6 shadow-2xl border border-emerald-200 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="text-[10px] text-emerald-600 uppercase font-semibold">
              Module Crédit Client
            </span>
            <h3 className="font-bold text-lg text-[#064E3B] font-sans">
              Enregistrer un Règlement
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Client & Debt Summary */}
        <div className="bg-[#064E3B] text-white p-4 rounded-2rem space-y-2 border border-emerald-600">
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-200">Cliente :</span>
            <span className="font-bold text-sm text-white">{sale.clientName}</span>
          </div>

          <div className="flex justify-between items-center border-t border-emerald-700/60 pt-2 text-xs">
            <span className="text-emerald-200">Solde Restant Dû (Rouge) :</span>
            <span className="font-bold text-red-400 text-base">
              {formatFCFA(sale.remainingDue)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-emerald-700/40 pt-1">
            <span className="text-emerald-200">Montant Total Vente (Blanc) :</span>
            <span className="font-bold text-white">
              {formatFCFA(sale.totalAmount)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          {/* Montant Versé */}
          <div>
            <label className="block font-bold text-xs text-gray-700 mb-1">
              Montant du Règlement Versé (FCFA) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={sale.remainingDue}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-2rem bg-gray-50 border border-gray-300 font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAmount(sale.remainingDue)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full hover:bg-emerald-200"
              >
                Tout Réglé
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Solde restant après ce versement : <strong className="text-red-600 font-bold">{formatFCFA(Math.max(0, sale.remainingDue - (Number(amount) || 0)))}</strong>
            </p>
          </div>

          {/* Mode de Paiement */}
          <div>
            <label className="block font-bold text-xs text-gray-700 mb-1.5">
              Mode de Règlement *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-2rem text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Espèces</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ORANGE_MONEY')}
                className={`p-2.5 rounded-2rem text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                  paymentMethod === 'ORANGE_MONEY'
                    ? 'bg-red-600 text-white border-red-700 font-bold shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Orange Money</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MOOV_MONEY')}
                className={`p-2.5 rounded-2rem text-xs font-semibold flex flex-col items-center justify-center space-y-1 border transition-all ${
                  paymentMethod === 'MOOV_MONEY'
                    ? 'bg-[#064E3B] text-white border-emerald-800 font-bold shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Moov Money</span>
              </button>
            </div>
          </div>

          {/* Note Optionnelle */}
          <div>
            <label className="block font-bold text-xs text-gray-700 mb-1">
              Note ou Référence (Optionnel)
            </label>
            <input
              type="text"
              placeholder="ex: Versement partiel reçu en boutique"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2rem bg-gray-50 border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2rem bg-gray-100 text-gray-700 text-xs hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2rem bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Valider le Règlement</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreditModal;
