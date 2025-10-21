import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";

const marianne = localFont({
  src: [
    {
      path: '../public/fonts/Marianne-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-RegularItalic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-MediumItalic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-BoldItalic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../public/fonts/Marianne-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/Marianne-ExtraBoldItalic.otf',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-marianne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Tableau de Bord Vaccination et Grippe - Gouvernement.fr",
  description: "Visualisation des données de vaccination et de surveillance de la grippe en France (2021-2024) - Ministère de la Santé et de la Prévention",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={marianne.variable}>
      <body className="font-marianne antialiased bg-grey-france-50">
        {children}
      </body>
    </html>
  );
}
