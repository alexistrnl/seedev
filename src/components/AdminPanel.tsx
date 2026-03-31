"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import pb from "@/lib/pocketbase"
import { logout } from "@/lib/auth"
import { useAuth } from "@/hooks/useAuth"
import Chat from "./Chat"
import "./AdminPanel.css"

const STATUS_OPTIONS = [
  { value: "quote_sent",  label: "Devis envoyé" },
  { value: "in_progress", label: "En cours" },
  { value: "delivered",   label: "Livré" },
]

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `SEED-${seg()}-${seg()}`
}

export default function AdminPanel() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [view, setView] = useState<"clients" | "codes">("clients")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // ── Clients ──
  const [clients, setClients]     = useState<any[]>([])
  const [selected, setSelected]   = useState<any>(null)
  const [project, setProject]     = useState<any>(null)
  const [updating, setUpdating]   = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [siteUrl, setSiteUrl]     = useState("")
  const [siteDesc, setSiteDesc]   = useState("")

  // ── Codes ──
  const [codes, setCodes]         = useState<any[]>([])
  const [codeLabel, setCodeLabel] = useState("")
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied]       = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/")
      else if (!user.is_admin) router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.is_admin) {
      loadClients()
      loadCodes()
    }
  }, [user])

  // ── Clients ──
  async function loadClients() {
    try {
      const result = await pb.collection("projects").getList(1, 100, {
        expand: "owner",
        sort: "-created",
        $autoCancel: false,
      })
      setClients(result.items)
    } catch {}
  }

  function selectClient(proj: any) {
    setSelected(proj)
    setProject(proj)
    setSiteUrl(proj.site_url || "")
    setSiteDesc(proj.site_description || "")
  }

  async function updateStatus(status: string) {
    if (!project) return
    setUpdating(true)
    try {
      const updated = await pb.collection("projects").update(project.id, { status })
      setProject(updated)
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, status: updated.status } : c))
      )
    } finally {
      setUpdating(false)
    }
  }

  async function saveDelivery() {
    if (!project) return
    setUpdating(true)
    try {
      const updated = await pb.collection("projects").update(project.id, {
        site_url: siteUrl,
        site_description: siteDesc,
        status: "delivered",
      })
      setProject(updated)
    } finally {
      setUpdating(false)
    }
  }

  async function handleAdminFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length || !project) return
    setUploadingFile(true)
    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        formData.append("admin_files", file)
      }
      const updated = await pb.collection("projects").update(project.id, formData)
      setProject(updated)
    } catch (err: any) {
      alert(`Erreur upload : ${err?.message || "Failed to fetch"}`)
    } finally {
      setUploadingFile(false)
      e.target.value = ""
    }
  }

  async function removeAdminFile(filename: string) {
    if (!project) return
    setUpdating(true)
    try {
      const updated = await pb.collection("projects").update(project.id, {
        "admin_files-": [filename],
      })
      setProject(updated)
    } finally {
      setUpdating(false)
    }
  }

  // ── Codes ──
  async function loadCodes() {
    const result = await pb.collection("invite_codes").getList(1, 200, {
      sort: "-created",
      expand: "used_by",
      $autoCancel: false,
    })
    setCodes(result.items)
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    try {
      const code = generateCode()
      const record = await pb.collection("invite_codes").create({
        code,
        ...(codeLabel.trim() ? { label: codeLabel.trim() } : {}),
      }, { $autoCancel: false })
      setCodes((prev) => [record, ...prev])
      setCodeLabel("")
    } catch (err: any) {
      console.error("PB create invite_code error:", JSON.stringify(err, null, 2))
      alert(`Erreur : ${err?.message}\n\nDétails console (F12)`)
    } finally {
      setGenerating(false)
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleLogout() {
    logout()
    router.push("/")
  }

  if (loading || !user?.is_admin) return null

  return (
    <div className="admin">
      <header className="admin__header">
        <span className="admin__logo">SEEDEV</span>
        <div className="admin__header-center">
          <button
            className={`admin__nav-tab ${view === "clients" ? "admin__nav-tab--active" : ""}`}
            onClick={() => setView("clients")}
            type="button"
          >
            Clients
          </button>
          <button
            className={`admin__nav-tab ${view === "codes" ? "admin__nav-tab--active" : ""}`}
            onClick={() => setView("codes")}
            type="button"
          >
            Codes d'invitation
          </button>
        </div>
        <div className="admin__header-right">
          <span className="admin__badge">Admin</span>
          <button className="admin__logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      {view === "clients" && (
        <div className="admin__layout">

          {/* ── Sidebar clients ── */}
          <aside className={`admin__sidebar ${sidebarOpen ? "admin__sidebar--open" : "admin__sidebar--closed"}`}>
            <div className="admin__sidebar-header">
              {sidebarOpen && <p className="admin__sidebar-title stag">Clients</p>}
              <button className="admin__sidebar-toggle" onClick={() => setSidebarOpen((v) => !v)} type="button">
                {sidebarOpen ? "←" : "→"}
              </button>
            </div>
            <ul className="admin__client-list">
              {clients.length === 0 && (
                <li className="admin__client-empty">Aucun client pour l'instant.</li>
              )}
              {clients.map((proj) => (
                <li
                  key={proj.id}
                  className={`admin__client-item ${selected?.id === proj.id ? "admin__client-item--active" : ""}`}
                  onClick={() => selectClient(proj)}
                >
                  <span className="admin__client-name">
                    {proj.expand?.owner?.name || proj.expand?.owner?.email || "—"}
                  </span>
                  <span className={`admin__client-status admin__client-status--${proj.status}`}>
                    {STATUS_OPTIONS.find((s) => s.value === proj.status)?.label || proj.status}
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          {project ? (
            <>
              {/* ── Colonne infos ── */}
              <div className="admin__info">

                <div className="admin__info-section">
                  <p className="admin__card-title">Statut</p>
                  <div className="admin__status-btns">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s.value}
                        className={`admin__status-btn ${project.status === s.value ? "admin__status-btn--active" : ""}`}
                        onClick={() => updateStatus(s.value)}
                        disabled={updating}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin__info-section">
                  <p className="admin__card-title">Cahier des charges</p>
                  {project.brief_file ? (
                    <a
                      href={pb.files.getURL(project, project.brief_file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin__file-name-link"
                    >
                      📄 {String(Array.isArray(project.brief_file) ? project.brief_file[0] : project.brief_file).replace(/_[a-z0-9]+(\.[^.]+)$/i, "$1")}
                    </a>
                  ) : (
                    <p className="admin__muted">Aucun fichier.</p>
                  )}
                  <label className="admin__upload-label" style={{ marginTop: 8 }}>
                    {uploadingFile ? "Envoi…" : project.brief_file ? "Remplacer" : "Déposer"}
                    <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadingFile(true)
                        try {
                          console.log("auth valid:", pb.authStore.isValid, "project.id:", project.id, "PB url:", pb.baseURL)
                          const fd = new FormData()
                          fd.append("brief_file", file)
                          setProject(await pb.collection("projects").update(project.id, fd))
                        } catch (err: any) {
                          console.error("brief_file upload error:", JSON.stringify(err, null, 2))
                          alert(`Erreur upload : ${err?.status} — ${err?.message}\n${JSON.stringify(err?.data)}`)
                        } finally { setUploadingFile(false); e.target.value = "" }
                      }}
                      disabled={uploadingFile} style={{ display: "none" }} />
                  </label>
                </div>

                <div className="admin__info-section">
                  <p className="admin__card-title">Documents client</p>
                  {(() => {
                    const files: string[] = Array.isArray(project.admin_files)
                      ? project.admin_files
                      : project.admin_files ? [project.admin_files] : []
                    return (
                      <>
                        {files.length > 0 && (
                          <ul className="admin__file-list">
                            {files.map((f) => (
                              <li key={f} className="admin__file-item">
                                <a href={pb.files.getURL(project, f)} target="_blank" rel="noopener noreferrer" className="admin__brief-link">
                                  📄 {String(f).replace(/_[a-z0-9]+(\.[^.]+)$/i, "$1")}
                                </a>
                                <button className="admin__file-remove" onClick={() => removeAdminFile(f)} disabled={updating} type="button">×</button>
                              </li>
                            ))}
                          </ul>
                        )}
                        <label className="admin__upload-label" style={{ marginTop: files.length ? 12 : 0 }}>
                          {uploadingFile ? "Envoi…" : "Ajouter un fichier"}
                          <input type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                            onChange={handleAdminFileUpload} disabled={uploadingFile} style={{ display: "none" }} />
                        </label>
                      </>
                    )
                  })()}
                </div>

                <div className="admin__info-section">
                  <p className="admin__card-title">Livraison</p>
                  <div className="admin__field">
                    <label>URL du site</label>
                    <input type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="admin__field">
                    <label>Description</label>
                    <textarea value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} rows={2} placeholder="Description courte" />
                  </div>
                  <button className="admin__save-btn" onClick={saveDelivery} disabled={updating || !siteUrl}>
                    Marquer comme livré
                  </button>
                </div>
              </div>

              {/* ── Colonne chat ── */}
              <div className="admin__chat-col">
                <div className="admin__chat-header">
                  <p className="admin__card-title" style={{ margin: 0 }}>Messages</p>
                </div>
                <div className="admin__chat-body">
                  <Chat projectId={project.id} currentUserId={user.id} />
                </div>
              </div>
            </>
          ) : (
            <div className="admin__empty-col">
              <p className="admin__empty">Sélectionnez un client.</p>
            </div>
          )}
        </div>
      )}

      {view === "codes" && (
        <div className="admin__codes-view">
          <div className="admin__codes-generate">
            <h2 className="admin__codes-title">Générer un code</h2>
            <form className="admin__codes-form" onSubmit={handleGenerate}>
              <div className="admin__field admin__field--inline">
                <label>Label <span className="admin__optional">(optionnel)</span></label>
                <input
                  type="text"
                  value={codeLabel}
                  onChange={(e) => setCodeLabel(e.target.value)}
                  placeholder="ex : Client Dupont — Avril 2026"
                />
              </div>
              <button className="admin__save-btn" type="submit" disabled={generating}>
                {generating ? "Génération…" : "Générer un code"}
              </button>
            </form>
          </div>

          <div className="admin__codes-list">
            <h2 className="admin__codes-title">
              Codes existants
              <span className="admin__codes-count">{codes.length}</span>
            </h2>
            {codes.length === 0 ? (
              <p className="admin__muted">Aucun code généré pour l'instant.</p>
            ) : (
              <table className="admin__codes-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Label</th>
                    <th>Statut</th>
                    <th>Utilisé par</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className={c.used ? "admin__codes-row--used" : ""}>
                      <td className="admin__codes-code">{c.code}</td>
                      <td className="admin__codes-label">{c.label || <span className="admin__muted">—</span>}</td>
                      <td>
                        <span className={`admin__codes-status ${c.used ? "admin__codes-status--used" : "admin__codes-status--free"}`}>
                          {c.used ? "Utilisé" : "Disponible"}
                        </span>
                      </td>
                      <td className="admin__codes-usedby">
                        {c.expand?.used_by?.name || (c.used ? c.expand?.used_by?.email : <span className="admin__muted">—</span>)}
                      </td>
                      <td>
                        {!c.used && (
                          <button
                            className="admin__codes-copy"
                            onClick={() => copyCode(c.code)}
                            type="button"
                          >
                            {copied === c.code ? "Copié ✓" : "Copier"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
