import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import React from 'react';

const FreelancerDashboardLayout = ({ children }) => {
    return (
        <DashboardSidebar>
            {children}

        </DashboardSidebar>
    );
};

export default FreelancerDashboardLayout;
