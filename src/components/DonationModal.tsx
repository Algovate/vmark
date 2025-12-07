import React from 'react';
import { useTranslation } from 'react-i18next';
import { ALIPAY_DONATION_URL, ALIPAY_QR_CODE_URL, ALIPAY_QR_CODE_LINK } from '../constants/defaultConfig';
import { Modal } from './Modal';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QR_CODE_CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const QR_CODE_WRAPPER_STYLE: React.CSSProperties = {
  width: 'min(350px, 90vw)',
  aspectRatio: '2 / 3',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  padding: '0.75rem',
  backgroundColor: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const QR_CODE_IMAGE_STYLE: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
};

const BUTTON_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
};

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const isMobile = useDeviceDetection();

  const handleOpenAlipay = () => {
    if (isMobile && ALIPAY_DONATION_URL.startsWith('alipays://')) {
      // 移动设备：尝试打开支付宝 APP
      window.location.href = ALIPAY_DONATION_URL;
    } else {
      // 桌面浏览器：打开支付宝网页版收款码链接
      window.open(ALIPAY_QR_CODE_LINK, '_blank');
    }
  };

  const shouldShowButton = isMobile || !ALIPAY_QR_CODE_URL;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('donation.title')}
      titleId="donation-modal-title"
      maxWidth="500px"
      closeButtonAriaLabel={t('donation.close')}
      titleStyle={{ textAlign: 'center' }}
      contentStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
        {ALIPAY_QR_CODE_URL && (
          <div style={QR_CODE_CONTAINER_STYLE}>
            <div style={QR_CODE_WRAPPER_STYLE}>
              <img
                src={ALIPAY_QR_CODE_URL}
                alt="Alipay QR Code"
                style={QR_CODE_IMAGE_STYLE}
              />
            </div>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>
              {t('donation.scanQR')}
            </p>
          </div>
        )}

        {shouldShowButton && (
          <button onClick={handleOpenAlipay} className="btn-primary" style={BUTTON_STYLE}>
            {t('donation.openAlipay')}
          </button>
        )}
      </div>
    </Modal>
  );
};

