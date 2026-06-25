import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import React from 'react';

const AdminDashboardLayout = ({ children }) => {
    return (
        <div className="flex">
            <DashboardSidebar />

            <main className="flex-1 p-6 pt-25">
                {children}
            </main>
        </div>
    );
};

export default AdminDashboardLayout;
