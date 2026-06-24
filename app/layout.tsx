import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EmbedKit',
  description: 'Embedded systems component selector',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap"
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0f1117' }}>
        {children}
      </body>
    </html>
  );
}
