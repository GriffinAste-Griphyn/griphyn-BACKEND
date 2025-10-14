"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MenuIcon,
  HomeIcon,
  LayoutGridIcon,
  CreditCardIcon,
  SettingsIcon,
  SendIcon,
  LogOutIcon,
} from "@/components/icons"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = () => {
    // TODO: Implement actual logout logic (e.g., Supabase auth signout)
    console.log("Logout clicked")
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <nav className="p-4 space-y-2 mt-8 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  )
}
