const nodemailer = require("nodemailer");

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("missing_smtp_env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

const sendContactEmail = async ({ name, email, app, urgency, msg, files }) => {
  const transporter = getTransporter();
  const to = process.env.MAIL_TO;
  const from = process.env.MAIL_FROM || to;

  if (!to || !from) {
    throw new Error("missing_mail_env");
  }

  const attachments = (files || []).map((file) => ({
    filename: file.originalname,
    content: file.buffer,
    contentType: file.mimetype,
  }));

  const subject = `[Demande express] ${app} (${urgency})`;
  const text = [
    "Nouvelle demande :",
    "",
    `Nom: ${name}`,
    `Email: ${email}`,
    `Type: ${app}`,
    `Urgence: ${urgency}`,
    "",
    "Message:",
    msg,
  ].join("\n");

  await transporter.sendMail({
    to,
    from,
    replyTo: email,
    subject,
    text,
    attachments,
  });
};

module.exports = { sendContactEmail };
