// Types mirror the live Vastora OpenAPI spec (GET /swagger/v1/swagger.json on the API host),
// cross-checked against ANTIVALY_SHOP_BLUEPRINT.md §6 (through the 2026-08-16 revision). The
// real schema marks most string/array fields as nullable (loose C# nullable-reference-type
// annotations) even where a field is "always" populated in practice — types here follow the
// schema, not the assumption, so every call site is forced to handle the null case rather than
// trusting undocumented guarantees.

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

export type BusinessTax = {
  enabled: boolean;
  defaultRatePercent: number;
  /** true = catalog prices already include tax (show "incl. {displayName}"), false = tax is added at checkout. */
  pricesIncludeTax: boolean;
  taxShipping: boolean;
  classRates: Record<string, number>;
  registrationNumber: string | null;
  /** "VAT" | "GST" | "Sales Tax" — use this label, never hardcode one. */
  displayName: string | null;
};

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
  /** Whether this Business runs an in-house delivery workflow at all — some sellers are pickup-only or use a third-party courier. */
  deliveryModuleEnabled: boolean;
  /** Flat fallback fee used server-side only when no shipping-zone rate and no explicit fee apply. */
  defaultDeliveryFee: number;
  createdAt: string;

  tax: BusinessTax;
  /** 0 = this shop accepts no returns; hide the returns UI entirely. */
  returnWindowDays: number;
  /** false = render no review UI at all. */
  reviewsEnabled: boolean;
  /** false = require login before checkout. */
  guestCheckoutEnabled: boolean;
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

/** Buyable since 2026-08-16 — a product with variants requires a variantId on add-to-cart. */
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
  /** BackOffice-facing — not customer-relevant, safe to ignore. */
  reorderThreshold: number | null;
  reorderQuantity: number | null;
  images: string[] | null;
  tags: string[] | null;
  status: ProductStatus;
  variants: ProductVariantResponse[] | null;

  averageRating: number;
  reviewCount: number;
  brand: string | null;
  barcode: string | null;
  weightKg: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  unpublishedAt: string | null;
  isFeatured: boolean;
  sortWeight: number;
  taxClass: string | null;
  /** Prefer this over reading stockQuantity directly. */
  isAvailable: boolean;

  /** Always null on public endpoints — the server strips cost data from the public projection. */
  costPrice: number | null;
  unitMargin: number | null;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type CatalogSort =
  | "Relevance"
  | "Newest"
  | "PriceAscending"
  | "PriceDescending"
  | "TopRated"
  | "BestSelling"
  | "NameAscending";

export type CatalogFacetsResponse = {
  categories: { value: string; count: number }[];
  brands: { value: string; count: number }[];
  tags: { value: string; count: number }[];
  minPrice: number;
  maxPrice: number;
  inStockCount: number;
  totalCount: number;
};

export type ReviewStatus = "Pending" | "Published" | "Rejected";

export type ReviewResponse = {
  id: string;
  productId: string;
  customerName: string | null;
  /** 1-5 */
  rating: number;
  title: string | null;
  body: string | null;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  merchantReply: string | null;
  merchantRepliedAt: string | null;
  helpfulCount: number;
  createdAt: string;
};

export type ReviewSummaryResponse = {
  productId: string;
  averageRating: number;
  reviewCount: number;
  ratingCounts: Record<"1" | "2" | "3" | "4" | "5", number>;
};

export type RecommendedProductResponse = {
  productId: string;
  productName: string | null;
  slug: string | null;
  effectivePrice: number;
  imageUrl: string | null;
  timesBoughtTogether: number;
};

export type ContentBlockType = "Banner" | "Page" | "MenuItem" | "Article";

export type ContentBlockResponse = {
  id: string;
  type: ContentBlockType;
  slug: string | null;
  title: string | null;
  subtitle: string | null;
  /** Markdown. */
  body: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  parentId: string | null;
  sortOrder: number;
  isPublished: boolean;
  startsAt: string | null;
  endsAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isVisibleNow: boolean;
};

export type MenuNode = {
  id: string;
  title: string | null;
  linkUrl: string | null;
  sortOrder: number;
  children: MenuNode[];
};

export type CartItem = {
  productId: string;
  /** Same product in two variants is two separate lines. */
  variantId: string | null;
  variantSummary: string | null;
  productName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type CartDiscount = {
  source: "Coupon" | "Promotion";
  label: string | null;
  amount: number;
  isFreeShipping: boolean;
};

export type CartResponse = {
  id: string;
  businessId: string | null;
  items: CartItem[] | null;
  couponCode: string | null;
  promotionCodes: string[] | null;
  subtotal: number;
  discounts: CartDiscount[] | null;
  discountTotal: number;
  /** subtotal - discountTotal. Excludes shipping and tax on purpose — call orders/preview for the full number. */
  estimatedTotal: number;
  currency: string | null;
  itemCount: number;
  /** Present only for guest carts — persist this in localStorage. */
  guestToken: string | null;
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

export type FulfillmentMethod = "Delivery" | "Pickup" | "ExternalCourier" | "Digital";

export type CheckoutRequest = {
  shippingAddress: ShippingAddress;
  deliveryFee?: number | null;
  billingAddress?: ShippingAddress | null;
  shippingRateId?: string | null;
  fulfillmentMethod?: FulfillmentMethod | null;
  customerNote?: string | null;
  /** Customer only; spends up to the available balance. */
  useStoreCredit?: boolean;
  giftCardCodes?: string[] | null;
  /** Guest checkout only — ignored when a Customer JWT is present. guestEmail is required for a guest order. */
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestName?: string | null;
};

export type ShippingOption = {
  zoneId: string;
  rateId: string;
  name: string | null;
  price: number;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
};

export type CheckoutPreviewResponse = {
  subtotal: number;
  discounts: { source: string; label: string | null; amount: number; isFreeShipping: boolean }[];
  discountTotal: number;
  deliveryFee: number;
  shippingMethodName: string | null;
  shippingOptions: ShippingOption[];
  taxAmount: number;
  taxLines: { label: string | null; ratePercent: number; taxableAmount: number; taxAmount: number }[];
  /** true = taxAmount is already inside `total`, don't add it again. */
  pricesIncludeTax: boolean;
  total: number;
  giftCardTotal: number;
  storeCreditAvailable: number;
  /** What's left to pay after gift cards and store credit. */
  amountDue: number;
  currency: string | null;
};

export type ReturnReason =
  | "Damaged"
  | "WrongItem"
  | "NotAsDescribed"
  | "ChangedMind"
  | "SizeOrFit"
  | "Other";

export type ReturnResolution = "Refund" | "Exchange" | "StoreCredit";

export type ReturnStatus =
  | "Requested"
  | "Approved"
  | "Rejected"
  | "Received"
  | "Refunded"
  | "Cancelled";

export type CreateReturnRequest = {
  orderId: string;
  items: { productId: string; variantId: string | null; quantity: number }[];
  reason: ReturnReason;
  reasonNote: string;
  resolution: ReturnResolution;
};

export type ReturnResponse = {
  id: string;
  rmaNumber: string | null;
  orderId: string;
  orderNumber: string | null;
  customerUserId: string | null;
  items: {
    productId: string;
    variantId: string | null;
    productName: string | null;
    quantity: number;
    unitPrice: number;
    lineRefund: number;
  }[];
  reason: ReturnReason;
  reasonNote: string | null;
  resolution: ReturnResolution;
  status: ReturnStatus;
  requestedRefundAmount: number;
  approvedRefundAmount: number | null;
  currency: string | null;
  restocked: boolean;
  refundedAt: string | null;
  statusHistory: { status: ReturnStatus; timestamp: string; note: string | null }[];
  createdAt: string;
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

export type OrderItem = {
  productId: string;
  variantId: string | null;
  variantSummary: string | null;
  productName: string | null;
  unitPrice: number;
  quantity: number;
  /** How many of this line have already come back via a return. */
  refundedQuantity: number;
  lineTotal: number;
};

export type OrderResponse = {
  id: string;
  businessId: string | null;
  orderNumber: string | null;
  /** "" for a guest order. */
  customerUserId: string | null;
  isGuestOrder: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  items: OrderItem[] | null;
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  /** Itemised, for the receipt. */
  discounts: { source: string; label: string | null; amount: number }[] | null;
  deliveryFee: number;
  taxAmount: number;
  taxRatePercent: number;
  /** true = taxAmount is inside `total`, not added to it. */
  pricesIncludeTax: boolean;
  total: number;
  giftCardTotal: number;
  giftCardsUsed: { codeSuffix: string; amountApplied: number }[] | null;
  storeCreditApplied: number;
  amountDue: number;
  refundedAmount: number;
  /** Snapshotted at checkout — display with this, not the Business's current currency. */
  currency: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentMethod: FulfillmentMethod;
  shippingAddress: ShippingAddress | null;
  billingAddress: ShippingAddress | null;
  deliveryAgentUserId: string | null;
  shippingMethodName: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  invoiceNumber: string | null;
  customerNote: string | null;
  statusHistory: OrderStatusEventResponse[] | null;
  paymentStatusHistory: PaymentStatusEventResponse[] | null;
  placedAt: string;
};

export type WishlistItemResponse = {
  id: string;
  productId: string;
  productName: string | null;
  slug: string | null;
  price: number;
  effectivePrice: number;
  imageUrl: string | null;
  inStock: boolean;
  addedAt: string;
};

export type StoreCreditReason =
  | "GiftCardRedemption"
  | "RefundToCredit"
  | "LoyaltyReward"
  | "ManualAdjustment"
  | "Spent";

export type StoreCreditBalanceResponse = {
  balance: number;
  currency: string | null;
  recentEntries: {
    id: string;
    amount: number;
    currency: string | null;
    reason: StoreCreditReason;
    note: string | null;
    referenceOrderId: string | null;
    createdAt: string;
  }[];
};

export type GiftCardBalanceResponse = {
  codeSuffix: string | null;
  remainingBalance: number;
  currency: string | null;
  expiresAt: string | null;
  isRedeemable: boolean;
};

export type UpdateNotificationPreferencesRequest = {
  /** Opt-IN. Defaults false; only send marketing when true. */
  marketingEmail: boolean;
  backInStockAlerts: boolean;
  reviewRequests: boolean;
  marketingSms: boolean;
};

export type CustomerDataExport = Record<string, unknown>;

/** RFC 7807 application/problem+json shape returned on every non-2xx response. */
export type ProblemDetails = {
  status: number;
  title: string;
  type?: string;
  errors?: Record<string, string[]>;
};
