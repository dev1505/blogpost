import { frontend_url } from '@/commonFunctions';
import { BlogCard } from '@/components/BlogCard';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost, useBlog } from '@/contexts/BlogContext';
import { PenSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyPosts = () => {
  const { user } = useAuth();
  const { getBlogsByUser } = useBlog();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const blogs = await getBlogsByUser();
      setMyPosts(blogs);
      setIsLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        {user && <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className='flex flex-col gap-2'>
              <h1 className="text-4xl font-bold mt-2">My Blogs</h1>
              <p className="text-muted-foreground">
                {myPosts?.length} {myPosts.length === 1 ? 'blog' : 'blogs'} published
              </p>
              <div className='font-bold'>
                Share Your Blogs : <span
                  onClick={() => {
                    window.open(`${frontend_url}/user/blogs/${user?.username}`, "_blank")
                  }}
                  className='cursor-pointer italic hover:text-blue-600'
                >{frontend_url}/user/blogs/{user?.username}</span>
              </div>
              <div className=''>
                <span className='text-2xl font-bold bg-purple-200 p-2 rounded'>Cost : ${user?.user_cost && user?.user_cost?.toFixed(5)}</span>
              </div>
            </div>
            <Button onClick={() => navigate('/create')}>
              <PenSquare className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          </div>
        </div>
        }

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : myPosts?.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {myPosts.map((post) => (
              <div key={post.id} className="animate-fade-in">
                <BlogCard post={post} user_cost={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 max-w-md mx-auto animate-fade-in">
            <h2 className="text-2xl font-semibold mb-4">No blogs yet</h2>
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
