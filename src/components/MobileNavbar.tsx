"use client";
import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useState } from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import ModeToggle from "./ModeToggle";

function MobileNavbar() {
  const { user } = useUser(); // ✅ Use useUser() inside a normal function
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="flex md:hidden items-center space-x-2">
      <ModeToggle />

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <div className="relative">
              <MenuIcon className="h-5 w-5" />
            </div>
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 justify-start"
                asChild
              >
                <Link href="/">
                  <HomeIcon className="w-4 h-4" />
                  Home
                </Link>
              </Button>
            </SheetClose>

            {user ? (
              <>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 justify-start"
                    asChild
                  >
                    <Link href="/notifications">
                      <div className="relative">
                        <BellIcon className="w-4 h-4" />
                      </div>
                      Notifications
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 justify-start"
                    asChild
                  >
                    <Link
                      href={`/profile/${
                        user.username ??
                        user.emailAddresses[0].emailAddress.split("@")[0]
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </Link>
                  </Button>
                </SheetClose>

                <SignOutButton>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 justify-start w-full"
                    >
                      <LogOutIcon className="w-4 h-4" />
                      Logout
                    </Button>
                  </SheetClose>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <SheetClose asChild>
                  <Button variant="default" className="w-full">
                    Sign In
                  </Button>
                </SheetClose>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
