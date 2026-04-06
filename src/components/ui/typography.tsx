import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-heading text-3xl font-bold tracking-tight lg:text-4xl",
      h2: "font-heading text-2xl font-semibold tracking-tight",
      h3: "font-heading text-xl font-semibold tracking-tight",
      h4: "font-heading text-lg font-semibold tracking-tight",
      p: "text-base leading-relaxed",
      lead: "text-lg text-muted-foreground leading-relaxed",
      large: "text-base font-semibold",
      small: "text-sm leading-snug",
      muted: "text-sm text-muted-foreground",
      subtle: "text-xs text-muted-foreground",
      code: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded-md",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

const variantElementMap: Record<string, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  lead: "p",
  large: "p",
  small: "p",
  muted: "p",
  subtle: "span",
  code: "code",
}

type TypographyProps<T extends React.ElementType = "p"> = {
  as?: T
  className?: string
} & VariantProps<typeof typographyVariants> &
  Omit<React.ComponentPropsWithoutRef<T>, "as" | "className">

function Typography<T extends React.ElementType = "p">({
  as,
  variant = "p",
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as ?? variantElementMap[variant ?? "p"] ?? "p"

  return (
    <Component
      data-slot="typography"
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
