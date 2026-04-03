"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import LoginForm from "@/components/LoginForm"
import AnimatedBg from "@/components/AnimatedBg"
import styles from "./login.module.css"

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) router.push("/dashboard")
  }, [isAuthenticated, loading, router])

  if (loading) return null

  return (
    <>
      <AnimatedBg />
      <main className={styles.page} style={{ position: "relative", zIndex: 1 }}>
        <div className={styles.logo}>SEEDEV</div>
        <LoginForm />
      </main>
    </>
  )
}
