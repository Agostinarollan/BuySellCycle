import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface OpcionesEmail {
  para: string;
  asunto: string;
  html: string;
  adjuntos?: { filename: string; content: Buffer }[];
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  /**
   * Si en el .env hay SMTP_HOST se usa ese servidor (Gmail, Mailtrap...).
   * Si NO hay, se crea automáticamente una cuenta de prueba en Ethereal:
   * los emails no llegan a nadie, pero se pueden ver en una URL de vista previa.
   */
  private async obtenerTransporter(): Promise<Transporter> {
    if (this.transporter) return this.transporter;

    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
      const user = this.config.get<string>('SMTP_USER');
      const pass = this.config.get<string>('SMTP_PASS');
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
      });
    } else {
      const cuenta = await nodemailer.createTestAccount();
      this.logger.log(`Usando cuenta de prueba Ethereal: ${cuenta.user}`);
      this.transporter = nodemailer.createTransport({
        host: cuenta.smtp.host,
        port: cuenta.smtp.port,
        secure: cuenta.smtp.secure,
        auth: { user: cuenta.user, pass: cuenta.pass },
      });
    }
    return this.transporter;
  }

  async enviar(opciones: OpcionesEmail) {
    const transporter = await this.obtenerTransporter();
    const info = await transporter.sendMail({
      from:
        this.config.get<string>('MAIL_FROM') ??
        'BuySellCycle <no-reply@buysellcycle.com>',
      to: opciones.para,
      subject: opciones.asunto,
      html: opciones.html,
      attachments: opciones.adjuntos,
    });
    // Solo con Ethereal existe una URL de vista previa.
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    if (previewUrl) this.logger.log(`Vista previa del email: ${previewUrl}`);
    return { messageId: info.messageId, previewUrl };
  }
}
