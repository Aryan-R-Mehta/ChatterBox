import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/AppToast/ToastNotification";
import AppShell from "@/components/AppShell/AppShell";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Chatterbox",
    description: "Real-time messaging workspace",
};

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body suppressHydrationWarning className="flex h-full flex-col overflow-hidden">
                <AuthProvider>
                    <ToastProvider>
                        <AppShell>{children}</AppShell>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
