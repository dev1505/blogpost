import { CommonApiCall, fastapi_backend_url } from '@/commonFunctions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost, useBlog } from '@/contexts/BlogContext';
import { toast } from '@/hooks/use-toast';
import { formatTime } from '@/pages/PostDetail';
import { BadgeX, Clock, FilePenLine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogCardProps {
  post: BlogPost;
  user_cost?: boolean;
}

export const BlogCard = ({ post, user_cost = false }: BlogCardProps) => {

  const { setPosts } = useBlog();
  const { user } = useAuth();

  const formattedDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleBlogDelete = async () => {
    const response = await CommonApiCall({ url: `${fastapi_backend_url}/delete/blog/${post?.id}`, type: "get" })
    if (response?.success) {
      setPosts((prev) => prev.filter((blog) => blog?.id !== post?.id))
      toast({ title: "Blog Deleted Successfully", toastType: "success" })
    }
    else {
      toast({ title: "Blog not Deleted", toastType: "error" })
    }
  }

  return (
    <Card className="transition-all hover:shadow-lg hover:border-primary/50">
      <Link to={`/blog/${post?.id}`}>
        <>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-2">
              {post.hashtags.split(",").map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-2xl line-clamp-2">{post.title}</CardTitle>
            <CardDescription className="line-clamp-2">{post.content.slice(0, 40)}...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {post.user.username.charAt(0).toUpperCase()}
                </div>
                <span>{post.user.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{formattedDate(post?.post_date)}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(post.post_time)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </>
      </Link >
      {user?.email && post?.user?.username === user?.username && <div className='flex flex-row justify-between items-center p-6 pt-0'>
        <div className='flex flex-row gap-2'>
          <Link to={`/edit/blog/${post?.id}`}>
            <div title='Edit Blog' className='hover:bg-purple-300 p-1 hover:rounded'>
              <FilePenLine />
            </div>
          </Link>
          <div title='Delete Blog' className='hover:bg-purple-300 p-1 hover:rounded'>
            <BadgeX className='cursor-pointer' onClick={handleBlogDelete} />
          </div>
        </div>
        {
          post?.generated_by_ai && user_cost ?
            <div className='flex flex-row bg-purple-200 p-2 rounded'>
              <Sparkles /> <span className='font-bold pl-2'> ${post?.user_cost && post?.user_cost?.toFixed(5)}</span>
            </div>
            :
            ""
        }
      </div>}
    </Card >
  );
};
