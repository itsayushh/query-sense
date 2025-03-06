'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { handleLogin, handleSignup } from './action'
import { ArrowRight, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:20px_20px]" />
      
      <div className="container mx-auto px-4 pt-18 pb-16 relative flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-6 bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 py-2 px-4 bg-primary/10 text-primary border-primary/20">
              Welcome to QuerySense
            </Badge>
            
            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {isLogin ? 'Login' : 'Sign Up'}
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {isLogin 
                ? 'Sign in to access your database queries' 
                : 'Create an account to get started'}
            </p>
          </div>

          <form className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input 
                  name='name'
                  type="text"
                  id='name' 
                  placeholder="Enter your full name" 
                  required
                  className="h-12 text-base"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input 
                name='email'
                type="email"
                id='email' 
                placeholder="Enter your email" 
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium">
                  {isLogin ? 'Password' : 'Create Password'}
                </label>
                {isLogin && (
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input 
                  name='password'
                  type={showPassword ? "text" : "password"}
                  id='password'
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"} 
                  required
                  className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input 
                  name='confirm-password'
                  type="password"
                  id='confirm-password'
                  placeholder="Confirm your password" 
                  required
                  className="h-12 text-base"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full group" 
              formAction={isLogin ? handleLogin : handleSignup}
              size="lg"
            >
              {isLogin ? 'Login' : 'Sign Up'}
              {isLogin ? (
                <LogIn className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              ) : (
                <UserPlus className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 