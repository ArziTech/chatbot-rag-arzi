import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SplitArrayResult<T> {
  numberElement: number;
  firstElement: T;
  middleElement?: Array<T>;
  lastElement?: Array<T>;
}

/**
 * Function  to split array into three parts
 * @type {string[]}
 */
export function split_array<T>(
  array: Array<T>,
  sumFirstAndLast: number,
): SplitArrayResult<T> {
  if (array.length < 1) return { numberElement: 0, firstElement: {} as T };
  else if (array.length === 1) {
    return { numberElement: 1, firstElement: array[0] };
  } else if (array.length <= sumFirstAndLast) {
    return {
      numberElement: array.length,
      firstElement: array[0],
      lastElement: array.slice(1), // Ambil semua elemen setelah elemen pertama
    };
  } else {
    return {
      numberElement: array.length,
      firstElement: array[0],
      middleElement: array.slice(1, -(sumFirstAndLast - 1)), // Elemen di tengah (tidak termasuk pertama dan terakhir)
      lastElement: array.slice(-(sumFirstAndLast - 1)), // Elemen terakhir
    };
  }
}
