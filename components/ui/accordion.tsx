"use client";

/*
  shadcn/ui-style Accordion on Radix — the primitive that the free 21st.dev
  "Accordion" (brijr / accordion-1) FAQ pattern imports from "@/components/ui/accordion".
*/
import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item className={cn("border-b border-border", className)} {...props} />
);

const AccordionTrigger = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "group flex min-h-[56px] flex-1 cursor-pointer items-center justify-between gap-4 py-4 text-left text-base font-semibold text-foreground transition-colors hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden
        className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content
    className="overflow-hidden text-[0.97rem] text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-5 pr-8", className)}>{children}</div>
  </AccordionPrimitive.Content>
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
