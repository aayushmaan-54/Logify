import type { Metadata } from "next";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Logify: Write it, Feel it, Logify it.",
  description: "",
};



export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`container mx-auto`} >
      {children}
    </div>
  );
}