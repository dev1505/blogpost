import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogPost, useBlog } from '@/contexts/BlogContext';
import MDEditor from '@uiw/react-md-editor';
import 'highlight.js/styles/github-dark.css';
import { ArrowLeft, Clock, FilePenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function formatTime(time: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  let h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}


const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBlogById } = useBlog();
  const [post, setPost] = useState<BlogPost>()

  useEffect(() => {
    if (id) {
      (async () => {
        const response = await getBlogById(id)
        setPost(response)
      })()
    }
  }, [])


  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post?.post_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className='flex justify-between'>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {post?.user && <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/edit/blog/${id}`)}
            className="mb-6 bg-blue-300"
          >
            <FilePenLine />
            Edit
          </Button>}
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">
                {post?.hashtags}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {post?.title}
            </h1>

            <div className="flex items-center gap-4 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {post?.user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{post?.user?.username}</p>
                  <p className="text-sm">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(post?.post_time)}</span>
              </div>
            </div>
          </div>
          <div className="prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted prose-li:text-foreground prose-a:text-primary hover:prose-a:text-primary/80">
            <MDEditor.Markdown source={post?.content} />
          </div>
        </article>
      </main>
    </div>
  );
};

export default PostDetail;
