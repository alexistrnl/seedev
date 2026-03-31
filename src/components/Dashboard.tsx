"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import pb from "@/lib/pocketbase"
import { logout } from "@/lib/auth"
import { useAuth } from "@/hooks/useAuth"
import Chat from "./Chat"
import "./Dashboard.css"

const STATUS_LABELS: Record<string, string> = {
  quote_sent:  "Devis envoyé",
  in_progress: "En cours de développement",
  delivered:   "Livré",
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    if (user) loadProject()
  }, [user])

  useEffect(() => {
    if (!project?.id) return
    const unsubscribe = pb.collection("projects").subscribe(project.id, (e) => {
      if (e.action === "update") setProject(e.record)
    })
    return () => { unsubscribe.then((fn) => fn()) }
  }, [project?.id])

  async function loadProject() {
    try {
      const result = await pb.collection("projects").getFirstListItem(
        `owner = "${user!.id}"`,
        { $autoCancel: false }
      )
      setProject(result)
    } catch {}
  }

  async function handleLogout() {
    logout()
    router.push("/")
  }

  if (loading || !user) return null

  const adminFiles: string[] = Array.isArray(project?.admin_files)
    ? project.admin_files
    : project?.admin_files ? [project.admin_files] : []

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <span className="dashboard__logo">SEEDEV</span>
        <div className="dashboard__header-right">
          <span className="dashboard__user">{user.name}</span>
          <button className="dashboard__logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      {project ? (
        <div className="dashboard__body">

          {/* ── Colonne gauche ── */}
          <aside className="dashboard__left">

            <div className="dashboard__section">
              <p className="dashboard__section-label stag">Mon projet</p>
              <p className="dashboard__project-name">{project.name}</p>
              <span className={`dashboard__status dashboard__status--${project.status}`}>
                {STATUS_LABELS[project.status] || project.status}
              </span>
              <p className="dashboard__project-date">
                Depuis le{" "}
                {new Date(project.created).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>

            {project.brief_file && (
              <div className="dashboard__section">
                <p className="dashboard__section-label stag">Cahier des charges</p>
                <div className="dashboard__file-row">
                  <span className="dashboard__file-name">{project.brief_file}</span>
                  <a
                    href={pb.files.getURL(project, project.brief_file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dashboard__file-link"
                  >
                    Télécharger
                  </a>
                </div>
              </div>
            )}

            {adminFiles.length > 0 && (
              <div className="dashboard__section">
                <p className="dashboard__section-label stag">Documents Seedev</p>
                <ul className="dashboard__file-list">
                  {adminFiles.map((f) => (
                    <li key={f} className="dashboard__file-row">
                      <span className="dashboard__file-name">{f}</span>
                      <a
                        href={pb.files.getURL(project, f)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dashboard__file-link"
                      >
                        Télécharger
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.status === "delivered" && project.site_url && (
              <div className="dashboard__section dashboard__section--gold">
                <p className="dashboard__section-label stag">Votre site est en ligne</p>
                <p className="dashboard__delivered-desc">{project.site_description}</p>
                <a
                  href={project.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dashboard__delivered-link"
                >
                  {project.site_url} ↗
                </a>
              </div>
            )}
          </aside>

          {/* ── Colonne droite : chat ── */}
          <div className="dashboard__right">
            <div className="dashboard__chat-header">
              <p className="dashboard__section-label stag">Messages</p>
            </div>
            <div className="dashboard__chat-body">
              <Chat projectId={project.id} currentUserId={user.id} />
            </div>
          </div>

        </div>
      ) : (
        <div className="dashboard__empty">
          <p>Chargement de votre projet…</p>
        </div>
      )}
    </div>
  )
}
