import React from 'react';
import { DatabaseConnectionForm } from "@/components/database/DatabaseConnectionForm";

export default function DatabasesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section with animated gradient */}
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-3xl" />
          <div className="relative z-10 text-center space-y-4 py-8">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
              Database Connection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Securely connect your database and start exploring your data in minutes
            </p>
          </div>
        </div>

        {/* Connection Form with floating effect */}
        <div className="flex flex-col  items-center w-full">
            <DatabaseConnectionForm />
        </div>
      </div>
    </div>
  );
}