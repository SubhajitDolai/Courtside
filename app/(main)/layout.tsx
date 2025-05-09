import GlassmorphNavbar from "@/components/glassmorphNavbar"
import { Toaster } from "sonner"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlassmorphNavbar />
      <main>{children}</main>
      <Toaster />
    </>
  )
}