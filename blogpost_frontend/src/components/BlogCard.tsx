import { Link } from 'react-router-dom';
import { BlogPost } from '@/contexts/BlogContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatTime } from '@/pages/PostDetail';

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {

  const formattedDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link to={`/blog/${post?.id}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
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
      </Card>
    </Link>
  );
};
