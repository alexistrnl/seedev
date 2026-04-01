"use client"

export default function ScrollToContact({ className }: { className?: string }) {
  return (
    <button
      className={className}
      onClick={() =>
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
      }
    >
      Prendre un RDV
    </button>
  )
}
