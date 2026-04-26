import { Resend } from "resend";
import nodemailer from "nodemailer";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const EmailService = {
  async sendVerificationEmail(email: string, name: string, code: string) {
    const subject = "💧 Ative sua conta - Water Alert";
    const html = `
      <div style="background-color: #f0f4f8; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00B4DB 0%, #0083B0 100%); padding: 40px 20px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 15px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 30px;">💧</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Water Alert</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; text-align: center; color: #2d3748;">
            <h2 style="margin-top: 0; color: #1a202c; font-size: 20px;">Bem-vindo ao time, ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #718096;">Estamos felizes em ajudar você na sua jornada de hidratação. Para começar, use o código de verificação abaixo:</p>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #edf2f7; border-radius: 12px;">
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0083B0; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #a0aec0;">Este código expira em 24 horas. Se você não solicitou este e-mail, pode ignorá-lo com segurança.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
            <p style="margin: 0; font-size: 12px; color: #cbd5e0;">&copy; 2024 Water Alert. Beba água, sinta-se bem.</p>
          </div>
        </div>
      </div>
    `;

    if (resend && RESEND_API_KEY && !RESEND_API_KEY.includes('123456789')) {
      try {
        await resend.emails.send({
          from: 'Water Alert <no-reply@resend.dev>',
          to: email,
          subject,
          html
        });
        console.log(`✅ E-mail enviado via Resend para ${email}`);
        return;
      } catch (error) {
        console.error("❌ Erro ao enviar via Resend, tentando fallback...", error);
      }
    }

    // Fallback/Test mode: Ethereal Email
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: '"Water Alert" <no-reply@resend.dev>',
        to: email,
        subject,
        html,
      });

      console.log(`\n🚀 [TESTE] E-mail de verificação para ${email}`);
      console.log(`🔗 Link para visualizar o e-mail: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`💡 Nota: Como você não configurou o Resend real, estamos usando o modo de teste (Ethereal).\n`);
    } catch (error) {
      console.error("❌ Erro fatal ao enviar e-mail:", error);
    }
  }
};
