import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Lock, 
  Unlock, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { saveUserRole, saveSecurityPin } from '../utils/storage';

const RoleSwitcherModal = ({ currentRole, securityPin, onRoleChange, onClose, onOpenUsersModal }) => {
  const [targetRole, setTargetRole] = useState(currentRole);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Change PIN mode state
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleApplyRole = (e) => {
    e.preventDefault();
    setPinError('');

    if (targetRole === 'ADMIN' && currentRole !== 'ADMIN') {
      if (pinInput !== securityPin) {
        setPinError("Code PIN incorrect. Le code par défaut est 1234.");
        return;
      }
    }

    onRoleChange(targetRole);
    saveUserRole(targetRole);
    onClose();
  };

  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    if (oldPin !== securityPin) {
      setPinError("L'ancien code PIN est incorrect.");
      return;
    }
    if (newPin.length < 4) {
      setPinError("Le nouveau code PIN doit comporter au moins 4 chiffres.");
      return;
    }

    saveSecurityPin(newPin);
    alert('✅ Code PIN de sécurité modifié avec succès !');
    setIsChangingPin(false);
    setOldPin('');
    setNewPin('');
    setPinError('');
  };

  return (
    <div className="fixed inset-0 bg-[#064E3B]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-lg text-[#064E3B] font-sans">
              Rôles & Sécurité de Caisse
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isChangingPin ? (
          <form onSubmit={handleApplyRole} className="space-y-4 text-xs">
            <p className="text-gray-500">
              Choisissez le mode d'utilisation pour verrouiller les données financières sensibles.
            </p>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Option 1: Admin / Propriétaire */}
              <div
                onClick={() => setTargetRole('ADMIN')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  targetRole === 'ADMIN'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">👑</span>
                  {targetRole === 'ADMIN' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="font-bold text-gray-900 mt-2">Propriétaire / Gérant</h4>
                <p className="text-[10px] text-gray-500 mt-1">Accès total : marges, bénéfices, suppressions, configuration.</p>
              </div>

              {/* Option 2: Caissier / Vendeur */}
              <div
                onClick={() => setTargetRole('CASHIER')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  targetRole === 'CASHIER'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">👤</span>
                  {targetRole === 'CASHIER' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <h4 className="font-bold text-gray-900 mt-2">Caissier / Vendeur</h4>
                <p className="text-[10px] text-gray-500 mt-1">Accès restreint : encaissement caisse & stock. Marges et prix d'achat masqués.</p>
              </div>

            </div>

            {/* PIN prompt if switching to Admin */}
            {targetRole === 'ADMIN' && currentRole !== 'ADMIN' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <label className="block font-bold text-amber-900 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  Code PIN Propriétaire requis (Défaut : 1234)
                </label>
                <input
                  type="password"
                  maxLength="6"
                  required
                  placeholder="Entrez le code PIN..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono font-bold text-center tracking-widest text-sm focus:outline-none"
                />
              </div>
            )}

            {pinError && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>Modifier code PIN</span>
                </button>

                {onOpenUsersModal && (
                  <button
                    type="button"
                    onClick={() => { onClose(); onOpenUsersModal(); }}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>👥 Gérer l'équipe</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-[#064E3B] hover:bg-emerald-950 text-white font-bold shadow-md"
              >
                Appliquer le Rôle
              </button>
            </div>

          </form>
        ) : (
          /* Change PIN Sub-Form */
          <form onSubmit={handleChangePinSubmit} className="space-y-3 text-xs">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-600" />
              Modifier le Code PIN de Sécurité
            </h4>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Ancien Code PIN</label>
              <input
                type="password"
                required
                maxLength="6"
                placeholder="ex: 1234"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 font-mono tracking-widest text-center"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nouveau Code PIN (4 à 6 chiffres)</label>
              <input
                type="password"
                required
                maxLength="6"
                placeholder="ex: 9876"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-300 font-mono tracking-widest text-center"
              />
            </div>

            {pinError && (
              <div className="p-2 rounded-xl bg-red-50 text-red-700 text-[11px]">
                {pinError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setIsChangingPin(false); setPinError(''); }}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
              >
                Retour
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Enregistrer le PIN
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default RoleSwitcherModal;
