export const metadata = {
  title: 'SmartWe',
  description: 'SmartWe'
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}


