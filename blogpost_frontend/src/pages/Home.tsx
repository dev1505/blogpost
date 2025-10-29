import { Navbar } from '@/components/Navbar';
import { BlogCard } from '@/components/BlogCard';
import { getAllBlogs, useBlog } from '@/contexts/BlogContext';
import { useEffect } from 'react';

const Home = () => {
  const { posts, setPosts } = useBlog();

  useEffect(() => {
    (async () => {
      setPosts(await getAllBlogs())
    })()
  }, [])


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
    <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover Stories & Ideas
          </h1>
          <p className="text-xl text-muted-foreground">
            A place to read, write, and connect with great minds
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {(posts && posts?.length) ? posts.map((post, index) => (
            <BlogCard key={index} post={post} />
          )) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to write!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
