import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BlogProvider } from "./contexts/BlogContext";
import Auth from "./pages/Auth";
import CreatePost from "./pages/CreatePost";
import Home from "./pages/Home";
import MyPosts from "./pages/MyPosts";
import NotFound from "./pages/NotFound";
import PostDetail from "./pages/PostDetail";
import UserBlogs from "./pages/UserBlogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BlogProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/edit/blog/:id" element={<CreatePost />} />
              <Route path="/blog/:id" element={<PostDetail />} />
              <Route path="/my-blogs" element={<MyPosts />} />
              <Route path="/user/blogs/:username" element={<UserBlogs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </BlogProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
