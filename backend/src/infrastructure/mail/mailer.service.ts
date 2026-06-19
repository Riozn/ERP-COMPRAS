import nodemailer from 'nodemailer'

import { env } from '../config/env.js'

export interface MailerService {
  sendWelcomeEmail(to: string, nombreCompleto: string): Promise<void>
  sendTwoFactorCode(
    to: string,
    nombreCompleto: string,
    code: string,
  ): Promise<void>
}

const isMailerConfigured = Boolean(
  process.env.SMTP_HOST,
)

export class NodemailerMailerService implements MailerService {
  private readonly transporter = process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: ['1', 'true', 'yes', 'on'].includes(
          String(process.env.SMTP_SECURE ?? '').toLowerCase(),
        ),
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS ?? '',
            }
          : undefined,
      })
    : null

  async sendWelcomeEmail(to: string, nombreCompleto: string): Promise<void> {
    if (!this.transporter || !isMailerConfigured) {
      return
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'ERP1 <no-reply@erp1.local>',
      to,
      subject: `${env.app.name} - Bienvenido`,
      text: `Hola ${nombreCompleto}, tu cuenta ya esta activa.`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; color: #0f172a;">
          <h1 style="margin: 0 0 12px; font-size: 20px;">Bienvenido, ${nombreCompleto}</h1>
          <p style="margin: 0;">Tu cuenta en ${env.app.name} esta lista para usar.</p>
        </div>
      `,
    })
  }

  async sendTwoFactorCode(
    to: string,
    nombreCompleto: string,
    code: string,
  ): Promise<void> {
    if (!this.transporter || !isMailerConfigured) {
      console.info('[mailer] 2FA code for %s: %s', to, code)
      return
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'ERP1 <no-reply@erp1.local>',
      to,
      subject: `${env.app.name} - Codigo de acceso`,
      text: `Hola ${nombreCompleto}, tu codigo de acceso es ${code}.`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; color: #0f172a;">
          <h1 style="margin: 0 0 12px; font-size: 20px;">Codigo de acceso</h1>
          <p style="margin: 0 0 8px;">Hola ${nombreCompleto}, tu codigo es:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</div>
          <p style="margin: 12px 0 0;">Este codigo expira en pocos minutos.</p>
        </div>
      `,
    })
  }
}
