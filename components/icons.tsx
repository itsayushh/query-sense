'use client'

import { Loader2, Database } from 'lucide-react'

export const LoadingSpinner = ({ className }: { className?: string }) => (
  <Loader2 className={className} />
)

export const DatabaseIcon = Database 