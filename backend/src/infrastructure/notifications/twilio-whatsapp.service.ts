import { env } from '../config/env.js'

export interface WhatsAppDeliveryService {
  sendTwoFactorCode(to: string, nombreCompleto: string, code: string): Promise<void>
}

function normalizeWhatsappAddress(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  return trimmed.startsWith('whatsapp:') ? trimmed : `whatsapp:${trimmed}`
}

function hasTwilioConfig(): boolean {
  return Boolean(
    env.integrations.twilio.accountSid.trim() &&
      env.integrations.twilio.authToken.trim() &&
      env.integrations.twilio.fromPhone.trim(),
  )
}

export class TwilioWhatsAppService implements WhatsAppDeliveryService {
  async sendTwoFactorCode(
    to: string,
    nombreCompleto: string,
    code: string,
  ): Promise<void> {
    if (!hasTwilioConfig()) {
      console.info('[twilio] WhatsApp 2FA code for %s: %s', to, code)
      return
    }

    const accountSid = env.integrations.twilio.accountSid.trim()
    const authToken = env.integrations.twilio.authToken.trim()
    const fromPhone = normalizeWhatsappAddress(env.integrations.twilio.fromPhone)
    const toPhone = normalizeWhatsappAddress(to)

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromPhone,
          To: toPhone,
          Body: `Hola ${nombreCompleto}, tu codigo de acceso es ${code}.`,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`No se pudo enviar el codigo por WhatsApp: ${response.status} ${errorText}`)
    }
  }
}
