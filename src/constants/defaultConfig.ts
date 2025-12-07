import type { WatermarkConfig, ExportOptions } from '../components/ControlPanel';

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  type: 'text',
  text: 'Watermark',
  color: '#ffffff',
  fontSize: 48,
  opacity: 0.8,
  rotation: 0,
  repeat: false,
  spacing: 200,
  imageSize: 100,
};

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 0.92,
};

// 支付宝捐赠配置
const donationUrl = import.meta.env.VITE_ALIPAY_DONATION_URL || 'alipays://platformapi/startapp?saId=10000007&qrcode=https://qr.alipay.com/xxx';
// 从 alipays:// 协议中提取收款码链接，如果没有协议则直接使用
const extractQRCodeUrl = (url: string): string => {
  if (url.startsWith('alipays://')) {
    const match = url.match(/qrcode=(.+)$/);
    return match ? match[1] : url;
  }
  return url;
};
export const ALIPAY_QR_CODE_LINK = extractQRCodeUrl(donationUrl);
export const ALIPAY_DONATION_URL = donationUrl;
// 处理二维码图片 URL，如果是相对路径则加上 BASE_URL
const qrCodeUrl = import.meta.env.VITE_ALIPAY_QR_CODE_URL || '';
export const ALIPAY_QR_CODE_URL = qrCodeUrl && !qrCodeUrl.startsWith('http') && !qrCodeUrl.startsWith('//')
  ? `${import.meta.env.BASE_URL}${qrCodeUrl.replace(/^\//, '')}`
  : qrCodeUrl;

