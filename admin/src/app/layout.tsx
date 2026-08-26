import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { CategoryProvider } from "@/lib/stores/category-context";
import { WarehouseProvider } from "@/lib/stores/warehouse-context";
import { ShelfProvider } from "@/lib/stores/shelf-context";
import { SupplierProvider } from "@/lib/stores/supplier-context";
import { StoreProvider } from "@/lib/stores/store-context";
import { AttributeProvider } from "@/lib/stores/attribute-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NCLOTH • Studio Fashion Admin",
  description: "Luxury apparel merchandising, taxonomy management, and catalog system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delay={100}>
            <CategoryProvider>
              <WarehouseProvider>
                <ShelfProvider>
                  <SupplierProvider>
                    <StoreProvider>
                      <AttributeProvider>
                        {children}
                        <Toaster />
                      </AttributeProvider>
                    </StoreProvider>
                  </SupplierProvider>
                </ShelfProvider>
              </WarehouseProvider>
            </CategoryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
