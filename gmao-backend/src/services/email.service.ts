import nodemailer from 'nodemailer';

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

export const sendDiAssignmentEmail = async (to: string, diNumero: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"GMAO System" <noreply@gmao.com>',
    to,
    subject: `Nouvelle Assignation: Intervention ${diNumero}`,
    text: `Bonjour,\n\nVous avez été assigné à la Demande d'Intervention ${diNumero}.\nVeuillez consulter le tableau de bord pour plus de détails.\n\nCordialement,\nL'équipe Maintenance.`,
    html: `
      <h3>Nouvelle Assignation DI</h3>
      <p>Bonjour,</p>
      <p>Vous avez été assigné à la Demande d'Intervention <strong>${diNumero}</strong>.</p>
      <p>Veuillez consulter le tableau de bord pour plus de détails.</p>
      <br/>
      <p>Cordialement,<br/>L'équipe Maintenance.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Service] Email sent: ${info.messageId}`);
  return info;
};
