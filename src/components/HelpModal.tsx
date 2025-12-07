import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  color: 'var(--accent-primary)',
  marginBottom: '0.5rem',
};

const TEXT_STYLE: React.CSSProperties = {
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
};

const LIST_STYLE: React.CSSProperties = {
  ...TEXT_STYLE,
  paddingLeft: '1.5rem',
};

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('help.title')}
      titleId="help-modal-title"
      maxWidth="600px"
      maxHeight="80vh"
      closeButtonAriaLabel="Close help modal"
      contentStyle={SECTION_STYLE}
    >
      <section>
        <h3 style={SECTION_TITLE_STYLE}>{t('help.gettingStarted.title')}</h3>
        <p style={TEXT_STYLE}>{t('help.gettingStarted.content')}</p>
      </section>

      <section>
        <h3 style={SECTION_TITLE_STYLE}>{t('help.batchProcessing.title')}</h3>
        <p style={TEXT_STYLE}>{t('help.batchProcessing.content')}</p>
      </section>

      <section>
        <h3 style={SECTION_TITLE_STYLE}>{t('help.tips.title')}</h3>
        <ul style={LIST_STYLE}>
          <li>{t('help.tips.item1')}</li>
          <li>{t('help.tips.item2')}</li>
          <li>{t('help.tips.item3')}</li>
        </ul>
      </section>
    </Modal>
  );
};
