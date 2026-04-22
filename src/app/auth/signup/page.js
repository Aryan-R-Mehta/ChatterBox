import SignupForm from "@/components/SignupForm/SignupForm";
import Link from "next/link";

export default function SignupPage() {

  return (
    <div className="mv-page-shell min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mv-surface-card p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Sign up
          </h2>
          <p className="mb-6 text-center text-sm text-slate-400">
            Create your ChatterBox account
          </p>
          <SignupForm/>
          <p className="mt-10 text-center text-sm/6 text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-sky-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
