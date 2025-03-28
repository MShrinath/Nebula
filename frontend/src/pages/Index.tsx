
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardHoverEffect } from "@/components/ui/card-hover-effect";
import { Shield, User, FileText, Users, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageTransition from "@/components/layout/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <section className="py-12 md:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Connect with <span className="text-primary">Nebula</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Share moments, connect with friends, and discover new content in a space designed for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/login">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="py-16">
            <div className="text-center mb-12">
              <motion.h2 
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Explore Nebula
              </motion.h2>
              <motion.p 
                className="text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Discover all the ways you can express yourself and connect with others.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                title="Express Yourself"
                description="Share your thoughts and moments through posts."
                icon={<FileText className="h-10 w-10 text-blue-500" />}
                delay={0.1}
                href="/posts"
              />
              <FeatureCard 
                title="Build Your Profile"
                description="Create a space that represents who you are."
                icon={<User className="h-10 w-10 text-green-500" />}
                delay={0.2}
                href="/myprofile"
              />
              <FeatureCard 
                title="Connect With Others"
                description="Discover profiles and build meaningful connections."
                icon={<Users className="h-10 w-10 text-purple-500" />}
                delay={0.3}
                href="/profile/1"
              />
              <FeatureCard 
                title="Safe & Secure"
                description="Your privacy and security are our top priorities."
                icon={<Shield className="h-10 w-10 text-red-500" />}
                delay={0.4}
                href="/login"
              />
              <FeatureCard 
                title="Join Communities"
                description="Find others who share your interests and passions."
                icon={<Users className="h-10 w-10 text-purple-500" />}
                delay={0.5}
                href="/posts"
              />
              <FeatureCard 
                title="Personal Dashboard"
                description="Manage your content and connections in one place."
                icon={<User className="h-10 w-10 text-indigo-500" />}
                delay={0.6}
                href="/myprofile"
              />
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-20 border-t border-border pt-10 text-center">
            <h3 className="text-xl font-semibold mb-2">Join Nebula Today</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
              Connect with friends, share your moments, and discover new content in a space designed just for you.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/register">Create Your Account</Link>
            </Button>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  href: string;
}

const FeatureCard = ({ title, description, icon, delay, href }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <CardHoverEffect>
        <Card className="h-full premium-card">
          <CardHeader>
            <div className="flex items-center justify-center mb-3">{icon}</div>
            <CardTitle className="text-center">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center mb-4">{description}</CardDescription>
            <div className="flex justify-center">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to={href}>Explore</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardHoverEffect>
    </motion.div>
  );
};

export default Index;
