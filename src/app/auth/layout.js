import RedirectIfAuthed from "@/components/RedirectIfAuthed/RedirectIfAuthed";

export default function AuthLayout({ children }) {
  return <RedirectIfAuthed>{children}</RedirectIfAuthed>;
}
