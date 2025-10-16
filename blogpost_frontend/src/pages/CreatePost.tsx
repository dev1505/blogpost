import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BlogPost, useBlog } from '@/contexts/BlogContext';
import { useToast } from '@/hooks/use-toast';
import MDEditor from '@uiw/react-md-editor';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from './NotFound';
import { useAuth } from '@/contexts/AuthContext';

const CreatePost = () => {
  const { addBlog, getBlogById, editBlog, generateBlog } = useBlog();
  const { user, me } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const [post, setPost] = useState<BlogPost>()

  useEffect(() => {
    if (id) {
      (async () => {
        const response = await getBlogById(id || '')
        setPost(response);
      })()
    }
    else {
      (async () => {
        const response = await me()
        setPost({ ...post, user: response })
      })()
    }
  }, [])

  if (id && !post) {
    return (<NotFound />)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const hashtags = formData.get('hashtags') as string
    const content = post.content
    const excerpt = post.content.substring(0, 150).replace(/[#*`]/g, '') + '...';

    if (!id) {
      (async () => {
        const response = await addBlog({
          title,
          content,
          excerpt,
          user: {
            username: post.user.username,
            email: post.user.email,
          },
          hashtags,
        })
        if (response) {
          toast({
            toastType: "success",
            title: 'Post published!',
            description: 'Your blog post has been published successfully.',
          });
          navigate('/');
          setIsSubmitting(false);
        }
        else {
          toast({
            toastType: "error",
            title: 'Some error occured !',
            description: 'There was some error while publishing your post',
          });
          setIsSubmitting(false);
        }
      }
      )()
    }
    else {
      (async () => {
        const response = await editBlog({
          title,
          content,
          excerpt,
          id,
          user: {
            username: post.user.username,
            email: post.user.email,
          },
          hashtags,
        })
        if (response) {
          toast({
            toastType: "success",
            title: 'Post edited!',
            description: 'Your blog post has been edited successfully.',
          });
          navigate('/');
          setIsSubmitting(false);
        }
        else {
          toast({
            toastType: "error",
            title: 'Some error occured !',
            description: 'There was some error while editing your post',
          });
          setIsSubmitting(false);
        }
      })()
    }
  };

  const handleGenerateContent = () => {
    const title = document.getElementById("title").value;
    const hashtags = document.getElementById("hashtags").value;
    if (!title) {
      toast({
        title: 'Add Field',
        description: 'Please add Title and Tags to generate content relative to the topic',
        toastType: 'warning',
      });
    }
    else if (!hashtags) {
      toast({
        title: 'Add Field',
        description: 'Please add Tags to generate content relative to the topic',
        toastType: 'warning',
      });
    }
    else {
      (async () => {
        const response = await generateBlog({ title: title, hashtags: hashtags, user: post.user })
        setPost({ ...response })
      })()
    }
  }

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
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 bg-blue-200"
            onClick={() => handleGenerateContent()}
          >
            <Sparkles />
            Generate From AI
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} id='createPostForm' className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter your post title..."
                  required
                  className="text-lg"
                  value={post?.title}
                  onChange={(e) => { setPost({ ...post, title: e.target.value }) }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                <Input
                  id="hashtags"
                  name="hashtags"
                  placeholder="React, JavaScript, Web Development"
                  value={post?.hashtags}
                  onChange={(e) => { setPost({ ...post, hashtags: e.target.value }) }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <div data-color-mode="auto">
                  <MDEditor
                    value={post?.content}
                    onChange={(val) => setPost({ ...post, content: val || '' })}
                    height={500}
                    preview="edit"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit"
                  disabled={isSubmitting}
                  className="flex-1">
                  {isSubmitting ? 'Publishing...' : id ? 'Edit Post' : 'Publish Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
