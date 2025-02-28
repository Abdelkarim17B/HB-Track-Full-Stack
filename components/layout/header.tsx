"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  HardHat
} from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isManagement = session?.user?.role && ['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role);

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tâches", href: "/tasks", icon: Calendar },
    ...(isManagement ? [{ name: "Utilisateurs", href: "/users", icon: Users }] : []),
    ...(isManagement ? [{ name: "Paramètres", href: "/settings", icon: Settings }] : []),
  ];

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <HardHat className="h-8 w-8" />
              <span className="text-xl font-bold">HBTRACK</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? "bg-primary-foreground text-primary"
                    : "hover:bg-primary-foreground/10"
                }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
            {session && (
              <Button
                variant="ghost"
                className="hover:bg-primary-foreground/10"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-primary-foreground"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10">
          <div className="space-y-1 px-4 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? "bg-primary-foreground text-primary"
                    : "hover:bg-primary-foreground/10"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.name}
              </Link>
            ))}
            {session && (
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary-foreground/10"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}