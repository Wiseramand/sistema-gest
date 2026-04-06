import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const FROM_EMAIL = process.env.EMAIL_FROM || 'Marítimo Training Center <onboarding@resend.dev>';

/**
 * Envia um email formatado com o branding do Marítimo Training Center
 */
export async function sendMTCEmail({
  to,
  subject,
  title,
  body,
  buttonText,
  buttonUrl,
}: {
  to: string;
  subject: string;
  title: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(10, 42, 94, 0.05); border: 1px solid #e2e8f0; }
          .header { background-color: #0a2a5e; padding: 40px 20px; text-align: center; }
          .logo { font-size: 24px; font-weight: 800; color: #F5C518; letter-spacing: 0.05em; text-transform: uppercase; }
          .content { padding: 40px; color: #0f1e35; line-height: 1.6; }
          h1 { color: #0a2a5e; font-size: 20px; margin-bottom: 20px; }
          p { font-size: 16px; color: #475569; }
          .btn-container { text-align: center; margin-top: 40px; }
          .btn { background-color: #0a2a5e; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚓ Marítimo Training Center</div>
          </div>
          <div class="content">
            <h1>${title}</h1>
            <p>${body.replace(/\n/g, '<br>')}</p>
            ${buttonText && buttonUrl ? `
              <div class="btn-container">
                <a href="${buttonUrl}" class="btn">${buttonText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Marítimo Training Center. Todos os direitos reservados.<br>
            Funchal, Madeira, Portugal
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email Send Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected Email Error:', err);
    return { success: false, error: err };
  }
}
