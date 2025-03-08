import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DatabaseIcon,
  ArrowRight,
  Zap,
  Code,
  ChevronRight,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {

  const stats = [
    {
      value: "10x",
      label: "Query Efficiency",
      description: "Faster than traditional methods"
    },
    {
      value: "3",
      label: "Database Support",
      description: "MySQL, SQLite and more"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:20px_20px]" />

        <div className="container mx-auto px-4 pt-20 pb-16 relative">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 py-2 px-4 bg-primary/10 text-primary border-primary/20">
              Next-Generation Database Querying
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Query Your Data in Plain English
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Transform natural language into powerful SQL queries instantly. Built for data teams who want to move faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="min-w-[200px] shadow-lg shadow-primary/20 group" asChild>
                <Link href="/databases">
                  Get Started
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              {/* <Button size="lg" variant="outline" className="min-w-[200px]">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button> */}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16 w-full max-w-4xl">
              {stats.map((stat, index) => (
                <div key={index} className="text-center flex flex-col items-center">
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="text-sm text-muted-foreground text-nowrap">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DatabaseIcon className="h-5 w-5 text-primary" />
                <span className="font-medium">Natural Language Query Interface</span>
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary">MySQL</Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <span className="font-medium">Your Question</span>
                </div>
                <p className="text-muted-foreground">Show top customers by revenue in Q1 2024</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="font-medium">Generated SQL</span>
                </div>
                <pre className="text-md bg-background/60 p-3 rounded-lg overflow-x-auto">
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

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">Results</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left p-2">Customer</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "1xDev", revenue: 125000, status: "Enterprise" },
                      { name: "BhaiyaDidiCourse", revenue: 98000, status: "Enterprise" },
                      { name: "Web15", revenue: 76500, status: "Growth" },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-border/40">
                        <td className="p-2">{row.name}</td>
                        <td className="text-right p-2">${row.revenue.toLocaleString()}</td>
                        <td className="text-center p-2">
                          <Badge variant={row.status === "Enterprise" ? "default" : "secondary"}>
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

      {/* Features Section */}
      {/* <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Enterprise-Ready Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for data teams who need powerful, secure, and scalable solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/60 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader>
                <div className="bg-primary/10 rounded-full p-3 w-fit mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div> */}
    </div>
  );
}