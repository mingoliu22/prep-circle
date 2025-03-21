import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import InterviewCard, { Interview } from '@/components/ui/interview/InterviewCard';
import { getInitials, formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  FileText, 
  MessageSquare,
  Download,
  Edit,
  MoreHorizontal,
  Trash,
  CheckCheck,
  XCircle,
  CalendarPlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Candidate } from '@/components/ui/candidate/CandidateCard';

const mockCandidates: { [key: string]: Candidate & { 
  phone?: string;
  location?: string;
  experience?: string;
  education?: string[];
  skills?: string[];
  notes?: string;
  documents?: { name: string; type: string; date: Date }[];
}} = {
  '1': {
    id: '1',
    name: 'Jane Smith',
    position: 'Data Engineer',
    status: 'interviewed',
    lastActivity: new Date('2023-10-10'),
    email: 'jane.smith@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    experience: '5 years',
    education: ['B.S. Computer Science, Stanford University', 'M.S. Data Science, UC Berkeley'],
    skills: ['Python', 'SQL', 'Spark', 'Hadoop', 'AWS', 'Data Modeling', 'ETL'],
    notes: 'Jane has strong technical skills and experience with big data technologies. She performed well in the technical assessment and seems to be a good cultural fit for the team.',
    documents: [
      { name: 'Resume', type: 'PDF', date: new Date('2023-09-20') },
      { name: 'Cover Letter', type: 'PDF', date: new Date('2023-09-20') },
      { name: 'Technical Assessment', type: 'ZIP', date: new Date('2023-10-02') }
    ],
    interviews: [
      { date: new Date('2023-10-02 10:00'), completed: true },
      { date: new Date('2023-10-15 14:00'), completed: false }
    ]
  }
};

const mockInterviews: { [key: string]: Interview[] } = {
  '1': [
    {
      id: '1',
      candidateId: '1',
      candidateName: 'Jane Smith',
      position: 'Data Engineer',
      date: new Date('2023-10-02 10:00'),
      duration: 60,
      status: 'completed',
      interviewers: ['David Lee', 'Amanda Chen'],
      type: 'technical',
      feedbackSubmitted: true
    },
    {
      id: '2',
      candidateId: '1',
      candidateName: 'Jane Smith',
      position: 'Data Engineer',
      date: new Date('2023-10-15 14:00'),
      duration: 60,
      status: 'scheduled',
      interviewers: ['Robert Wilson', 'Sarah Jones'],
      type: 'behavioral',
      feedbackSubmitted: false
    }
  ]
};

const mockFeedback = [
  {
    id: '1',
    interviewId: '1',
    interviewer: 'David Lee',
    role: 'Senior Data Engineer',
    date: new Date('2023-10-02'),
    overall: 'Strong',
    strengths: [
      'Excellent knowledge of SQL optimization',
      'Strong understanding of data modeling concepts',
      'Good problem-solving skills'
    ],
    weaknesses: [
      'Limited experience with real-time data processing',
      'Could improve on system design explanations'
    ],
    notes: 'Jane demonstrated strong technical skills, especially in SQL and data modeling. She was able to solve complex problems and explain her thought process clearly. Her experience with ETL pipelines is impressive.',
    recommendation: 'Proceed to next round'
  },
  {
    id: '2',
    interviewId: '1',
    interviewer: 'Amanda Chen',
    role: 'Data Engineering Manager',
    date: new Date('2023-10-02'),
    overall: 'Strong',
    strengths: [
      'Well-versed in data pipeline architectures',
      'Good communication skills',
      'Demonstrated experience with AWS data services'
    ],
    weaknesses: [
      'Less experience with Kubernetes',
      'Could elaborate more on previous project challenges'
    ],
    notes: 'Jane has a solid understanding of data engineering principles and practices. She communicated her ideas effectively and showed good technical depth. I believe she would be a good addition to the team.',
    recommendation: 'Proceed to next round'
  }
];

const CandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  
  const candidate = id ? mockCandidates[id] : null;
  const interviews = id ? mockInterviews[id] || [] : [];
  
  if (!candidate) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Candidate Not Found</h2>
          <p className="text-muted-foreground mb-6">The candidate you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/candidates">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Candidates
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const getStatusBadge = (status: Candidate['status']) => {
    const statusMap: { [key: string]: { color: string; label: string } } = {
      'new': { color: 'bg-blue-100 text-blue-600', label: 'New' },
      'interviewed': { color: 'bg-purple-100 text-purple-600', label: 'Interviewed' },
      'feedback': { color: 'bg-amber-100 text-amber-600', label: 'Feedback Pending' },
      'decision': { color: 'bg-orange-100 text-orange-600', label: 'Decision Pending' },
      'hired': { color: 'bg-green-100 text-green-600', label: 'Hired' },
      'rejected': { color: 'bg-red-100 text-red-600', label: 'Rejected' }
    };
    
    const { color, label } = statusMap[status] || { color: 'bg-gray-100 text-gray-600', label: 'Unknown' };
    
    return <Badge className={color}>{label}</Badge>;
  };
  
  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/candidates">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{candidate.name}</h1>
            {getStatusBadge(candidate.status)}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {isAdmin && (
              <Button variant="outline" asChild>
                <Link to={`/interviews/new?candidate=${candidate.id}`}>
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Link>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
                  <span>Mark as Hired</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  <span>Reject Candidate</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete Profile</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 animate-fade-in [animation-delay:100ms]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Candidate Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="" alt={candidate.name} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold text-center">{candidate.name}</h2>
                  <p className="text-muted-foreground text-center">{candidate.position}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p>{candidate.email}</p>
                    </div>
                  </div>
                  
                  {candidate.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{candidate.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {candidate.location && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p>{candidate.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {candidate.experience && (
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p>{candidate.experience}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-muted-foreground">Application Date</p>
                      <p>{formatDate(new Date('2023-09-20'))}</p>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {candidate.education && candidate.education.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Education</h3>
                    <ul className="space-y-2">
                      {candidate.education.map((edu, index) => (
                        <li key={index} className="text-sm">{edu}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {candidate.documents && candidate.documents.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="pb-2">
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(doc.date)} · {doc.type}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="lg:col-span-2 animate-fade-in [animation-delay:200ms]">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Candidate Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6">{candidate.notes || 'No summary available for this candidate.'}</p>
                    
                    <h3 className="text-lg font-medium mb-4">Interview Timeline</h3>
                    <div className="relative">
                      {interviews.map((interview, index) => (
                        <div key={interview.id} className="mb-6 relative pl-8">
                          <div className="absolute left-0 top-0">
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            </div>
                            {index < interviews.length - 1 && (
                              <div className="absolute top-5 left-2.5 w-0.5 h-full -ml-px bg-border"></div>
                            )}
                          </div>
                          
                          <div className="glass-card p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{interview.type.replace('-', ' ')} Interview</h4>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(interview.date)} · {interview.interviewers.join(', ')}
                                </p>
                              </div>
                              <Badge 
                                className={interview.status === 'completed' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-blue-100 text-blue-600'}
                              >
                                {interview.status}
                              </Badge>
                            </div>
                            
                            {interview.status === 'completed' && (
                              <div className="flex justify-end mt-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/interviews/${interview.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="interviews" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Interview Schedule</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/interviews/new?candidate=${candidate.id}`}>
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Schedule
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {interviews.length > 0 ? (
                        interviews.map(interview => (
                          <InterviewCard key={interview.id} interview={interview} />
                        ))
                      ) : (
                        <p className="text-center py-6 text-muted-foreground">
                          No interviews scheduled yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="feedback" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Interview Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mockFeedback.length > 0 ? (
                      <div className="space-y-6">
                        {mockFeedback.map(feedback => (
                          <div key={feedback.id} className="glass-card p-5 rounded-xl">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-medium">{feedback.interviewer}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {feedback.role} · {formatDate(feedback.date)}
                                </p>
                              </div>
                              <Badge 
                                className={
                                  feedback.recommendation === 'Proceed to next round'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-amber-100 text-amber-600'
                                }
                              >
                                {feedback.overall}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">Strengths</h5>
                                <ul className="text-sm space-y-1">
                                  {feedback.strengths.map((strength, i) => (
                                    <li key={i} className="flex items-center">
                                      <span className="text-green-500 mr-2">+</span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h5 className="text-sm font-medium mb-2">Areas for Improvement</h5>
                                <ul className="text-sm space-y-1">
                                  {feedback.weaknesses.map((weakness, i) => (
                                    <li key={i} className="flex items-center">
                                      <span className="text-amber-500 mr-2">△</span>
                                      {weakness}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <h5 className="text-sm font-medium mb-2">Notes</h5>
                              <p className="text-sm">{feedback.notes}</p>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-sm font-medium">Recommendation</h5>
                                <p className="text-sm font-medium text-green-600">
                                  {feedback.recommendation}
                                </p>
                              </div>
                              
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/feedback/${feedback.id}`}>
                                  View Full Feedback
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-6 text-muted-foreground">
                        No feedback has been submitted yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Notes & Observations</CardTitle>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Add Note
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="glass-card p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>DL</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-medium">David Lee</h4>
                              <p className="text-xs text-muted-foreground">Oct 5, 2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm">
                          Jane impressed me during our initial call. She has a strong background in data engineering
                          and seems very enthusiastic about our company's mission. Her experience with AWS data
                          services aligns well with our tech stack.
                        </p>
                      </div>
                      
                      <div className="glass-card p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>AC</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-medium">Amanda Chen</h4>
                              <p className="text-xs text-muted-foreground">Sep 25, 2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm">
                          Initial resume review showed strong qualifications. Jane has the technical skills we're
                          looking for and has worked on similar projects in her previous role at XYZ Corp.
                          Recommending to proceed with the first round of interviews.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CandidateProfile;
