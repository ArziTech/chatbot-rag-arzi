"use client";

import { PanelLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/shared/components/dynamic-breadcrumb";
import { SearchForm } from "@/shared/components/search-form";
import { useSidebar } from "../hooks/use-sidebar";

export function SiteHeader() {
  const { toggleCollapse } = useSidebar();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
        >
          <PanelLeftIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <DynamicBreadcrumb />
        {/* <Breadcrumb className="hidden sm:block"> */}
        {/*   <BreadcrumbList> */}
        {/*     <BreadcrumbItem> */}
        {/*       <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink> */}
        {/*     </BreadcrumbItem> */}
        {/*     <BreadcrumbSeparator /> */}
        {/*     <BreadcrumbItem> */}
        {/*       <BreadcrumbPage>Data Fetching</BreadcrumbPage> */}
        {/*     </BreadcrumbItem> */}
        {/*   </BreadcrumbList> */}
        {/* </Breadcrumb> */}
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
}
