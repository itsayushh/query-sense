import React from 'react';
import { DatabaseConnectionForm } from "@/components/database/DatabaseConnectionForm";

export default function DatabasesConnectionPage() {
  return (
    <div className="flex items-center h-full py-7 bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container flex items-center flex-col mx-auto px-5 py-10 sm:px-6 lg:px-8">
          <DatabaseConnectionForm />
      </div>
    </div>
  );
}