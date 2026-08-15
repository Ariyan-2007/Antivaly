// Types mirror the live Vastora OpenAPI spec (GET /swagger/v1/swagger.json on the API host),
// cross-checked against ANTIVALY_SHOP_BLUEPRINT.md §6. The real schema marks most string/array
// fields as nullable (loose C# nullable-reference-type annotations) even where a field is
// "always" populated in practice — types here follow the schema, not the assumption, so every
// call site is forced to handle the null case rather than trusting undocumented guarantees.

export type UserStatus = "PendingVerification" | "Active" | "Blocked";
export type UserRole =
  | "PlatformSuperAdmin"
  | "TenantOwner"
  | "BusinessAdmin"
  | "BusinessStaff"
  | "DeliveryAgent"
  | "Customer";

export type UserSummaryResponse = {
  id: string;
  fullName: string | null;
  email: string | null;
  role: UserRole;
  tenantId: string | null;
  businessId: string | null;
  status: UserStatus;
};

export type AuthResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserSummaryResponse;
};

export type StorefrontRegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

export type StorefrontLoginRequest = {
  email: string;
  password: string;
};

export type BusinessStatus = "Draft" | "Active" | "Suspended";

export type BusinessResponse = {
  id: string;
  tenantId: string | null;
  name: string | null;
  slug: string | null;
  customDomain: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  themeColor: string | null;
  currency: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: BusinessStatus;
  /** Whether this Business runs a delivery workflow at all (added 2026-08-15) — some sellers are pickup-only or use a third-party courier. */
  deliveryModuleEnabled: boolean;
  /** Flat fallback fee applied server-side when checkout omits `deliveryFee` (added 2026-08-15). */
  defaultDeliveryFee: number;
  createdAt: string;
};

export type CategoryResponse = {
  id: string;
  businessId: string | null;
  name: string | null;
  slug: string | null;
  parentCategoryId: string | null;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type ProductStatus = "Draft" | "Active" | "OutOfStock" | "Archived";

/** Display-only — not purchasable through this app's API, see product detail page's usage. */
export type ProductVariantResponse = {
  id: string;
  attributeSummary: string | null;
  sku: string | null;
  priceOverride: number | null;
  stockQuantity: number;
};

export type ProductResponse = {
  id: string;
  businessId: string | null;
  categoryId: string | null;
  name: string | null;
  slug: string | null;
  sku: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  discountExpiresAt: string | null;
  /** Always display this as the price — it already accounts for any active discount. */
  effectivePrice: number;
  stockQuantity: number;
  trackInventory: boolean;
  images: string[] | null;
  tags: string[] | null;
  status: ProductStatus;
  /** BackOffice-managed variants (added 2026-08-15) — display only, not addable to cart individually. */
  variants: ProductVariantResponse[] | null;
};

export type CartItem = {
  productId: string;
  productName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type CartResponse = {
  id: string;
  businessId: string | null;
  items: CartItem[] | null;
  couponCode: string | null;
  /** Sum of lineTotal — does NOT subtract the coupon. */
  subtotal: number;
};

export type ShippingAddress = {
  label: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  isDefault: boolean;
};

export type CheckoutRequest = {
  shippingAddress: ShippingAddress;
  /** Optional as of 2026-08-15 — omit/null to fall back to the Business's `defaultDeliveryFee`. */
  deliveryFee?: number | null;
};

export type OrderStatus =
  | "PendingPayment"
  | "Processing"
  | "Confirmed"
  | "OutForDelivery"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";

export type OrderStatusEventResponse = {
  status: OrderStatus;
  timestamp: string;
  note: string | null;
};

export type PaymentStatusEventResponse = {
  status: PaymentStatus;
  timestamp: string;
  note: string | null;
};

export type OrderResponse = {
  id: string;
  businessId: string | null;
  orderNumber: string | null;
  customerUserId: string | null;
  items: CartItem[] | null;
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress | null;
  deliveryAgentUserId: string | null;
  /** Full status timeline (added 2026-08-15) — build the tracking view from this, not just `status`. */
  statusHistory: OrderStatusEventResponse[] | null;
  paymentStatusHistory: PaymentStatusEventResponse[] | null;
  placedAt: string;
};

/** RFC 7807 application/problem+json shape returned on every non-2xx response. */
export type ProblemDetails = {
  status: number;
  title: string;
  type?: string;
  errors?: Record<string, string[]>;
};
