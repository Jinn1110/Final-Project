import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Warning } from '../warning/schemas/warning.chema';
// sửa typo: warning.chema → warning.schema

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWarningEmail(to: string, warning: Warning) {
    const timeStr = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const typeUpper = warning.type.toUpperCase();
    const typeColor = this.getTypeColor(warning.type);

    return this.mailerService.sendMail({
      to,
      subject: `⚠️ GNSS ${typeUpper} DETECTED - ${warning.deviceId}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GNSS Warning Alert</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#f4f4f4; color:#333;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding:28px 30px; text-align:center;">
              <h1 style="margin:0; color:white; font-size:28px; font-weight:bold;">
                ⚠️ GNSS ${typeUpper} DETECTED
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:30px 40px 20px;">
              <h2 style="margin:0 0 20px; color:#1f2937; font-size:22px;">
                Cảnh báo thiết bị
              </h2>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">
                    <strong style="color:#374151; min-width:120px; display:inline-block;">Thiết bị:</strong>
                    <span style="color:#111827;">${warning.deviceId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">
                    <strong style="color:#374151; min-width:120px; display:inline-block;">Loại cảnh báo:</strong>
                    <span style="color:${typeColor}; font-weight:600;">${warning.type}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0; border-bottom:1px solid #e5e7eb;">
                    <strong style="color:#374151; min-width:120px; display:inline-block;">Thời gian:</strong>
                    <span style="color:#111827;">${timeStr}</span>
                  </td>
                </tr>
              </table>

              <!-- Image section -->
              <div style="margin:30px 0 10px; text-align:center;">
                <p style="margin:0 0 16px; color:#4b5563; font-size:15px;">
                  Hình ảnh sự kiện:
                </p>
                <a href="${warning.imageUrl}" target="_blank" style="display:inline-block; text-decoration:none;">
                  <img 
                    src="${warning.imageUrl}" 
                    alt="Warning Image" 
                    style="max-width:100%; height:auto; border-radius:6px; border:1px solid #e5e7eb; box-shadow:0 2px 8px rgba(0,0,0,0.08);"
                    width="460"
                  >
                </a>
              </div>

              <!-- Button -->
              <div style="text-align:center; margin:32px 0 20px;">
                <a href="${warning.imageUrl}" target="_blank" 
                   style="display:inline-block; background-color:#dc2626; color:white; font-weight:bold; padding:14px 32px; border-radius:6px; text-decoration:none; font-size:16px; box-shadow:0 2px 6px rgba(220,38,38,0.3);">
                  Xem chi tiết hình ảnh →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:24px 40px; text-align:center; font-size:13px; color:#6b7280; border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px;">
                Đây là email tự động từ hệ thống giám sát GNSS. Vui lòng không trả lời trực tiếp.
              </p>
              <p style="margin:0;">
                © ${new Date().getFullYear()} GNSS Monitoring System
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
  }

  private getTypeColor(type: string): string {
    const lower = type.toLowerCase();
    if (lower.includes('critical') || lower.includes('nguy cấp'))
      return '#dc2626';
    if (lower.includes('warning') || lower.includes('cảnh báo'))
      return '#d97706';
    if (lower.includes('error') || lower.includes('lỗi')) return '#b91c1c';
    return '#7c3aed'; // default
  }
}
