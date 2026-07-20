import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'email-service' });

// Create a transporter using your SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface DiAssignmentEmailData {
  diNumero: string;
  atelier: string;
  ligne: string;
  poste: string;
  priorite: string;
  produit?: string | null;
  panneNom?: string | null;
  panneDescription?: string | null;
  panneType?: string | null;
}

export const sendDiAssignmentEmail = async (to: string, data: DiAssignmentEmailData) => {
  const {
    diNumero,
    atelier,
    ligne,
    poste,
    priorite,
    produit,
    panneNom,
    panneDescription,
    panneType,
  } = data;

  const localisation = `${atelier} / ${ligne} / ${poste}`;
  const panneLabel = panneNom
    ? `${panneNom}${panneType ? ` (${panneType})` : ''}`
    : 'Non spécifiée (à qualifier sur place)';

  const mailOptions = {
    from: process.env.SMTP_FROM || '"GMAO System" <noreply@gmao.com>',
    to,
    subject: `Nouvelle Assignation: Intervention ${diNumero} [${priorite}]`,
    text: [
      `Bonjour,`,
      ``,
      `Vous avez été assigné à la Demande d'Intervention ${diNumero}.`,
      ``,
      `Localisation : ${localisation}`,
      produit ? `Produit concerné : ${produit}` : null,
      `Panne signalée : ${panneLabel}`,
      panneDescription ? `Détails : ${panneDescription}` : null,
      `Priorité : ${priorite}`,
      ``,
      `Veuillez consulter le tableau de bord pour plus de détails.`,
      ``,
      `Cordialement,`,
      `L'équipe Maintenance.`,
    ]
      .filter((line) => line !== null)
      .join('\n'),
    html: `
      <h3>Nouvelle Assignation DI</h3>
      <p>Bonjour,</p>
      <p>Vous avez été assigné à la Demande d'Intervention <strong>${diNumero}</strong>.</p>
      <ul>
        <li><strong>Localisation :</strong> ${localisation}</li>
        ${produit ? `<li><strong>Produit :</strong> ${produit}</li>` : ''}
        <li><strong>Panne :</strong> ${panneLabel}</li>
        ${panneDescription ? `<li><strong>Détails :</strong> ${panneDescription}</li>` : ''}
        <li><strong>Priorité :</strong> ${priorite}</li>
      </ul>
      <p>Veuillez consulter le tableau de bord pour plus de détails.</p>
      <br/>
      <p>Cordialement,<br/>L'équipe Maintenance.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  log.info({ messageId: info.messageId }, 'Email sent');
  return info;
};
