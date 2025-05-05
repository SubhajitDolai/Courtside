import GlassmorphNavbar from "@/components/glassmorphNavbar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlassmorphNavbar />
      <main>{children}</main>
    </>
  )
}