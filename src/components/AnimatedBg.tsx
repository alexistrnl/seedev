import "./AnimatedBg.css"

export default function AnimatedBg() {
  return (
    <div className="abg" aria-hidden="true">
      <div className="abg__blob abg__blob--1" />
      <div className="abg__blob abg__blob--2" />
      <div className="abg__blob abg__blob--3" />
      <div className="abg__grid" />
    </div>
  )
}
