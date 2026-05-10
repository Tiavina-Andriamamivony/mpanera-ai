import { PlatformAppShell } from "@/components/platform-app-shell"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <PlatformAppShell>{children}</PlatformAppShell>
}
