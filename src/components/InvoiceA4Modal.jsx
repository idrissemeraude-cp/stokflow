import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  MessageSquare, 
  Copy, 
  Check, 
  Building, 
  User, 
  Calendar,
  DollarSign,
  ShieldCheck,
  Download
} from 'lucide-react';
import { formatFCFA, formatDateFr } from '../utils/storage';
import { buildWhatsappLink } from '../utils/whatsappAi';

const InvoiceA4Modal = ({ sale, storeInfo, onClose }) => {
  const [invoiceType, setInvoiceType] = useState('FACTURE'); // 'FACTURE' | 'PROFORMA' | 'BORDEREAU'
  const [includeVat, setIncludeVat] = useState(false);
  const [vatRate, setVatRate] = useState(18); // TVA standard UEMOA 18%
  const [customNote, setCustomNote] = useState('Marchandises vendues conformes et non remboursables après livraison.');
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const totalHT = sale.totalAmount;
  const vatAmount = includeVat ? Math.round((totalHT * vatRate) / 100) : 0;
  const grandTotal = totalHT + vatAmount;
  const isCredit = sale.paymentType === 'CREDIT';

  const handlePrint = () => {
    window.print();
  };

  const invoiceTitle = invoiceType === 'PROFORMA' 
    ? 'FACTURE PROFORMA' 
    : invoiceType === 'BORDEREAU' 
    ? 'BORDEREAU DE LIVRAISON' 
    : 'FACTURE COMMERCIALE';

  const invoiceNumber = `FAC-${new Date(sale.createdAt || Date.now()).getFullYear()}-${sale.id.replace('sale-', '')}`;

  const handleShareWhatsApp = () => {
    let msg = `📄 *${invoiceTitle} N° ${invoiceNumber}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏢 Émetteur : *${storeInfo.name}* (${storeInfo.city})\n`;
    msg += `👤 Client : *${sale.clientName}*\n`;
    msg += `📅 Date : ${formatDateFr(sale.createdAt)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `*DÉTAILS DES ARTICLES :*\n`;
    sale.items.forEach(i => {
      msg += `• ${i.name} (x${i.qty}) = ${formatFCFA(i.qty * i.price)}\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💰 *TOTAL À PAYER : ${formatFCFA(grandTotal)}*\n`;
    if (isCredit) {
      msg += `🔴 Acompte versé : ${formatFCFA(sale.advancePaid)}\n`;
      msg += `⚠️ *Solde restant dû : ${formatFCFA(sale.remainingDue + vatAmount)}*\n`;
    } else {
      msg += `✅ *Statut : PAYÉ INTÉGRALEMENT*\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Contact : ${storeInfo.phone}`;

    const url = buildWhatsappLink(sale.clientPhone, msg);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:max-w-none print:w-full">
        
        {/* Header Modal - Hidden on print */}
        <div className="p-4 bg-[#064E3B] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                Générateur de Facture A4 & Proforma Officielle
              </h3>
              <p className="text-xs text-emerald-200/70">
                Document commercial grand format prêt pour B2B, entreprises et clients VIP
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-emerald-950/60 p-1 rounded-full flex text-[11px] font-semibold">
              <button
                onClick={() => setInvoiceType('FACTURE')}
                className={`px-3 py-1 rounded-full transition-all ${
                  invoiceType === 'FACTURE' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
              >
                Facture
              </button>
              <button
                onClick={() => setInvoiceType('PROFORMA')}
                className={`px-3 py-1 rounded-full transition-all ${
                  invoiceType === 'PROFORMA' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
              >
                Proforma
              </button>
              <button
                onClick={() => setInvoiceType('BORDEREAU')}
                className={`px-3 py-1 rounded-full transition-all ${
                  invoiceType === 'BORDEREAU' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
              >
                Bordereau
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

        {/* Options Toolbar - Hidden on print */}
        <div className="p-3 bg-emerald-50/60 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={includeVat}
                onChange={(e) => setIncludeVat(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Appliquer TVA (18%)</span>
            </label>

            <div className="text-gray-500 text-[11px]">
              Type : <strong className="text-gray-800">{invoiceTitle}</strong>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Envoyer WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-emerald-950 text-white font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer Facture A4</span>
            </button>
          </div>
        </div>

        {/* Printable A4 Paper Document */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100 print:bg-white print:p-0">
          <div 
            id="printable-invoice-a4"
            className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-8 sm:p-12 shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-8 flex flex-col justify-between"
          >
            
            {/* Header: Company & Invoice Meta */}
            <div>
              <div className="flex justify-between items-start border-b-2 border-[#064E3B] pb-6">
                <div>
                  <h1 className="text-2xl font-black text-[#064E3B] tracking-tight uppercase">
                    {storeInfo.name}
                  </h1>
                  <p className="text-xs font-semibold text-gray-700 mt-1">{storeInfo.ownerName}</p>
                  <p className="text-xs text-gray-600">{storeInfo.city}</p>
                  <p className="text-xs font-bold text-gray-800 mt-1">📞 Tél / WhatsApp : {storeInfo.phone}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">RCCM: BF-OUA-2024-B-0982 • IFU: 00192837B</p>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-[#064E3B] text-white px-4 py-1.5 rounded-xl font-extrabold text-sm tracking-wider uppercase">
                    {invoiceTitle}
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-2">N° : {invoiceNumber}</p>
                  <p className="text-xs text-gray-600">Date d'émission : {formatDateFr(sale.createdAt)}</p>
                  {isCredit && sale.dueDate && (
                    <p className="text-xs font-bold text-red-600 mt-1">Échéance : {formatDateFr(sale.dueDate)}</p>
                  )}
                </div>
              </div>

              {/* Client Billing Info */}
              <div className="grid grid-cols-2 gap-6 my-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Émetteur
                  </span>
                  <p className="text-xs font-bold text-gray-900">{storeInfo.name}</p>
                  <p className="text-xs text-gray-600">{storeInfo.city}</p>
                  <p className="text-xs text-gray-600">{storeInfo.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    Destinataire / Client
                  </span>
                  <p className="text-sm font-extrabold text-gray-900">{sale.clientName}</p>
                  <p className="text-xs text-gray-700">{sale.clientPhone || 'Contact non renseigné'}</p>
                  <p className="text-xs text-gray-600">Ouagadougou, Burkina Faso</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse my-6">
                <thead>
                  <tr className="bg-[#064E3B] text-white text-xs uppercase font-bold">
                    <th className="py-2.5 px-3 rounded-l-xl">Réf</th>
                    <th className="py-2.5 px-3">Description de l'article</th>
                    <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                    <th className="py-2.5 px-3 text-center">Qté</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                        ART-{idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900">{item.name}</span>
                        {item.variant && (
                          <span className="text-gray-500 text-[11px] block">Variante : {item.variant}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-800">
                        {formatFCFA(item.price)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-900">
                        {item.qty}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-gray-900">
                        {formatFCFA(item.qty * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Recap Table */}
              <div className="flex justify-end my-4">
                <div className="w-72 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-200 text-gray-700">
                    <span>Total Brut HT :</span>
                    <span className="font-bold">{formatFCFA(totalHT)}</span>
                  </div>

                  {includeVat && (
                    <div className="flex justify-between py-1 border-b border-gray-200 text-gray-700">
                      <span>TVA ({vatRate}%) :</span>
                      <span className="font-bold">{formatFCFA(vatAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-xl text-sm font-black text-[#064E3B] border border-emerald-200">
                    <span>TOTAL TTC :</span>
                    <span>{formatFCFA(grandTotal)}</span>
                  </div>

                  {isCredit && (
                    <>
                      <div className="flex justify-between py-1 text-gray-600">
                        <span>Acompte versé :</span>
                        <span className="font-bold text-emerald-700">{formatFCFA(sale.advancePaid)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 bg-red-50 px-3 rounded-xl font-extrabold text-red-700 border border-red-200">
                        <span>RESTE À RÉGLER :</span>
                        <span>{formatFCFA(sale.remainingDue + vatAmount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Conditions / Notes */}
              <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600">
                <span className="font-bold text-gray-700 block mb-0.5">Conditions & Mentions :</span>
                <p>{customNote}</p>
                <p className="mt-1">Paiements acceptés : Espèces, Orange Money, Moov Money, Wave, Virement bancaire.</p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-300 mt-8 text-xs">
              <div className="text-center">
                <p className="font-bold text-gray-700 mb-12">Le Client (Signature & Date)</p>
                <div className="border-b border-dashed border-gray-400 w-40 mx-auto"></div>
              </div>

              <div className="text-center">
                <p className="font-bold text-[#064E3B] mb-12">Pour {storeInfo.name} (Cachet & Signature)</p>
                <div className="border-b border-dashed border-gray-400 w-40 mx-auto"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceA4Modal;
