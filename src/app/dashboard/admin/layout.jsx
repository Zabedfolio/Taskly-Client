import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import React from 'react';

const AdminDashboardLayout = ({ children }) => {
    return   (

        <DashboardSidebar>
            {children}
        </DashboardSidebar>
    );
};

export default AdminDashboardLayout;
