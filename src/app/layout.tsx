import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seedev — Studio web premium',
  description: 'Site pro livré en 5 jours, à partir de 690€. Design, dev, outils IA et espace client inclus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="ambient-bg">
          <div className="ambient-bg-extra" />
        </div>
        {children}
      </body>
    </html>
  );
}
