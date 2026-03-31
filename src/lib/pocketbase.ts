import PocketBase from "pocketbase"

const PB_URL =
  process.env.NEXT_PUBLIC_PB_URL || "http://145.223.33.70:8090"

let pb: PocketBase

if (typeof window !== "undefined") {
  // Client-side singleton
  if (!(globalThis as any).__pb) {
    ;(globalThis as any).__pb = new PocketBase(PB_URL)
  }
  pb = (globalThis as any).__pb
} else {
  pb = new PocketBase(PB_URL)
}

export default pb
