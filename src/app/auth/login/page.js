import LoginForm from "@/components/LoginForm/LoginForm";
import Link from "next/link";

export default async function LoginPage() {

  return (
    <div className="mv-page-shell min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mv-surface-card p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Login
          </h2>
          <p className="mb-6 text-center text-sm text-slate-400">
            Welcome back to your workspace
          </p>
          <LoginForm/>
          <p className="mt-6 text-center text-sm text-slate-400">
            New Here?{" "}
            <Link href="/auth/signup" className="text-sky-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}