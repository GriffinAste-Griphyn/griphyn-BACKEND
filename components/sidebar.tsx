"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutGridIcon, CreditCardIcon, SettingsIcon, SendIcon, LogOutIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "Deals",
    href: "/deals",
    icon: LayoutGridIcon,
  },
  {
    name: "Brand Outreach",
    href: "/brand-outreach",
    icon: SendIcon,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCardIcon,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    // TODO: Implement actual logout logic (e.g., Supabase auth signout)
    console.log("Logout clicked")
  }

  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 min-h-screen bg-card border-r border-border">
      <div className="flex flex-col h-full w-full">
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOutIcon className="h-5 w-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
