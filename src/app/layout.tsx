import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ゴルフ場 最安値比較",
  description:
    "楽天GORA・じゃらんゴルフなどの料金をまとめて比較。今いちばん安いプランがすぐわかります。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
