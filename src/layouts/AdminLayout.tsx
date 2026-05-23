import AdminSidebar from '../components/AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="min-h-screen w-full bg-primary-dark flex">
            <AdminSidebar />
            <main className="flex-1 md:mr-80 min-h-screen w-full p-6">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;