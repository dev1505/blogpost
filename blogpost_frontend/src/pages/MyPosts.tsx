import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog } from '@/contexts/BlogContext';
import { Navbar } from '@/components/Navbar';
import { BlogCard } from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { PenSquare } from 'lucide-react';

const MyPosts = () => {
  const { user } = useAuth();
  const { getPostsByAuthor } = useBlog();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const myPosts = getPostsByAuthor(user.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Posts</h1>
              <p className="text-muted-foreground">
                {myPosts.length} {myPosts.length === 1 ? 'post' : 'posts'} published
              </p>
            </div>
            <Button onClick={() => navigate('/create')}>
              <PenSquare className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>

        {myPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {myPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">No posts yet</h2>
            <p className="text-muted-foreground mb-6">
              Start sharing your thoughts and ideas with the world!
            </p>
            <Button onClick={() => navigate('/create')} size="lg">
              <PenSquare className="mr-2 h-4 w-4" />
              Write your first post
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPosts;
