import path from 'node:path';
import { pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { z } from 'zod';

dotenv.config();

const DEFAULT_PRIMARY_EMAIL = 'kunaalsengar27@gmail.com';
const DEFAULT_SECONDARY_EMAIL = 'decodzyy@gmail.com';

const contactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Please enter your name (at least 2 characters).')
    .max(100, 'Name must be 100 characters or fewer.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address.')
    .max(254, 'Email address must be 254 characters or fewer.'),
  subject: z
    .string({ required_error: 'Subject is required.' })
    .trim()
    .min(3, 'Please enter a subject (at least 3 characters).')
    .max(150, 'Subject must be 150 characters or fewer.'),
  message: z
    .string({ required_error: 'Message is required.' })
    .trim()
    .min(10, 'Please enter a message (at least 10 characters).')
    .max(3000, 'Message must be 3000 characters or fewer.'),
  website: z
    .string()
    .max(200)
    .optional()
    .default(''),
});

function stripHeaderBreaks(value) {
  return String(value).replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseAllowedOrigins(env) {
  const raw = env.FRONTEND_ORIGIN || '';
  const origins = raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (origins.length > 0) {
    return origins;
  }

  return env.NODE_ENV === 'production' ? [] : ['http://localhost:5173'];
}

function getContactRecipients(env) {
  const primary = (env.CONTACT_EMAIL_PRIMARY || DEFAULT_PRIMARY_EMAIL).trim();
  const secondary = (env.CONTACT_EMAIL_SECONDARY || DEFAULT_SECONDARY_EMAIL).trim();
  return [...new Set([primary, secondary].filter(Boolean))];
}

function hasValidSmtpConfig(env) {
  const host = (env.SMTP_HOST || '').trim();
  const port = Number(env.SMTP_PORT);
  const user = (env.SMTP_USER || '').trim();
  const pass = env.SMTP_PASS || '';

  return Boolean(host && user && pass && Number.isInteger(port) && port > 0 && port <= 65535);
}

function createSmtpTransporter(env) {
  if (!hasValidSmtpConfig(env)) {
    return null;
  }

  const port = Number(env.SMTP_PORT);
  const secureFlag = String(env.SMTP_SECURE || '').trim().toLowerCase();
  const secure = secureFlag ? secureFlag === 'true' : port === 465;

  return nodemailer.createTransport({
    host: env.SMTP_HOST.trim(),
    port,
    secure,
    auth: {
      user: env.SMTP_USER.trim(),
      pass: env.SMTP_PASS,
    },
  });
}

function buildContactEmailHtml({ name, email, subject, message, timestamp }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br />');
  const safeTimestamp = escapeHtml(timestamp);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>New Portfolio Inquiry</title>
  </head>
  <body style="margin:0;padding:24px;background-color:#0b0b0b;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background-color:#141414;border:1px solid #2b2b2b;border-top:3px solid #E50914;border-radius:12px;">
      <tr>
        <td style="padding:28px 32px;">
          <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#E50914;font-weight:700;">
            Portfolio Contact Signal
          </p>
          <h1 style="margin:0 0 20px 0;font-size:22px;line-height:1.3;color:#ffffff;">
            ${safeSubject}
          </h1>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;background-color:#0f0f0f;border:1px solid #262626;border-radius:8px;">
            <tr>
              <td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#d4d4d4;">
                <div><strong style="color:#ffffff;">Name:</strong> ${safeName}</div>
                <div><strong style="color:#ffffff;">Email:</strong> <a href="mailto:${safeEmail}" style="color:#f87171;text-decoration:none;">${safeEmail}</a></div>
                <div><strong style="color:#ffffff;">Subject:</strong> ${safeSubject}</div>
                <div><strong style="color:#ffffff;">Submitted (UTC):</strong> ${safeTimestamp}</div>
              </td>
            </tr>
          </table>
          <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#a3a3a3;margin-bottom:8px;">
            Message
          </div>
          <div style="padding:16px;background-color:#0f0f0f;border:1px solid #262626;border-radius:8px;font-size:14px;line-height:1.65;color:#f5f5f5;">
            ${safeMessage}
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function createApp(options = {}) {
  const env = options.env || process.env;
  const allowedOrigins = parseAllowedOrigins(env);
  const recipients = getContactRecipients(env);
  const transporter =
    options.transporter !== undefined ? options.transporter : createSmtpTransporter(env);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());

  app.use(
    cors({
      origin(requestOrigin, callback) {
        if (!requestOrigin) {
          return callback(null, true);
        }
        const normalizedOrigin = requestOrigin.replace(/\/+$/, '');
        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        const corsError = new Error('Origin not allowed by CORS policy.');
        corsError.statusCode = 403;
        return callback(corsError);
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    })
  );

  app.use(express.json({ limit: '16kb' }));

  const parsedRateMax = Number(options.rateLimitMax ?? env.RATE_LIMIT_MAX ?? 5);
  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number.isInteger(parsedRateMax) && parsedRateMax > 0 ? parsedRateMax : 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler(_req, res) {
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait a few minutes before sending another message.',
      });
    },
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.post('/api/contact', contactLimiter, async (req, res) => {
    const parsed = contactSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const errors = {
        name: flattened.name?.[0],
        email: flattened.email?.[0],
        subject: flattened.subject?.[0],
        message: flattened.message?.[0],
      };

      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted fields and try again.',
        errors,
      });
    }

    const { name, email, subject, message, website } = parsed.data;

    // Silently discard automated honeypot submissions without sending email
    if (website && website.trim().length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message.',
      });
    }

    if (!transporter || recipients.length === 0) {
      return res.status(503).json({
        success: false,
        message:
          'Contact email service is currently unconfigured. Please email kunaalsengar27@gmail.com directly.',
      });
    }

    const safeHeaderName = stripHeaderBreaks(name);
    const safeHeaderSubject = stripHeaderBreaks(subject);
    const safeVisitorEmail = stripHeaderBreaks(email);
    const submittedAt = new Date().toISOString();
    const senderAddress = (env.SMTP_USER || DEFAULT_PRIMARY_EMAIL).trim();

    try {
      const info = await transporter.sendMail({
        from: `"Kunal Sengar Portfolio" <${senderAddress}>`,
        to: recipients.join(', '),
        replyTo: `"${safeHeaderName.replace(/"/g, '')}" <${safeVisitorEmail}>`,
        subject: `[Portfolio Contact] ${safeHeaderSubject}`,
        text: [
          'New Portfolio Contact Inquiry',
          `Name: ${safeHeaderName}`,
          `Email: ${safeVisitorEmail}`,
          `Subject: ${safeHeaderSubject}`,
          `Submitted (UTC): ${submittedAt}`,
          '',
          'Message:',
          message,
        ].join('\n'),
        html: buildContactEmailHtml({
          name,
          email: safeVisitorEmail,
          subject,
          message,
          timestamp: submittedAt,
        }),
      });

      if (!info || !Array.isArray(info.accepted) || info.accepted.length === 0) {
        return res.status(502).json({
          success: false,
          message: 'Email server did not accept recipients. Please try again later.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Message delivered successfully. I will get back to you soon.',
      });
    } catch {
      console.error('Contact email delivery error.');
      return res.status(500).json({
        success: false,
        message: 'Unable to send your message right now. Please try again later or email directly.',
      });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found.',
    });
  });

  app.use((err, _req, res, _next) => {
    void _next;
    if (err?.statusCode === 403) {
      return res.status(403).json({
        success: false,
        message: 'Origin not allowed by CORS policy.',
      });
    }
    if (err?.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        message: 'Request payload is too large.',
      });
    }
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON payload.',
      });
    }
    console.error('Unhandled API error.');
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  });

  return app;
}

const isDirectExecution =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectExecution) {
  const port = Number(process.env.PORT) || 5000;
  const app = createApp();
  app.listen(port, () => {
    console.log(`Portfolio contact API listening on port ${port}`);
  });
}

