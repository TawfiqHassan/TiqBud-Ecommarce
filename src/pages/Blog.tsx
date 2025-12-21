import { useState } from 'react';
import { Calendar, Clock, User, Star, MessageCircle, ThumbsUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

// Sample blog posts
const blogPosts = [
  {
    id: '1',
    title: 'Top 10 Mechanical Keyboards for Gaming in 2024',
    excerpt: 'A comprehensive guide to the best mechanical keyboards that will elevate your gaming experience. From Cherry MX switches to custom builds...',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
    author: 'Rafiq Ahmed',
    date: '2024-12-15',
    readTime: '8 min read',
    category: 'Guides',
    likes: 234,
    comments: 45
  },
  {
    id: '2',
    title: 'How to Choose the Perfect Gaming Mouse',
    excerpt: 'DPI, polling rate, sensor type - understanding all the specs can be overwhelming. This guide breaks down everything you need to know...',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop',
    author: 'Nadia Rahman',
    date: '2024-12-10',
    readTime: '6 min read',
    category: 'Guides',
    likes: 189,
    comments: 32
  },
  {
    id: '3',
    title: 'True Wireless Earbuds: Budget vs Premium Comparison',
    excerpt: 'Are expensive earbuds worth it? We compare ৳2,000 earbuds with ৳15,000 options to find out...',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=400&fit=crop',
    author: 'Kamal Hossain',
    date: '2024-12-05',
    readTime: '10 min read',
    category: 'Comparison',
    likes: 312,
    comments: 67
  },
];

// Sample product reviews
const reviews = [
  {
    id: 'r1',
    productName: 'TiqBud Pro Mechanical Keyboard',
    rating: 5,
    title: 'Best keyboard I have ever used!',
    content: 'The build quality is exceptional. Cherry MX switches feel amazing and the RGB lighting is stunning. Highly recommend for both gaming and typing.',
    author: 'Abdullah Islam',
    date: '2024-12-18',
    verified: true,
    helpful: 45
  },
  {
    id: 'r2',
    productName: 'Precision Gaming Mouse X1',
    rating: 4,
    title: 'Great mouse, minor software issues',
    content: 'The sensor is incredibly accurate and the shape is comfortable. Only issue is the software can be buggy sometimes. Otherwise, excellent value.',
    author: 'Fatima Begum',
    date: '2024-12-16',
    verified: true,
    helpful: 32
  },
  {
    id: 'r3',
    productName: 'UltraSound Pro Headset',
    rating: 5,
    title: 'Cinema-quality audio',
    content: 'The 7.1 surround sound is mind-blowing. I can hear footsteps in games I never noticed before. The comfort is also perfect for long sessions.',
    author: 'Imran Khan',
    date: '2024-12-14',
    verified: true,
    helpful: 67
  },
  {
    id: 'r4',
    productName: '65W GaN Fast Charger',
    rating: 5,
    title: 'So compact, so powerful',
    content: 'Charges my laptop, phone, and tablet simultaneously. The size is unbelievable for 65W output. Essential for travel.',
    author: 'Rashida Ahmed',
    date: '2024-12-12',
    verified: true,
    helpful: 89
  },
];

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < rating
          ? 'fill-brand-gold text-brand-gold'
          : 'text-muted-foreground'
      }`}
    />
  ));
};

const BlogContent = () => {
  const [activeTab, setActiveTab] = useState('blog');

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      {/* Page Header */}
      <div className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">Blog & Reviews</h1>
          <p className="text-muted-foreground text-lg">
            Tech guides, product comparisons, and customer reviews
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="blog" className="px-6">Blog Posts</TabsTrigger>
            <TabsTrigger value="reviews" className="px-6">Product Reviews</TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Post */}
              <Card className="lg:col-span-2 bg-card border-border overflow-hidden group">
                <div className="relative h-64 lg:h-80 overflow-hidden">
                  <img
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-brand-gold text-brand-dark">{blogPosts[0].category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-brand-gold transition-colors">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-4">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {blogPosts[0].author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(blogPosts[0].date).toLocaleDateString('en-BD')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {blogPosts[0].readTime}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-brand-gold hover:text-brand-gold-dark">
                      Read More <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Posts */}
              <div className="space-y-4">
                {blogPosts.slice(1).map((post) => (
                  <Card key={post.id} className="bg-card border-border overflow-hidden group">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-4 flex-1">
                        <Badge variant="secondary" className="mb-2 text-xs">{post.category}</Badge>
                        <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.readTime}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {post.likes}
                          </span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2 bg-brand-gold/10 text-brand-gold border-brand-gold/20">
                          {review.productName}
                        </Badge>
                        <h3 className="font-semibold text-foreground">{review.title}</h3>
                      </div>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4">{review.content}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium text-foreground">{review.author}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{new Date(review.date).toLocaleDateString('en-BD')}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {review.helpful}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

const Blog = () => (
  <CartProvider>
    <BlogContent />
  </CartProvider>
);

export default Blog;
