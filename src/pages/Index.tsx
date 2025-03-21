
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { 
  BriefcaseBusiness, 
  BrainCircuit, 
  LineChart, 
  Clock, 
  CheckCheck,
  ChevronRight 
} from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <span className="inline-block px-3 py-1 mb-2 text-sm font-medium rounded-full bg-primary/10 text-primary">
              AI-Powered Interview Assistant
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl animate-fade-in">
              Transform Your Interview Process with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Streamline candidate evaluation, generate objective feedback, and make data-driven hiring decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" className="button-hover-effect" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="button-hover-effect" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              Our platform combines advanced AI with intuitive design to transform your interview process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-6 flex flex-col items-center text-center animate-blur-in [animation-delay:100ms]">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interview Analysis</h3>
              <p className="text-muted-foreground">
                Automatically transcribe and analyze interviews to extract key insights and create comprehensive summaries.
              </p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center animate-blur-in [animation-delay:200ms]">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <BriefcaseBusiness size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Candidate Management</h3>
              <p className="text-muted-foreground">
                Organized interface to track candidates, their interview history, documents, and progress all in one place.
              </p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center animate-blur-in [animation-delay:300ms]">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <LineChart size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Feedback</h3>
              <p className="text-muted-foreground">
                Generate structured feedback based on interview transcripts that evaluates candidate responses objectively.
              </p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center animate-blur-in [animation-delay:400ms]">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Time-Saving Workflows</h3>
              <p className="text-muted-foreground">
                Automate administrative tasks and workflows to focus on what matters most: finding the right candidates.
              </p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center animate-blur-in [animation-delay:500ms]">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <CheckCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Decision Assistance</h3>
              <p className="text-muted-foreground">
                Data-driven insights and recommendations to help you make more informed hiring decisions.
              </p>
            </div>
            
            <div className="glass-card p-6 flex flex-col items-center text-center animate-blur-in [animation-delay:600ms]">
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <CheckCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Industry-standard security and privacy features to protect sensitive candidate information.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="glass-card p-8 sm:p-12 flex flex-col items-center text-center rounded-xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Transform Your Interview Process?</h2>
            <p className="text-muted-foreground max-w-2xl mb-8">
              Join thousands of companies that are already saving time and making better hiring decisions with AI Interview Buddy.
            </p>
            <Button size="lg" className="button-hover-effect" asChild>
              <Link to="/register">
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
