'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedBackground from '@/components/animated-background';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Linkedin, 
  Instagram, 
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Star
} from 'lucide-react';

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    subject: '',
    message: '',
    type: 'feedback'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate sending feedback (in a real app, this would go to a backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store feedback in localStorage for demo purposes
      const feedbacks = JSON.parse(localStorage.getItem('blogapp_feedbacks') || '[]');
      const newFeedback = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        userId: user?.id || 'anonymous'
      };
      feedbacks.push(newFeedback);
      localStorage.setItem('blogapp_feedbacks', JSON.stringify(feedbacks));

      setSuccess('Thank you for your feedback! We\'ll get back to you soon.');
      setFormData({
        name: user?.username || '',
        email: user?.email || '',
        subject: '',
        message: '',
        type: 'feedback'
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
            >
              <MessageSquare className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-foreground">Contact BlogApp</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have feedback, found a bug, or want to collaborate? We'd love to hear from you!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Developer Info Card */}
            <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <User className="w-5 h-5 mr-2" />
                  Meet the Developer
                </CardTitle>
                <CardDescription>
                  Get to know the person behind BlogApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Developer Profile */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20 border-4 border-primary/20">
                    <AvatarImage src="/developer-avatar.jpg" alt="Ayush Developer" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold">
                      AY
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Ayush</h3>
                    <p className="text-muted-foreground">Full Stack Developer</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">4.5 Developer</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="w-4 h-4 mr-3 text-primary" />
                    <span>awasthiayush3399@gmail.com</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="w-4 h-4 mr-3 text-primary" />
                    <span>+91 9918830275</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-3 text-primary" />
                    <span>Chandigarh, India</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">About Me</h4>
                  <p className="text-sm text-muted-foreground">
                    Passionate full-stack developer with expertise in React, Next.js, and modern web technologies. 
                    I love creating beautiful, functional applications that solve real-world problems. 
                    BlogApp is my passion project to help creators share their ideas with the world.
                  </p>
                </div>

                {/* Social Links */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Connect with me</h4>
                  <div className="flex space-x-3">
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href="https://github.com/ayu2046"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-muted hover:bg-muted/70 p-3 rounded-lg transition-colors"
                    >
                      <Github className="w-5 h-5 text-foreground" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href="https://www.linkedin.com/in/ayush-awasthi-031437219/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-muted hover:bg-muted/70 p-3 rounded-lg transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-foreground" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href="https://instagram.com/_ayu_2046"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-muted hover:bg-muted/70 p-3 rounded-lg transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-foreground" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      href="mailto:awasthiayush3399@gmail.com"
                      className="bg-muted hover:bg-muted/70 p-3 rounded-lg transition-colors"
                    >
                      <Mail className="w-5 h-5 text-foreground" />
                    </motion.a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Form */}
            <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Send className="w-5 h-5 mr-2" />
                  Send Feedback
                </CardTitle>
                <CardDescription>
                  Your feedback helps us improve BlogApp for everyone
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="border-green-500/50 bg-green-500/10 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert className="border-red-500/50 bg-red-500/10 mb-4">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700 dark:text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-foreground">Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      <option value="feedback">General Feedback</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="collaboration">Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-foreground">Subject</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your feedback"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-foreground">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your feedback, suggestions, or issues..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isLoading ? 'Sending...' : 'Send Feedback'}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
