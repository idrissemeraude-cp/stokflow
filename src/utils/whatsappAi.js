import { formatFCFA, formatDateFr } from './storage';

/**
 * Génère le message WhatsApp personnalisé selon le niveau d'urgence et le ton sélectionné
 */
export const generateWhatsappMessage = ({
  clientName,
  storeName = 'Boutique Élégance Faso',
  amountDue,
  dueDate,
  saleDate,
  tone = 'STANDARD', // 'DOUX' | 'STANDARD' | 'URGENT'
  urgencyCode = 'DUE_TODAY'
}) => {
  const formattedAmount = formatFCFA(amountDue);
  const formattedDueDate = formatDateFr(dueDate);
  const formattedSaleDate = saleDate ? formatDateFr(saleDate) : 'récent';

  if (tone === 'DOUX') {
    return `Bonjour ${clientName} 😊, 

J'espère que vous allez très bien ! 

Petit message courtois de la boutique *${storeName}* : nous vous rappelons qu'un solde restant de *${formattedAmount}* pour votre achat du ${formattedSaleDate} arrive à échéance le *${formattedDueDate}*.

Merci infiniment pour votre confiance et belle journée à vous ! 🌸`;
  }

  if (tone === 'URGENT') {
    return `⚠️ *RAPPEL DE PAIEMENT URGENT* - ${storeName}

Bonjour ${clientName},

Sauf erreur de notre part, votre solde de *${formattedAmount}* concernant vos vêtements achetés le ${formattedSaleDate} (Échéance : *${formattedDueDate}*) n'a pas encore été réglé.

Merci de bien vouloir effectuer votre règlement aujourd'hui par Espèces, Orange Money ou Moov Money pour mettre à jour votre fiche cliente.

Contact Boutique : Merci de nous répondre à ce message dès réception. 🙏`;
  }

  // Ton Standard / Professionnel (Par défaut)
  return `Bonjour ${clientName}, 

J'espère que vous vous portez bien.

Petit rappel de la boutique *${storeName}* : il vous reste un solde restant de *${formattedAmount}* à régler pour votre achat du ${formattedSaleDate}. 

📅 Date d'échéance : *${formattedDueDate}*

Merci pour votre confiance et à très bientôt ! 🛍️`;
};

/**
 * Nettoie et formate le numéro au format WhatsApp international (+226...)
 */
export const formatCleanPhone = (phoneRaw) => {
  if (!phoneRaw) return '';
  let cleaned = phoneRaw.replace(/\D/g, ''); // Garde uniquement les chiffres
  
  // Si le numéro commence par 226 (Burkina Faso) et a 11 chiffres
  if (cleaned.startsWith('226') && cleaned.length === 11) {
    return '+' + cleaned;
  }
  // Si le numéro commence par 7, 6, 5 ou 0 et fait 8 chiffres (format local BF)
  if (cleaned.length === 8) {
    return '+226' + cleaned;
  }
  return '+' + cleaned;
};

/**
 * Génère le lien direct Click-to-Chat WhatsApp avec message pré-rempli
 */
export const buildWhatsappLink = (phone, message) => {
  const cleanPhone = formatCleanPhone(phone).replace('+', '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
};
