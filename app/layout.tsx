import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "入戏 InScene · 小说转剧本工作台",
  description: "把小说内容转成可继续创作的结构化剧本 YAML。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased bg-[#efece4]">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
