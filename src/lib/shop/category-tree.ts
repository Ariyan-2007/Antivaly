import type { CategoryResponse } from "@/types/api";

/** Categories are confirmed one level deep (a parent's own `parentCategoryId` is always
 * null) — these helpers deliberately don't do generic multi-level tree recursion. */

export function getTopLevelCategories(categories: CategoryResponse[]): CategoryResponse[] {
  return categories
    .filter((c) => !c.parentCategoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getChildCategories(
  categories: CategoryResponse[],
  parentId: string
): CategoryResponse[] {
  return categories
    .filter((c) => c.parentCategoryId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getParentCategory(
  categories: CategoryResponse[],
  category: CategoryResponse
): CategoryResponse | null {
  if (!category.parentCategoryId) return null;
  return categories.find((c) => c.id === category.parentCategoryId) ?? null;
}
