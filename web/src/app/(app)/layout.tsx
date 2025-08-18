import { AppNavbar } from '@/components/blocks/app-navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppNavbar />
      <main className="mt-[60px] overflow-auto">{children}</main>
    </div>
  );
}
