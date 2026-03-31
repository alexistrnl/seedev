"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, signup } from "@/lib/auth"
import "./LoginForm.css"

export default function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [inviteCode, setInviteCode] = useState("")

  function switchMode(next: "login" | "signup") {
    setMode(next)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await signup(firstName, lastName, email, password, inviteCode)
      }
      router.push("/dashboard")
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form">
      <div className="login-form__tabs">
        <button
          className={`login-form__tab ${mode === "login" ? "login-form__tab--active" : ""}`}
          onClick={() => switchMode("login")}
          type="button"
        >
          Connexion
        </button>
        <button
          className={`login-form__tab ${mode === "signup" ? "login-form__tab--active" : ""}`}
          onClick={() => switchMode("signup")}
          type="button"
        >
          Créer mon compte
        </button>
      </div>

      <form className="login-form__body" onSubmit={handleSubmit}>
        {mode === "signup" && (
          <>
            <div className="login-form__row">
              <div className="login-form__field">
                <label>Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="login-form__field">
                <label>Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="login-form__field">
              <label>Code d'invitation</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim().toUpperCase())}
                required
                autoComplete="off"
                placeholder="SEED-XXXX-XXXX"
                className="login-form__code-input"
              />
              <span className="login-form__hint">
                Fourni avec votre contrat signé
              </span>
            </div>
          </>
        )}

        <div className="login-form__field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="login-form__field">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
          />
        </div>

        {error && <p className="login-form__error">{error}</p>}

        <button className="login-form__submit" type="submit" disabled={loading}>
          {loading
            ? "Chargement…"
            : mode === "login"
            ? "Se connecter"
            : "Créer mon compte"}
        </button>
      </form>
    </div>
  )
}
