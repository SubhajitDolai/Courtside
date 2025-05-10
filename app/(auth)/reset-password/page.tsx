// app/(auth)/reset-password/page.tsx
export const dynamic = 'force-dynamic';

import ClientResetPassword from './ClientResetPassword';

export default function ResetPasswordPage() {
  return <ClientResetPassword />;
}
