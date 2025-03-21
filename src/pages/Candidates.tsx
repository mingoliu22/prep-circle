
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CandidateCard, { Candidate } from '@/components/ui/candidate/CandidateCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from 'lucide-react';

// Mock candidates data
const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Jane Smith',
    position: 'Data Engineer',
    status: 'interviewed',
    lastActivity: new Date('2023-10-10'),
    email: 'jane.smith@example.com',
    interviews: [
      { date: new Date('2023-10-15 14:00'), completed: false }
    ]
  },
  {
    id: '2',
    name: 'Michael Johnson',
    position: 'UX Designer',
    status: 'feedback',
    lastActivity: new Date('2023-10-08'),
    email: 'michael.johnson@example.com',
    interviews: [
      { date: new Date('2023-10-05 10:00'), completed: true },
      { date: new Date('2023-10-20 11:00'), completed: false }
    ]
  },
  {
    id: '3',
    name: 'Sarah Williams',
    position: 'Product Manager',
    status: 'decision',
    lastActivity: new Date('2023-10-07'),
    email: 'sarah.williams@example.com'
  },
  {
    id: '4',
    name: 'Alex Brown',
    position: 'Frontend Developer',
    status: 'new',
    lastActivity: new Date('2023-10-11'),
    email: 'alex.brown@example.com'
  },
  {
    id: '5',
    name: 'David Lee',
    position: 'Software Engineer',
    status: 'hired',
    lastActivity: new Date('2023-09-30'),
    email: 'david.lee@example.com'
  },
  {
    id: '6',
    name: 'Emily Chen',
    position: 'Data Scientist',
    status: 'rejected',
    lastActivity: new Date('2023-09-25'),
    email: 'emily.chen@example.com'
  },
  {
    id: '7',
    name: 'Robert Wilson',
    position: 'DevOps Engineer',
    status: 'new',
    lastActivity: new Date('2023-10-12'),
    email: 'robert.wilson@example.com'
  },
  {
    id: '8',
    name: 'Amanda Taylor',
    position: 'QA Engineer',
    status: 'interviewed',
    lastActivity: new Date('2023-10-05'),
    email: 'amanda.taylor@example.com'
  }
];

const Candidates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  
  // Get unique positions for the filter
  const uniquePositions = Array.from(new Set(mockCandidates.map(c => c.position)));
  
  // Filter and sort candidates
  const filteredCandidates = mockCandidates
    .filter(candidate => {
      // Search filter
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase());
        
      // Status filter
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
      
      // Position filter
      const matchesPosition = positionFilter === 'all' || candidate.position === positionFilter;
      
      return matchesSearch && matchesStatus && matchesPosition;
    })
    .sort((a, b) => {
      // Sort
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'position':
          return a.position.localeCompare(b.position);
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    });
  
  return (
    <MainLayout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Candidates</h1>
            <p className="text-muted-foreground">Manage and track all your candidates</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link to="/candidates/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 animate-fade-in [animation-delay:100ms]">
          <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex-1 sm:w-40">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="feedback">Feedback Pending</SelectItem>
                    <SelectItem value="decision">Decision Pending</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 sm:w-40">
                <Select 
                  value={positionFilter} 
                  onValueChange={setPositionFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {uniquePositions.map(position => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 sm:w-40">
                <Select 
                  value={sortBy} 
                  onValueChange={setSortBy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="position">Position</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Candidates List */}
        {filteredCandidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in [animation-delay:200ms]">
            {filteredCandidates.map((candidate, index) => (
              <CandidateCard 
                key={candidate.id} 
                candidate={candidate} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in [animation-delay:200ms]">
            <div className="flex flex-col items-center">
              <Filter className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No candidates found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Try changing your search criteria or add a new candidate
              </p>
              <Button asChild>
                <Link to="/candidates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Candidate
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Candidates;
