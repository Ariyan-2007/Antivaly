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
  deliveryFee: number;
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
  placedAt: string;
};

/** RFC 7807 application/problem+json shape returned on every non-2xx response. */
export type ProblemDetails = {
  status: number;
  title: string;
  type?: string;
  errors?: Record<string, string[]>;
};
