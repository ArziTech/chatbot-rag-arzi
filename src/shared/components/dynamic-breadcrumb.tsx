"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type SplitArrayResult, split_array } from "@/lib/utils";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

const ITEMS_TO_DISPLAY = 3; // Jumlah breadcrumb yang selalu ditampilkan

interface BreadcrumbType {
  href: string;
  title: string;
}
type GeneratedBreadcrumps = SplitArrayResult<BreadcrumbType>;

function generateBreadcrumbs(pathname: string): GeneratedBreadcrumps {
  const segments = pathname.split("/").filter(Boolean); // Pisahkan URL berdasarkan '/'
  const segmentedBreadcrumb = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const title = decodeURIComponent(segment).replace(/-/g, " "); // Format judul
    return { href, title };
  });

  return split_array(segmentedBreadcrumb, ITEMS_TO_DISPLAY);
}

export function DynamicBreadcrumb() {
  const pathname = usePathname(); // Ambil URL saat ini
  const { numberElement, firstElement, middleElement, lastElement } =
    generateBreadcrumbs(pathname);
  const isDesktop = useMediaQuery("(min-width: 768px)"); // Deteksi ukuran layar
  const [open, setOpen] = useState(false); // State untuk Drawer atau Dropdown

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/*  /!* Tampilkan elemen pertama *!/*/}
        <BreadcrumbItem>
          <BreadcrumbLink href={firstElement.href}>
            {firstElement.title}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {numberElement > 1 && (
          <BreadcrumbSeparator className={"flex items-center"} />
        )}

        {/* Breadcrumb collapsible jika terlalu panjang */}
        {middleElement ? (
          <>
            {/* Elemen tengah dalam Dropdown/Drawer */}
            <BreadcrumbItem>
              {isDesktop ? (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger
                    className="flex items-center gap-1"
                    aria-label="Toggle menu"
                  >
                    <BreadcrumbEllipsis className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {middleElement.map((crumb, index) => (
                      <DropdownMenuItem key={index}>
                        <Link href={crumb.href}>{crumb.title}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer open={open} onOpenChange={setOpen}>
                  <DrawerTrigger aria-label="Toggle Menu">
                    <BreadcrumbEllipsis className="size-4" />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle>Navigate to</DrawerTitle>
                      <DrawerDescription>
                        Select a page to navigate to.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-1 px-4">
                      {middleElement.map((crumb, index) => (
                        <Link
                          key={index}
                          href={crumb.href}
                          className="py-1 text-sm"
                        >
                          {crumb.title}
                        </Link>
                      ))}
                    </div>
                    <DrawerFooter className="pt-4">
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}

        {/* Breadcrumb akhir yang selalu ditampilkan */}

        {lastElement?.map((crumb, index) => (
          <BreadcrumbItem key={index}>
            {index === lastElement.length - 1 ? (
              <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
            )}
            {index < lastElement.length - 1 && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
