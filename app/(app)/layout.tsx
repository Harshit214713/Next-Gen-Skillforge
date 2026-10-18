import { Sidebar } from '@/components/layout/sidebar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <div className="md:pl-64 min-h-screen">{children}</div>
    </>
  );
}
