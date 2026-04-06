import LoginForm from "@/components/LoginForm/LoginForm";
import Link from "next/link";

export default async function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Login
          </h2>
          <LoginForm/>
          <p className="mt-6 text-center text-sm text-gray-400">
            New Here?{" "}
            <Link href="/auth/signup" className="text-indigo-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}