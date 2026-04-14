// Secret Admin — Acts of Attention observation manager

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Load Trade Gothic Heavy + Neue Haas Grotesk
const fontStyle = document.createElement("style")
fontStyle.textContent = `
  @font-face {
    font-family: 'Trade Gothic Heavy';
    src: url('/fonts/TradeGothicNextLTPro-Hv.otf') format('opentype');
    font-weight: 800;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Neue Haas Grotesk';
    src: url('/fonts/NHaasGroteskDSPro-65Md.otf') format('opentype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }
  .secret-root, .secret-root * { cursor: auto !important; }
  .secret-root button, .secret-root a { cursor: pointer !important; }
`
if (!document.querySelector('[data-secret-fonts]')) {
  fontStyle.setAttribute('data-secret-fonts', '')
  document.head.appendChild(fontStyle)
}

type Observation = {
  id: string
  text: string
  lat: number
  lng: number
  created_at: string
  observer_id: number
  image_url: string | null
}

export default function Secret() {
  useEffect(() => { document.title = "Admin — Acts of Attention" }, [])


  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState(false)
  const [editConfirmation, setEditConfirmation] = useState(false)
  const editRef = useRef<HTMLTextAreaElement>(null)

  const loadObservations = useCallback(async () => {
    const { data, error } = await supabase
      .from("observations")
      .select("id, text, lat, lng, created_at, observer_id")
      .order("created_at", { ascending: false })
    if (error) { console.error("Failed to load:", error); return }
    setObservations((data || []) as Observation[])
    setLoading(false)
  }, [])

  useEffect(() => { loadObservations() }, [loadObservations])

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus()
      editRef.current.selectionStart = editRef.current.value.length
    }
  }, [editingId])

  const startEdit = (obs: Observation) => {
    setEditingId(obs.id)
    setEditText(obs.text)
    setConfirmDeleteId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return
    const { error } = await supabase
      .from("observations")
      .update({ text: editText.trim().toLowerCase() })
      .eq("id", editingId)
    if (error) { console.error("Failed to update:", error); return }
    setObservations(prev =>
      prev.map(o => o.id === editingId ? { ...o, text: editText.trim().toLowerCase() } : o)
    )
    setEditingId(null)
    setEditText("")
    setEditConfirmation(true)
    setTimeout(() => setEditConfirmation(false), 2000)
  }

  const deleteObservation = async (id: string) => {
    const { error, count } = await supabase.from("observations").delete({ count: "exact" }).eq("id", id)
    if (error) { console.error("Failed to delete:", error); alert(`Delete failed: ${error.message}`); return }
    if (count === 0) { alert("Delete blocked — check Supabase RLS policies"); return }
    setObservations(prev => prev.filter(o => o.id !== id))
    setConfirmDeleteId(null)
    setDeleteConfirmation(true)
    setTimeout(() => setDeleteConfirmation(false), 2000)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      + " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  return (
    <div
      className="secret-root"
      style={{
        minHeight: "100dvh",
        background: "#ffffff",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {/* Edit confirmation */}
      {editConfirmation && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          background: "#22c55e", color: "#ffffff",
          padding: "10px 32px",
          fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
          fontSize: 12, fontWeight: 500,
          textAlign: "center",
          zIndex: 50,
        }}>
          Observation updated
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmation && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          background: "#22c55e", color: "#ffffff",
          padding: "10px 32px",
          fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
          fontSize: 12, fontWeight: 500,
          textAlign: "center",
          zIndex: 50,
        }}>
          Observation deleted
        </div>
      )}

      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#ffffff",
          borderBottom: "1.5px solid #1a1a1a",
          padding: "20px 32px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              transform: "scaleX(0.75)",
              transformOrigin: "left",
              display: "inline-block",
              color: "#1a1a1a",
            }}
          >
            Acts of Attention
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            admin
          </span>
        </div>
        <span
          style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            fontSize: 9,
            letterSpacing: "0.1em",
            color: "rgba(0,0,0,0.3)",
          }}
        >
          {observations.length} observation{observations.length !== 1 ? "s" : ""}
        </span>
        <a
          href="/"
          style={{
            fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
            fontSize: 9,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#ffffff",
            textDecoration: "none",
            background: "#1a1a1a",
            padding: "8px 16px",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.7" }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
        >
          View Map
        </a>
      </div>

      {/* List */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px 80px" }}>
        {loading && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            loading...
          </div>
        )}

        {observations.map((obs, i) => (
          <div
            key={obs.id}
            style={{
              borderBottom: i < observations.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
              padding: "16px 0",
            }}
          >
            {/* Metadata row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    color: "rgba(0,0,0,0.25)",
                  }}
                >
                  {formatDate(obs.created_at)}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    color: "rgba(0,0,0,0.2)",
                  }}
                >
                  {obs.lat.toFixed(4)}°N {Math.abs(obs.lng).toFixed(4)}°W
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {editingId === obs.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      onMouseEnter={e => { e.currentTarget.style.color = "#1a1a1a" }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#1a1a1a" }}
                      style={{
                        fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        transform: "scaleX(0.8)",
                        color: "#1a1a1a",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px 0",
                        transition: "color 0.15s",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      onMouseEnter={e => { e.currentTarget.style.color = "#1a1a1a" }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(0,0,0,0.25)" }}
                      style={{
                        fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        transform: "scaleX(0.8)",
                        color: "rgba(0,0,0,0.25)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px 0",
                        transition: "color 0.15s",
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(obs)}
                      style={{
                        fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        transform: "scaleX(0.8)",
                        color: "rgba(0,0,0,0.25)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px 0",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#1a1a1a" }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(0,0,0,0.25)" }}
                    >
                      Edit
                    </button>
                    {confirmDeleteId === obs.id ? (
                      <>
                        <span
                          style={{
                            fontSize: 9,
                            letterSpacing: "0.1em",
                            color: "#FF2A00",
                            alignSelf: "center",
                          }}
                        >
                          sure?
                        </span>
                        <button
                          onClick={() => deleteObservation(obs.id)}
                          onMouseEnter={e => { e.currentTarget.style.color = "#FF2A00" }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(0,0,0,0.25)" }}
                          style={{
                            fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
                            fontSize: 9,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            transform: "scaleX(0.8)",
                            color: "rgba(0,0,0,0.25)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 0",
                            transition: "color 0.15s",
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          onMouseEnter={e => { e.currentTarget.style.color = "#1a1a1a" }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(0,0,0,0.25)" }}
                          style={{
                            fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
                            fontSize: 9,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            transform: "scaleX(0.8)",
                            color: "rgba(0,0,0,0.25)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 0",
                            transition: "color 0.15s",
                          }}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setConfirmDeleteId(obs.id); setEditingId(null) }}
                        style={{
                          fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
                          fontSize: 9,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          transform: "scaleX(0.8)",
                          color: "rgba(0,0,0,0.25)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px 0",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#FF2A00" }}
                        onMouseLeave={e => { e.currentTarget.style.color = "rgba(0,0,0,0.25)" }}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Observation text */}
            {editingId === obs.id ? (
              <textarea
                ref={editRef}
                value={editText}
                onChange={e => setEditText(e.target.value.toLowerCase())}
                maxLength={200}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit() }
                  if (e.key === "Escape") cancelEdit()
                }}
                style={{
                  fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                  fontSize: 17,
                  lineHeight: 1.4,
                  fontWeight: 500,
                  color: "#1a1a1a",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid #FF2A00",
                  outline: "none",
                  width: "100%",
                  resize: "none",
                  padding: 0,
                  minHeight: 40,
                }}
              />
            ) : (
              <div
                style={{
                  fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                  fontSize: 17,
                  lineHeight: 1.4,
                  fontWeight: 500,
                  color: "#1a1a1a",
                }}
              >
                {obs.text}
              </div>
            )}
          </div>
        ))}

        {!loading && observations.length === 0 && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            no observations yet
          </div>
        )}
      </div>
    </div>
  )
}
