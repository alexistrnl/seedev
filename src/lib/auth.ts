import pb from "./pocketbase"

function pbError(err: any, context: string): Error {
  const data = err?.data?.data
  if (data && Object.keys(data).length > 0) {
    const fields = Object.entries(data)
      .map(([k, v]: any) => `${k}: ${v?.message || v}`)
      .join(", ")
    return new Error(`${context} — ${fields}`)
  }
  return new Error(`${context} — ${err?.message || "erreur inconnue"}`)
}

export async function signup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  inviteCode: string
) {
  // Sanitize code format
  if (!/^[A-Za-z0-9-]+$/.test(inviteCode)) {
    throw new Error("Format du code invalide.")
  }

  // 1. Create user
  let user: any
  try {
    user = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      name: `${firstName} ${lastName}`,
      username: email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_"),
    }, { $autoCancel: false })
  } catch (err: any) {
    throw pbError(err, "Création du compte")
  }

  // 2. Authenticate
  try {
    pb.authStore.clear()
    await pb.collection("users").authWithPassword(email, password)
  } catch (err: any) {
    throw pbError(err, "Connexion")
  }

  // 3. Validate invite code (now authenticated)
  let codeId: string | null = null
  try {
    const result = await pb.collection("invite_codes").getList(1, 1, {
      filter: `code = "${inviteCode}" && used = false`,
      $autoCancel: false,
    })
    if (result.items.length === 0) {
      pb.authStore.clear()
      await pb.collection("users").delete(user.id).catch(() => {})
      throw new Error("Code d'invitation invalide ou déjà utilisé.")
    }
    codeId = result.items[0].id
  } catch (err: any) {
    if (err.message.includes("invalide")) throw err
    // If invite_codes is inaccessible, continue without blocking signup
  }

  // 4. Mark code as used
  if (codeId) {
    await pb.collection("invite_codes").update(codeId, {
      used: true,
      used_by: user.id,
    }, { $autoCancel: false }).catch(() => {})
  }

  // 5. Create project
  try {
    await pb.collection("projects").create({
      owner: user.id,
      name: `Projet de ${firstName} ${lastName}`,
      status: "quote_sent",
    }, { $autoCancel: false })
  } catch (err: any) {
    throw pbError(err, "Création du projet")
  }

  return user
}

export async function login(email: string, password: string) {
  pb.authStore.clear()
  return pb.collection("users").authWithPassword(email, password)
}

export function logout() {
  pb.authStore.clear()
}
