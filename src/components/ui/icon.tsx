import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { icons, type LucideProps } from "lucide-react"

const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-3.5",
      default: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

type IconName = keyof typeof icons

interface IconProps
  extends Omit<LucideProps, "size">,
    VariantProps<typeof iconVariants> {
  name: IconName
}

function Icon({ name, size, className, ...props }: IconProps) {
  const LucideIcon = icons[name]

  return (
    <LucideIcon
      data-slot="icon"
      className={cn(iconVariants({ size, className }))}
      {...props}
    />
  )
}

export { Icon, iconVariants, type IconName }
