import React, { useState } from 'react';
import { 
  Printer, 
  Share2, 
  MessageSquare, 
  X, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Store,
  Calendar,
  User,
  ShoppingBag,
  Check,
  Receipt,
  FileText
} from 'lucide-react';
import { formatFCFA, formatDateFr, generateReceiptWhatsAppText } from '../utils/storage';
import { buildWhatsappLink } from '../utils/whatsappAi';

const ReceiptModal = ({ sale, storeInfo, onClose }) => {
  const [receiptType, setReceiptType] = useState('thermal'); // 'thermal' | 'standard'
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const isCredit = sale.paymentType === 'CREDIT';
  const whatsappText = generateReceiptWhatsAppText(sale, storeInfo);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const waUrl = buildWhatsappLink(sale.clientPhone, whatsappText);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:max-w-none print:w-full">
        
        {/* Modal Header - Hidden on print */}
        <div className="p-4 bg-[#064E3B] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base tracking-wide font-sans">
              Reçu de Caisse & Facture #{sale.id.replace('sale-', '')}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Format Switcher */}
            <div className="bg-emerald-950/60 p-1 rounded-full flex text-[11px] font-semibold">
              <button
                onClick={() => setReceiptType('thermal')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  receiptType === 'thermal' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
              >
                Ticket 58/80mm
              </button>
              <button
                onClick={() => setReceiptType('standard')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  receiptType === 'standard' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
              >
                Facture A5
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-emerald-800 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Receipt Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 print:bg-white print:p-0">
          
          {/* RECEIPT PAPER CONTAINER */}
          <div 
            id="printable-receipt"
            className={`mx-auto bg-white border border-gray-200 shadow-sm print:shadow-none print:border-none ${
              receiptType === 'thermal' 
                ? 'max-w-[320px] p-4 text-[12px] font-mono leading-tight' 
                : 'max-w-md p-6 text-xs font-sans'
            }`}
          >
            {/* Store Branding Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-300">
              <h2 className="font-extrabold text-base tracking-tight text-gray-900 uppercase">
                {storeInfo.name}
              </h2>
              <p className="text-[11px] text-gray-600 mt-0.5">{storeInfo.ownerName}</p>
              <p className="text-[10px] text-gray-500">{storeInfo.city}</p>
              <p className="text-[11px] font-bold text-gray-700 mt-1">Tél / WhatsApp : {storeInfo.phone}</p>
            </div>

            {/* Meta Info */}
            <div className="py-2.5 border-b border-dashed border-gray-300 space-y-1 text-gray-700">
              <div className="flex justify-between">
                <span>Réf. Vente :</span>
                <span className="font-bold text-gray-900">#{sale.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Heure :</span>
                <span>{formatDateFr(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Client(e) :</span>
                <span className="font-bold text-gray-900">{sale.clientName}</span>
              </div>
              {sale.clientPhone && (
                <div className="flex justify-between">
                  <span>Contact :</span>
                  <span>{sale.clientPhone}</span>
                </div>
              )}
            </div>

            {/* Purchased Items Table */}
            <div className="py-3 border-b border-dashed border-gray-300">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-[10px] text-gray-500 uppercase">
                    <th className="pb-1 text-left font-semibold">Article</th>
                    <th className="pb-1 text-center font-semibold">Qté</th>
                    <th className="pb-1 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1.5 pr-1">
                        <div className="font-bold text-gray-900 leading-none">{item.name}</div>
                        {item.variant && (
                          <span className="text-[10px] text-gray-500">Var: {item.variant}</span>
                        )}
                        <div className="text-[10px] text-gray-500 font-sans">
                          {formatFCFA(item.price)} / unité
                        </div>
                      </td>
                      <td className="py-1.5 text-center font-bold text-gray-800 align-top">
                        x{item.qty}
                      </td>
                      <td className="py-1.5 text-right font-bold text-gray-900 align-top">
                        {formatFCFA(item.qty * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Breakdown */}
            <div className="py-3 space-y-1.5 border-b border-dashed border-gray-300">
              <div className="flex justify-between text-xs font-bold text-gray-900">
                <span>TOTAL COMMANDE :</span>
                <span>{formatFCFA(sale.totalAmount)}</span>
              </div>

              {isCredit ? (
                <>
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Avance versée :</span>
                    <span>{formatFCFA(sale.advancePaid)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-extrabold text-red-700 bg-red-50 p-1.5 rounded">
                    <span>RESTE À RECOUVRER :</span>
                    <span>{formatFCFA(sale.remainingDue)}</span>
                  </div>
                  {sale.dueDate && (
                    <div className="text-[10px] text-red-600 font-bold text-right pt-0.5">
                      ⏳ Date limite : {formatDateFr(sale.dueDate)}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-1.5 rounded">
                  <span>Paiement :</span>
                  <span>RÉGLÉ AU COMPTANT</span>
                </div>
              )}
            </div>

            {/* Barcode & Footer Greeting */}
            <div className="text-center pt-3 space-y-2">
              <div className="inline-block px-3 py-1 bg-gray-100 rounded text-[9px] font-mono tracking-widest text-gray-600 border border-gray-200">
                ||| | |||| | || ||||| | ||| {sale.id}
              </div>
              <p className="text-[10px] text-gray-600 font-medium italic">
                Merci de votre visite et à très bientôt !
              </p>
              <p className="text-[8px] text-gray-400">
                Édité par StockFlow Pro • Solution de Gestion
              </p>
            </div>

          </div>

        </div>

        {/* Modal Actions Footer - Hidden on print */}
        <div className="p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={handleCopyText}
            className="w-full sm:w-auto px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Reçu copié !' : 'Copier texte'}</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Partager WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-[#064E3B] hover:bg-emerald-950 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Reçu</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;
