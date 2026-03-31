"use client"

import { useEffect, useState } from "react"
import pb from "@/lib/pocketbase"
import type { RecordModel } from "pocketbase"

interface AuthState {
  user: RecordModel | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: pb.authStore.record,
    loading: false,
    isAuthenticated: pb.authStore.isValid,
  })

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setState({
        user: pb.authStore.record,
        loading: false,
        isAuthenticated: pb.authStore.isValid,
      })
    })

    return () => unsubscribe()
  }, [])

  return state
}
