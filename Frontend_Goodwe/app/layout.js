export const metadata = {
  title: 'SmartWe',
  description: 'SmartWe'
};

import './globals.css';
import { SettingsProvider } from '../contexts/SettingsContext';
import { AuthProvider } from '../contexts/AuthContext';
import SettingsModal from '../components/SettingsModal';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <SettingsProvider>
            {children}
            <SettingsModal />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


