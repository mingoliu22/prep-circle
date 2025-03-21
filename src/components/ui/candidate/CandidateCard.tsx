
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, MessageSquare } from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';

export interface Candidate {
  id: string;
  name: string;
  position: string;
  status: 'new' | 'interviewed' | 'feedback' | 'decision' | 'hired' | 'rejected';
  lastActivity: Date;
  avatarUrl?: string;
  email: string;
  interviews?: {
    date: Date;
    completed: boolean;
  }[];
}

interface CandidateCardProps {
  candidate: Candidate;
}

const getStatusColor = (status: Candidate['status']) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
    case 'interviewed': return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
    case 'feedback': return 'bg-amber-100 text-amber-600 hover:bg-amber-200';
    case 'decision': return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
    case 'hired': return 'bg-green-100 text-green-600 hover:bg-green-200';
    case 'rejected': return 'bg-red-100 text-red-600 hover:bg-red-200';
    default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  }
};

const getStatusText = (status: Candidate['status']) => {
  switch (status) {
    case 'new': return 'New';
    case 'interviewed': return 'Interviewed';
    case 'feedback': return 'Feedback Pending';
    case 'decision': return 'Decision Pending';
    case 'hired': return 'Hired';
    case 'rejected': return 'Rejected';
    default: return 'Unknown';
  }
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const nextInterview = candidate.interviews?.find(i => !i.completed);
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{candidate.name}</h3>
              <p className="text-sm text-muted-foreground">{candidate.position}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(candidate.status)}`}>
            {getStatusText(candidate.status)}
          </Badge>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Last activity: {formatDate(candidate.lastActivity)}</span>
          </div>
          
          {nextInterview && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Next interview: {formatDate(nextInterview.date)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/30 px-6 py-3">
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
          <Link to={`/candidates/${candidate.id}`}>
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
