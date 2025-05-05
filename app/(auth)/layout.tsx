import { ModeToggle } from "@/components/modeToggle"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <ModeToggle />
      </div>
      <main>{children}</main>
    </>
  )
}