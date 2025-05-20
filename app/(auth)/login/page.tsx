import Image from "next/image";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/sports_img/badminton.webp"
          alt="Image"
          fill
          className="object-cover dark:grayscale"
          priority
        />
      </div>
    </div>
  )
}
