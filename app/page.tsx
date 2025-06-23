import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DatabaseIcon,
  ArrowRight,
  Zap,
  Code,
  ChevronRight,
  CheckCircle2,
  Globe,
  Shield,
  Cpu,
  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const stats = [
    {
      value: "10x",
      label: "Query Efficiency",
      description: "Faster than traditional methods"
    },
    {
      value: "3+",
      label: "Database Support",
      description: "MySQL, PostgreSQL & more"
    },
    {
      value: "24/7",
      label: "Support",
      description: "Dedicated assistance"
    },
    {
      value: "Beta",
      label: "Early Access",
      description: "Limited spots available"
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Enterprise Security",
      description: "Bank-grade security for your sensitive data",
      benefits: [
        "End-to-end encryption",
        "Role-based access control",
        "Audit logging",
        "SOC 2 compliant"
      ]
    },
    {
      icon: <Cpu className="h-6 w-6 text-primary" />,
      title: "AI-Powered Accuracy",
      description: "Advanced machine learning for precise query generation",
      benefits: [
        "Contextual understanding",
        "Schema-aware processing",
        "Query optimization",
        "Continuous learning"
      ]
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Seamless Integration",
      description: "Connect with your existing data infrastructure",
      benefits: [
        "API-first architecture",
        "Multi-database support",
        "Custom connectors",
        "No-code setup"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:20px_20px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="container mx-auto px-5 relative">
          <div className="flex flex-col items-center text-center mx-auto max-w-3xl">
            <Badge variant="outline" className="mb-6 py-2 px-4 bg-primary/10 text-primary border-primary/20">
              Next-Generation Database Querying
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gradient leading-tight h-40">
              Query Your Data in Plain English
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              Transform natural language into powerful SQL queries instantly. 
              Built for data teams who want to move faster without sacrificing accuracy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="min-w-[200px] h-12 shadow-lg shadow-primary/20 group text-base font-medium" asChild>
                <Link href="/databases">
                  Get Started Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[200px] h-12 text-base font-medium" asChild>
                <Link href="https://github.com/itsayushh/query-sense" target="_blank" rel="noopener noreferrer">
                  <Star className="mr-2 h-5 w-5" />
                  Star on GitHub
                </Link>
              </Button>
            </div>
          </div>

          {/* Animated Code Snippet */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-sm z-0" />
              <div className="relative z-10 bg-card/80 backdrop-blur-md rounded-xl p-6 border border-border/40">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="ml-3 text-sm font-medium text-muted-foreground">SQL Assistant</div>
                </div>
                <div className="font-mono text-sm">
                  <span className="text-muted-foreground">{">"}</span> <span className="text-primary-foreground">Show top customers by revenue in Q1 2024</span>
                  <div className="mt-3 p-3 bg-background/60 rounded-lg overflow-x-auto">
                    <pre className="text-secondary-foreground">
                      <code>{`SELECT 
  c.name,
  SUM(o.amount) as revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.date >= '2024-01-01'
  AND o.date <= '2024-03-31'
GROUP BY c.name
ORDER BY revenue DESC
LIMIT 5;`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="p-6 rounded-xl bg-card/40 backdrop-blur-sm border border-border/20 hover-card flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold text-gradient mb-3">{stat.value}</div>
                <div className="text-sm font-medium mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground text-center">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-gradient-to-b from-background/80 to-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">See It In Action</h2>
          
          <div className="bg-card/40 backdrop-blur-xl border border-border/20 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 max-w-6xl mx-auto">
            <div className="p-5 border-b border-border/20 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DatabaseIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Natural Language Query Interface</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                  MySQL
                </Badge>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 p-8">
              <div className="space-y-8">
                <div className="bg-muted/20 rounded-xl p-6 border border-border/20">
                  <div className="flex items-center gap-2 mb-4">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">Your Question</span>
                  </div>
                  <div className="p-4 bg-background/40 rounded-lg border border-border/10">
                    <p className="text-muted-foreground">Show top customers by revenue in Q1 2024</p>
                  </div>
                </div>

                <div className="bg-muted/20 rounded-xl p-6 border border-border/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="font-medium">Generated SQL</span>
                  </div>
                  <pre className="text-md bg-background/40 p-4 rounded-lg overflow-x-auto border border-border/10">
                    <code>{`SELECT 
  c.name,
  SUM(o.amount) as revenue
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.date >= '2024-01-01'
  AND o.date <= '2024-03-31'
GROUP BY c.name
ORDER BY revenue DESC
LIMIT 5;`}</code>
                  </pre>
                </div>
              </div>

              <div className="bg-muted/20 rounded-xl p-6 border border-border/20">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Results</span>
                </div>
                <div className="bg-background/40 rounded-lg p-4 border border-border/10 overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/40">
                          <th className="text-left p-3 font-medium text-secondary-foreground">Customer</th>
                          <th className="text-right p-3 font-medium text-secondary-foreground">Revenue</th>
                          <th className="text-center p-3 font-medium text-secondary-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "1xDev", revenue: 125000, status: "Enterprise" },
                          { name: "BhaiyaDidiCourse", revenue: 98000, status: "Enterprise" },
                          { name: "Web15", revenue: 76500, status: "Growth" },
                          { name: "TechVentures", revenue: 62300, status: "Growth" },
                          { name: "DataInsight", revenue: 54800, status: "Standard" },
                        ].map((row, index) => (
                          <tr key={index} className={`border-b border-border/20 ${index % 2 === 1 ? 'bg-muted/20' : ''}`}>
                            <td className="p-3">{row.name}</td>
                            <td className="text-right p-3">${row.revenue.toLocaleString()}</td>
                            <td className="text-center p-3">
                              <Badge variant={row.status === "Enterprise" ? "default" : row.status === "Growth" ? "secondary" : "outline"}
                                    className={row.status === "Enterprise" ? "bg-primary/20 text-primary border border-primary/20" : 
                                              row.status === "Growth" ? "bg-accent/20 text-accent border border-accent/20" : ""}>
                                {row.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-background/90">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-5 text-gradient">Enterprise-Ready Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Built for data teams who need powerful, secure, and scalable solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/40 backdrop-blur-xl border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="pb-4">
                  <div className="bg-primary/10 rounded-xl p-3 w-fit mb-6">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" className="min-w-[220px] h-12 shadow-lg shadow-primary/20 group text-base font-medium" asChild>
              <Link href="/pricing">
                Explore All Features
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative overflow-hidden rounded-2xl max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-background" />
            <div className="relative z-10 py-20 px-8 md:px-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Ready to Simplify Your Database Queries?</h2>
              <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Join forward-thinking teams who are already saving hours every day with natural language database queries.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Button size="lg" className="min-w-[200px] h-12 shadow-lg shadow-primary/20 group text-base font-medium" asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-[200px] h-12 bg-background/80 text-base font-medium">
                  Request Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">QuerySense</span>
            </div>  
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="https://www.github.com/itsayushh" className="text-muted-foreground hover:text-foreground transition-colors">Github</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 QuerySense. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}