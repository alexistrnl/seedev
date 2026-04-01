import PocketBase from "pocketbase"

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://pb.seedev.fr"

let pb: PocketBase

if (typeof window !== "undefined") {
  if (!(globalThis as any).__pb) {
    ;(globalThis as any).__pb = new PocketBase(PB_URL)
  }
  pb = (globalThis as any).__pb
} else {
  pb = new PocketBase(PB_URL)
}

export default pb