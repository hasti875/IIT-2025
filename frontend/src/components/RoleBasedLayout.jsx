import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import ProjectManagerLayout from './ProjectManagerLayout';
import TeamMemberLayout from './TeamMemberLayout';

const RoleBasedLayout = ({ children }) => {
  const { user } = useAuth();

  // Use TeamMemberLayout for Team Member role
  if (user?.role === 'TeamMember') {
    return <TeamMemberLayout>{children}</TeamMemberLayout>;
  }

  // Use ProjectManagerLayout for Project Manager role
  if (user?.role === 'ProjectManager' || user?.role === 'Project Manager') {
    return <ProjectManagerLayout>{children}</ProjectManagerLayout>;
  }

  // Default: Admin Layout
  return <Layout>{children}</Layout>;
};

export default RoleBasedLayout;
