import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import React from 'react';


const ClientDashboardLayout = ({ children }) => {
    return (
        <DashboardSidebar>
             {children}
          </DashboardSidebar>
    );
};

export default ClientDashboardLayout;