import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatCard from '@/components/ui/statistics/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-sonner';
import { 
  CalendarCheck2, Users, FileText, Award,
  Clock, CheckCircle2, AlertCircle, BarChart4,
  LogOut
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'interview' | 'feedback' | 'assessment';
  title: string;
  time: string;
  status: 'completed' | 'positive' | 'upcoming';
}

interface Interview {
  id: string;
  title: string;
  company?: string;
  position: string;
  date: string;
  type: string;
  interviewer?: string;
}

const statistics = [
  {
    id: '1',
    title: 'Completed Interviews',
    value: 12,
    icon: <CheckCircle2 size={20} />,
    trend: {
      value: 20,
      isPositive: true
    }
  },
  {
    id: '2',
    title: 'Average Score',
    value: '8.4/10',
    icon: <BarChart4 size={20} />,
    trend: {
      value: 5,
      isPositive: true
    }
  },
  {
    id: '3',
    title: 'Upcoming Interviews',
    value: 3,
    icon: <Clock size={20} />,
  },
  {
    id: '4',
    title: 'Interview Feedback',
    value: 8,
    icon: <FileText size={20} />,
    trend: {
      value: 10,
      isPositive: true
    }
  }
];

const Dashboard = () => {
  const { user, profile, isAdmin, isCandidate, logout } = useAuth();
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = displayName.split(' ')[0];
  
  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const { data: interviews, error: interviewsError } = await supabase
          .from('interviews')
          .select('id, title, description, created_at, status')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (interviewsError) {
          throw interviewsError;
        }
        
        if (interviews) {
          const formattedInterviews = interviews.map(interview => ({
            id: interview.id,
            title: interview.title,
            position: interview.description || 'Not specified',
            date: interview.created_at, // Using created_at instead of date
            type: 'Standard', // Adding a default type
            interviewer: 'Assigned Interviewer'
          }));
          
          setUpcomingInterviews(formattedInterviews);
          
          const activities = interviews.map((interview, index) => ({
            id: interview.id,
            type: 'interview' as const,
            title: `${'Standard'} Interview ${interview.status === 'completed' ? 'Completed' : 'Scheduled'}`,
            time: new Date(interview.created_at) > new Date() 
              ? `Upcoming on ${new Date(interview.created_at).toLocaleDateString()}`
              : `${index} days ago`,
            status: interview.status === 'completed' 
              ? 'completed' as const 
              : 'upcoming' as const
          }));
          
          setRecentActivity(activities);
        }
      } catch (error) {
        console.error('Error fetching interview data:', error);
        toast.error('Failed to load interview data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterviewData();
  }, [user]);
  
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'interview': return <CalendarCheck2 className="h-4 w-4" />;
      case 'feedback': return <FileText className="h-4 w-4" />;
      case 'assessment': return <Award className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleScheduleInterview = () => {
    navigate('/interviews/new');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // For debugging
  console.log("User role:", profile?.role);
  console.log("Is admin:", isAdmin);
  
  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="space-y-6">
        <div className="glass-card mb-8 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between animate-blur-in">
          <div className="flex items-center mb-4 sm:mb-0">
            <Avatar className="h-12 w-12 mr-4 border-2 border-white shadow-sm">
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
              <p className="text-muted-foreground">Here's an overview of your interview activities</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {isAdmin && (
              <Button className="w-full sm:w-auto" onClick={handleScheduleInterview}>
                Schedule Interview
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full sm:w-auto" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statistics.map(stat => (
            <StatCard 
              key={stat.id}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Loading recent activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                      ${activity.status === 'completed' ? 'bg-green-100 text-green-600' : 
                        activity.status === 'positive' ? 'bg-blue-100 text-blue-600' : 
                        'bg-amber-100 text-amber-600'}`}>
                      {getActionIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{activity.title}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.status === 'completed' ? 'Completed' : 
                          activity.status === 'positive' ? 'Positive feedback' : 
                          'Upcoming'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
          
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Upcoming Interviews</h2>
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Loading upcoming interviews...</p>
              </div>
            ) : upcomingInterviews.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingInterviews.map(interview => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">{interview.title}</TableCell>
                      <TableCell>{interview.position}</TableCell>
                      <TableCell>{new Date(interview.date).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</TableCell>
                      <TableCell>{interview.type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No upcoming interviews</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
