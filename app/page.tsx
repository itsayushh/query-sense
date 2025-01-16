import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DatabaseIcon, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  const features = [
    {
      title: "Natural Language to SQL",
      description: "Transform your plain English questions into precise SQL queries instantly",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
    },
    {
      title: "Secure Connection",
      description: "Enterprise-grade security for your database connections and queries",
      icon: <Shield className="w-6 h-6 text-primary" />,
    },
    {
      title: "Lightning Fast",
      description: "Get immediate results with our optimized query generation engine",
      icon: <Zap className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/80">
      {/* Hero Section */}
      <div className="container flex flex-col items-center justify-center min-h-[75vh] space-y-8">
        <div className="space-y-6 text-center max-w-[800px]">
          <span className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-full shadow-md">
            Welcome to the future of database querying
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Query<span className="text-primary">Sense</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl lg:text-2xl">
            Generate and execute SQL queries using natural language. Connect your database or upload a schema to get started.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <Button size="lg" className="min-w-[200px] group shadow-lg" asChild>
            <Link href="/databases">
              <DatabaseIcon className="mr-2" />
              Connect Database
              <ArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-6 md:px-24 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/60 backdrop-blur-md border border-border/40 shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
