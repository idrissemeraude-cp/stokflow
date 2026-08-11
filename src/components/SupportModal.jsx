import React from 'react';
import { 
  HelpCircle, 
  X, 
  Mail, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Headphones,
  Clock,
  ShieldCheck
} from 'lucide-react';

const SupportModal = ({ isOpen, onClose }) => {
  const [copiedText, setCopiedText] = React.useState(null);

  if (!isOpen) return null;

  const emails = [
    'gansoreemeraude@gmail.com',
    'gicb7612@gmail.com'
  ];
  const phone = '+226 60 55 77 77';
  const phoneRaw = '22660557777';

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent("Bonjour l'équipe d'assistance StockFlow Pro, j'ai besoin d'aide pour mon application.");
    window.open(`https://wa.me/${phoneRaw}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#064E3B] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans tracking-tight text-white">
                Centre d'Aide & Support
              </h3>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Assistance technique StockFlow Pro dédiée à votre boutique
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Main WhatsApp Direct Action */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-900">Support WhatsApp Direct</p>
                <p className="text-sm font-bold text-[#064E3B]">{phone}</p>
              </div>
            </div>
            <button
              onClick={handleOpenWhatsApp}
              className="btn-magnetic w-full sm:w-auto bg-[#064E3B] hover:bg-emerald-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Discuter sur WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Contact Details Grid */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Coordonnées d'Assistance
            </p>

            {/* Téléphone / Appel */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="text-[11px] text-gray-500">Ligne Directe / Appel</p>
                  <a href={`tel:${phoneRaw}`} className="text-xs font-bold text-gray-900 hover:text-emerald-700">
                    {phone}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCopy(phone, 'phone')}
                title="Copier le numéro"
                className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {copiedText === 'phone' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Email 1 */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="text-[11px] text-gray-500">Email Principal</p>
                  <a href={`mailto:${emails[0]}`} className="text-xs font-bold text-gray-900 hover:text-emerald-700">
                    {emails[0]}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCopy(emails[0], 'email1')}
                title="Copier l'email"
                className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {copiedText === 'email1' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Email 2 */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="text-[11px] text-gray-500">Email Secondaire</p>
                  <a href={`mailto:${emails[1]}`} className="text-xs font-bold text-gray-900 hover:text-emerald-700">
                    {emails[1]}
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleCopy(emails[1], 'email2')}
                title="Copier l'email"
                className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                {copiedText === 'email2' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Availability badge */}
          <div className="flex items-center space-x-2 text-xs text-gray-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Support disponible du <strong>Lundi au Samedi</strong> de <strong>08h à 20h (GMT)</strong></span>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">StockFlow Pro • Faso Retail Tech</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default SupportModal;
