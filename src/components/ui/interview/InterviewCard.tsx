
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  ChevronRight,
  MessageSquare,
  FileText
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  position: string;
  date: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  interviewers: string[];
  type: 'technical' | 'behavioral' | 'cultural-fit' | 'initial';
  feedbackSubmitted: boolean;
  notes?: string; // Added notes field
}

interface InterviewCardProps {
  interview: Interview;
  showNotesPreview?: boolean;
}

const getStatusColor = (status: Interview['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
    case 'completed': return 'bg-green-100 text-green-600 hover:bg-green-200';
    case 'cancelled': return 'bg-red-100 text-red-600 hover:bg-red-200';
    case 'in-progress': return 'bg-amber-100 text-amber-600 hover:bg-amber-200';
    default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
};

const getTypeColor = (type: Interview['type']) => {
  switch (type) {
    case 'technical': return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
    case 'behavioral': return 'bg-teal-100 text-teal-600 hover:bg-teal-200';
    case 'cultural-fit': return 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200';
    case 'initial': return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
};

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, showNotesPreview = false }) => {
  const isUpcoming = new Date(interview.date) > new Date();
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{interview.candidateName}</h3>
            <p className="text-sm text-muted-foreground">{interview.position}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getTypeColor(interview.type)}>
              {interview.type.replace('-', ' ')}
            </Badge>
            <Badge className={getStatusColor(interview.status)}>
              {interview.status}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formatDate(interview.date)}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{formatTime(interview.date)} ({interview.duration} min)</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <UserCheck className="mr-2 h-4 w-4" />
            <span>{interview.interviewers.join(', ')}</span>
          </div>
          
          {!isUpcoming && (
            <div className="flex items-center text-sm mt-2">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span className={interview.feedbackSubmitted ? 'text-green-600' : 'text-amber-600'}>
                {interview.feedbackSubmitted ? 'Feedback submitted' : 'Feedback pending'}
              </span>
            </div>
          )}
          
          {/* Display notes if available and showNotesPreview is true */}
          {interview.notes && showNotesPreview && (
            <div className="mt-3 pt-3 border-t border-dashed border-muted">
              <div className="flex items-start">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{interview.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 px-6 py-3">
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <Link to={`/interviews/${interview.id}`}>
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
