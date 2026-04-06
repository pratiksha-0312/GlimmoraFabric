export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0e1a] px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
