export const metadata = {
  title: 'SmartWe',
  description: 'SmartWe'
};

import './globals.css';
import { SettingsProvider } from '../contexts/SettingsContext';
import SettingsModal from '../components/SettingsModal';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <SettingsProvider>
          {children}
          <SettingsModal />
        </SettingsProvider>
      </body>
    </html>
  );
}


