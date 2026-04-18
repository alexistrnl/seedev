"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import LoginForm from "@/components/LoginForm"
import styles from "./login.module.css"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) router.push("/dashboard")
  }, [isAuthenticated, loading, router])

  if (loading) return null

  return (
    <main className={styles.page}>
      <div className={styles.logo}>SEEDEV</div>
      <LoginForm />
    </main>
  )
}
