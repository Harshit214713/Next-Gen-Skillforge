import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Next-Gen Skillforge',
  description: 'AI-driven career profile analysis, skill graphs, job recommendations, and learning roadmaps.',
  icons: {
    icon: '/next-gen-skillforge-logo.svg',
    shortcut: '/next-gen-skillforge-logo.svg',
  },
  openGraph: {
    title: 'Next-Gen Skillforge',
    description: 'AI-driven career profile analysis and learning roadmap.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme-mode');
                const theme = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
                document.documentElement.dataset.theme = theme;
              } catch (e) {
                document.documentElement.dataset.theme = 'light';
              }
            `,
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable}`}>{children}</body>
    </html>
  );
}
