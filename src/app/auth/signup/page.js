import SignupForm from "@/components/SignupForm/SignupForm";
import Link from "next/link";

export default function SignupPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Sign up
          </h2>
          <SignupForm/>
          <p className="mt-10 text-center text-sm/6 text-gray-400">
            Already Have an account ? <Link href="/auth/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
