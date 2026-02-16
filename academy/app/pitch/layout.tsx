export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f5f0e8]">
      {children}
    </div>
  );
}
