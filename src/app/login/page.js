import { redirect } from 'next/navigation';

export default function LegacyLoginPage() {
  // If anything in the app still points to /login, immediately send them to the new homepage landing where the AuthDrawer lives.
  redirect('/');
}
