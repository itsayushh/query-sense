import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
} 