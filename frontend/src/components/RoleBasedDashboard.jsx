import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import ProjectManagerDashboard from '../pages/ProjectManagerDashboard';
import TeamMemberDashboard from '../pages/TeamMemberDashboard';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  // Show different dashboard based on user role
  if (user?.role === 'ProjectManager' || user?.role === 'Project Manager') {
    return <ProjectManagerDashboard />;
  }

  if (user?.role === 'TeamMember' || user?.role === 'Team Member') {
    return <TeamMemberDashboard />;
  }

  // Default: Admin Dashboard
  return <Dashboard />;
};

export default RoleBasedDashboard;
