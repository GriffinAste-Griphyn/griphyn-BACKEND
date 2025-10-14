import Image from "next/image"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="py-4 px-4 md:pl-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image src="/griphyn-logo.png" alt="Griphyn" width={140} height={40} className="h-8 w-auto" />
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
