import { deepClone } from '@/lib/utils'

function cloneValue<T>(value: T): T {
  return deepClone(value) as T
}

export function cleanIds<T extends object>(
  items?: T[]
): T[] | undefined {
  if (!Array.isArray(items)) return items

  const cleanedItems = items.map(item => {
    if (item && typeof item === 'object' && 'id' in item) {
      const { id, ...rest } = item as T & { id?: unknown }
      void id
      return rest as T
    }

    return item
  })

  return cloneValue(cleanedItems)
}

export function cleanPages<T>(pages?: T[], tagOptions?: unknown[]): T[] {
  void tagOptions
  if (!Array.isArray(pages)) return pages || []
  return pages
}

export function shortenIds<T>(items?: T[]): T[] | undefined {
  if (!Array.isArray(items)) return items
  return items
}
