import { ServiceWorkerRegister } from './ServiceWorkerRegister';
import AdminShell from './AdminShell';

export const metadata = {
  title: 'Admin — 6ixstars',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <>
      <ServiceWorkerRegister />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
