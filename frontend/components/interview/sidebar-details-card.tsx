import { type ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SidebarDetailsCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function SidebarDetailsCard({
  title,
  description,
  icon,
  children,
}: SidebarDetailsCardProps) {
  return (
    <Card className="h-fit overflow-hidden rounded-sm border-black/10 bg-white/75 py-0 shadow-none">
      <CardHeader className="gap-1 border-b border-black/10 px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-black/45">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="px-5 py-3">{children}</CardContent>
    </Card>
  );
}
