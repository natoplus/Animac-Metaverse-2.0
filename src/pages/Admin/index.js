import { useAdmin } from '../../hooks/useAdmin';
import AdminDashboard from './Dashboard';

export default function AdminPage() {
  const { isAdmin, loading } = useAdmin();

  if (loading) return <p>Loading...</p>;
  if (!isAdmin) return <p>Access Denied. You are not authorized.</p>;

  return <AdminDashboard />;
}
