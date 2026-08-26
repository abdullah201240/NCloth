# Security, Zod Form Validation & Safe Coding Rules

## 1. Zod Schema Standards
All forms, query params, Server Actions, and API routes in NCloth MUST be strictly validated with Zod:

```typescript
import { z } from "zod";

export const fashionProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(100),
  sku: z.string().trim().regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens"),
  basePrice: z.number().positive("Price must be greater than 0"),
  costPrice: z.number().positive("Cost must be greater than 0").optional(),
  category: z.enum(["Outerwear", "Knitwear", "Trousers", "Footwear", "Accessories"]),
  composition: z.string().trim().min(3, "Fabric composition is required"),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

export type FashionProductFormValues = z.infer<typeof fashionProductSchema>;
```

## 2. React Hook Form & Zod Resolver
When rendering forms, always bind with `useForm` and `zodResolver`:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<FashionProductFormValues>({
  resolver: zodResolver(fashionProductSchema),
  defaultValues: { ... },
});
```

## 3. Server-Side Safety & Authorization
* Always execute `schema.safeParse(data)` before running mutations.
* Never expose raw SQL errors, stack traces, or internal database identifiers in error messages.
* Verify user role (Admin, Merchandiser, Fulfillment, Customer Support) before permitting mutations.

## 4. XSS & Injection Prevention
* Do NOT use `dangerouslySetInnerHTML` or raw unescaped HTML interpolation.
* Sanitize all free-text fields (order notes, customer requests).
