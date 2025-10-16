import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PenSquare, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const Navbar = () => {

  const { user, me, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast()

  useEffect(() => {
    (async () => {
      await me()
    })()
  }, [])

  const handleLogout = async () => {
    const response = await logout();
    if (response) {
      navigate("/auth")
      toast({
        toastType: "success",
        description: "User Logged out successfully",
      })
    }
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            BlogSpace
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/create">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Write
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/my-blogs')}>
                      My Blogs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
