import { isAdmin } from '@/lib/adminAuth';
import Dashboard from './staff-dashboard';
export const dynamic = 'force-dynamic';
export default async function AdminPage() { return <Dashboard initialAuthenticated={await isAdmin()} />; }
