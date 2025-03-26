
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Users, ChevronDown, Home, Settings, Calendar, User2, 
  Menu, X, LogOut, HelpCircle, FileText, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/auth"; 

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); 
  const { logout, isAdmin, isCandidate } = useAuth();
  const [open, setOpen] = React.useState(false);

  const adminLinks = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "Candidates", href: "/candidates", icon: Users },
    { title: "Question Bank", href: "/question-bank", icon: FileText },
    { title: "Settings", href: "/settings", icon: Settings },
  ];

  const candidateLinks = [
    { title: "Dashboard", href: "/dashboard", icon: Home },
    { title: "My Interviews", href: "/my-interviews", icon: Calendar },
    { title: "Profile", href: "/settings", icon: User2 },
  ];

  const links = isAdmin ? adminLinks : isCandidate ? candidateLinks : [];

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleScheduleInterview = () => {
    navigate('/interviews/new');
    setOpen(false);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          {isAdmin ? "Admin Dashboard" : "Candidate Portal"}
        </h2>
        
        {isAdmin && (
          <div className="mb-4 px-4">
            <Button 
              className="w-full justify-start" 
              onClick={handleScheduleInterview}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        )}
        
        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Button
                key={link.href}
                variant={isActive(link.href) ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setOpen(false)}
                asChild
              >
                <Link to={link.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {link.title}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
      <Separator />
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Help & Support
        </h2>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="#" target="_blank" rel="noreferrer">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help Center
            </a>
          </Button>
        </div>
      </div>
      <div className="mt-auto px-3 py-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={async () => {
            setOpen(false);
            try {
              await logout();
              // Navigation is handled in the AuthProvider
            } catch (error) {
              console.error("Sidebar logout error:", error);
            }
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow bg-background pt-5 border-r">
        <SidebarContent />
      </div>
    </div>
  );
}
