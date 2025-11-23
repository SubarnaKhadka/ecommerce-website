import nodemailer from "nodemailer";
import { config, Sentry } from "shared";

const { user, pass } = config.email;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

export async function sendMail({
  to,
  subject,
  message,
  options = {},
}: {
  to: string;
  subject: string;
  message: string;
  options: {
    text?: string;
    html?: string;
  };
}) {
  try {
    await transporter.sendMail({
      from: `"${config.app.name}" <${user}>`,
      to,
      subject,
      text: options.text ? options.text : undefined,
      html: options.html ? options.html : message,
    });
  } catch (err) {
    Sentry.captureException(err);
  }
}
