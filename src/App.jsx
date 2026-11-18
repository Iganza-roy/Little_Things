import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Plus, Trash2, Pencil, X } from 'lucide-react'
import './App.css'

const STORAGE_KEY = 'little-things-memories'

const COLORS = {
  Sage: '#D9E0D1',
  'Dusty Rose': '#E9D5D2',
  Lavender: '#E3DCEB',
  Sand: '#E4D4B9',
}

const CATEGORIES = ['Thoughts', 'People', 'Places', 'Music', 'Conversations', 'Random Moments']

const sampleMemories = [
  {
    id: 'sample-conversation',
    title: 'That conversation.',
    description: 'Some conversations stay with you long after they’re over.',
    date: '2026-11-12',
    category: 'People',
    color: 'Sage',
    createdAt: '2026-11-12T12:00:00.000Z',
    updatedAt: '2026-11-12T12:00:00.000Z',
  },
  {
    id: 'sample-afternoon',
    title: 'A quiet afternoon.',
    description: 'No plans. No noise. A cup of tea and some music.',
    date: '2026-11-14',
    category: 'Random Moments',
    color: 'Dusty Rose',
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
  },
  {
    id: 'sample-moon',
    title: 'Midnight thoughts.',
    description: 'I wonder how many people are looking at the same moon.',
    date: '2026-11-16',
    category: 'Thoughts',
    color: 'Lavender',
    createdAt: '2026-11-16T12:00:00.000Z',
    updatedAt: '2026-11-16T12:00:00.000Z',
  },
  {
    id: 'sample-music',
    title: 'Currently listening.',
    description: 'A song I wish I could hear for the first time again.',
    date: '2026-11-17',
    category: 'Music',
    color: 'Sand',
    createdAt: '2026-11-17T12:00:00.000Z',
    updatedAt: '2026-11-17T12:00:00.000Z',
  },
]

function loadMemories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // Fall back to a fresh collection if browser storage is unavailable.
  }
  return sampleMemories
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T12:00:00`)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date).toUpperCase()
}

function todayString() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10)
}

function Modal({ children, onClose, label }) {
  const panelRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    panelRef.current?.focus()
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.classList.remove('modal-open')
      previous?.focus()
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} className="modal-panel" role="dialog" aria-modal="true" aria-label={label} tabIndex="-1">
        {children}
      </div>
    </div>
  )
}

function MemoryFormModal({ memory, onClose, onSave }) {
  const [form, setForm] = useState({
    title: memory?.title ?? '',
    description: memory?.description ?? '',
    date: memory?.date ?? todayString(),
    category: memory?.category ?? 'Random Moments',
    color: memory?.color ?? 'Sage',
  })
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Please give this little thing a name.'
    if (!form.description.trim()) nextErrors.description = 'Add a few words you would like to remember.'
    if (!form.date) nextErrors.date = 'Choose a date.'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onSave({
      ...memory,
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      id: memory?.id ?? crypto.randomUUID(),
      createdAt: memory?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <Modal onClose={onClose} label={memory ? 'Edit memory' : 'Preserve a little thing'}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
      <div className="form-heading">
        <span className="eyebrow">{memory ? 'Exhibit notes' : 'New exhibit'}</span>
        <h2>{memory ? 'Edit this little thing.' : 'Preserve a little thing.'}</h2>
        <p>Some things are worth keeping.</p>
      </div>
      <form onSubmit={submit} noValidate>
        <label className="field">
          <span>Memory title</span>
          <input
            value={form.title}
            onChange={(event) => update('title', event.target.value)}
            placeholder="Give this little thing a name..."
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <small className="field-error">{errors.title}</small>}
        </label>
        <label className="field">
          <span>Description</span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
            placeholder="What happened? What do you want to remember about it?"
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <small className="field-error">{errors.description}</small>}
        </label>
        <div className="form-row">
          <label className="field date-field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
            {errors.date && <small className="field-error">{errors.date}</small>}
          </label>
          <fieldset className="field category-field">
            <legend>Category</legend>
            <div className="category-chips">
              {CATEGORIES.map((category) => (
                <button
                  className={form.category === category ? 'chip active' : 'chip'}
                  type="button"
                  key={category}
                  onClick={() => update('category', category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <fieldset className="field color-field">
          <legend>Card color</legend>
          <div className="swatches">
            {Object.entries(COLORS).map(([name, color]) => (
              <button
                type="button"
                key={name}
                className={form.color === name ? 'swatch active' : 'swatch'}
                style={{ '--swatch': color }}
                onClick={() => update('color', name)}
                aria-label={name}
                title={name}
              />
            ))}
          </div>
        </fieldset>
        <div className="modal-actions">
          <button type="button" className="text-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">Save this little thing</button>
        </div>
      </form>
    </Modal>
  )
}

function DetailModal({ memory, onClose, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <Modal onClose={onClose} label={memory.title}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close"><X size={18} /></button>
      <article className="detail-exhibit" style={{ '--card-color': COLORS[memory.color] }}>
        <div className="detail-meta">
          <span>MEMORY EXHIBIT</span>
          <span>{formatDate(memory.date)}</span>
        </div>
        <div className="detail-copy">
          <h2>{memory.title}</h2>
          <p>{memory.description}</p>
          <span className="detail-category">#{memory.category.toUpperCase()}</span>
        </div>
      </article>
      {confirmDelete ? (
        <div className="delete-confirm">
          <p>Remove this memory from your museum?</p>
          <div>
            <button type="button" className="text-button" onClick={() => setConfirmDelete(false)}>Keep it</button>
            <button type="button" className="danger-button" onClick={() => onDelete(memory.id)}><Trash2 size={15} /> Delete memory</button>
          </div>
        </div>
      ) : (
        <div className="detail-actions">
          <button type="button" className="text-button danger-link" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</button>
          <button type="button" className="primary-button" onClick={() => onEdit(memory)}><Pencil size={15} /> Edit memory</button>
        </div>
      )}
    </Modal>
  )
}

function MemoryCard({ memory, index, onOpen }) {
  return (
    <button
      type="button"
      className={`memory-card card-${index % 4}`}
      style={{ '--card-color': COLORS[memory.color] }}
      onClick={() => onOpen(memory)}
      aria-label={`Open memory: ${memory.title}`}
    >
      <div className="card-top"><span>{formatDate(memory.date)}</span><span className="exhibit-number">Nº {String(index + 1).padStart(2, '0')}</span></div>
      <h3>{memory.title}</h3>
      <p>{memory.description}</p>
      <div className="card-category">#{memory.category.toUpperCase()}</div>
    </button>
  )
}

function App() {
  const [memories, setMemories] = useState(loadMemories)
  const [formMemory, setFormMemory] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [detailMemory, setDetailMemory] = useState(null)
  const [featuredId] = useState(() => {
    const initial = loadMemories()
    return initial.length ? initial[Math.floor(Math.random() * initial.length)].id : null
  })
  const [rediscovering, setRediscovering] = useState(false)
  const [currentDate] = useState(() => new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date()).toUpperCase())
  const previousMemoryId = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories))
    } catch {
      // The app remains usable even if storage is restricted.
    }
  }, [memories])

  const featured = memories.find((item) => item.id === featuredId) ?? memories[0]

  function openCreate() {
    setFormMemory(null)
    setFormOpen(true)
  }

  function saveMemory(memory) {
    setMemories((current) => {
      const exists = current.some((item) => item.id === memory.id)
      return exists
        ? current.map((item) => item.id === memory.id ? memory : item)
        : [memory, ...current]
    })
    setFormOpen(false)
  }

  function deleteMemory(id) {
    setMemories((current) => current.filter((item) => item.id !== id))
    setDetailMemory(null)
  }

  function takeMeSomewhere() {
    if (!memories.length) {
      openCreate()
      return
    }
    setRediscovering(true)
    window.setTimeout(() => {
      const candidates = memories.length > 1
        ? memories.filter((item) => item.id !== previousMemoryId.current)
        : memories
      const selected = candidates[Math.floor(Math.random() * candidates.length)]
      previousMemoryId.current = selected.id
      setDetailMemory(selected)
      setRediscovering(false)
    }, 650)
  }

  return (
    <div className="app-shell">
      {rediscovering && (
        <div className="rediscovery-toast" role="status">Taking you back to a little moment...</div>
      )}
      <header className="masthead">
        <div className="masthead-inner">
          <a className="brand" href="#top" aria-label="Little Things home">
            <span>little things.</span>
            <small>YOUR PERSONAL MUSEUM</small>
          </a>
          <div className="masthead-actions">
            <div className="collection-count"><strong>{String(memories.length).padStart(2, '0')}</strong><span>LITTLE THINGS<br />COLLECTED</span></div>
            <button type="button" className="add-button" onClick={openCreate}><Plus size={16} /> Add a little thing</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="introduction">
          <div>
            <span className="eyebrow">EST. 2026 · PERSONAL ARCHIVE</span>
            <h1>A collection of things<br />worth remembering.</h1>
          </div>
          <div className="intro-aside">
            <p>Some moments are too small to write down,<br />but too lovely to forget.</p>
            <time>{currentDate}</time>
          </div>
        </section>

        <section className="featured-section">
          <div className="section-rule"><span>01</span><h2>One thing worth remembering.</h2><span /></div>
          {featured ? (
            <button
              type="button"
              className="featured-exhibit"
              style={{ '--card-color': COLORS[featured.color] }}
              onClick={() => setDetailMemory(featured)}
            >
              <div className="featured-label"><span>CURRENT EXHIBIT</span><span>Nº 001</span></div>
              <div className="featured-copy">
                <time>{formatDate(featured.date)}</time>
                <h3>{featured.title}</h3>
                <p>{featured.description}</p>
              </div>
              <div className="featured-footer"><span>#{featured.category.toUpperCase()}</span><ArrowUpRight size={20} /></div>
            </button>
          ) : (
            <div className="featured-empty">
              <span className="empty-mark">∅</span>
              <p>Every museum starts somewhere.</p>
              <button type="button" className="primary-button" onClick={openCreate}>Add your first little thing</button>
            </div>
          )}
        </section>

        <section className="collection-section">
          <div className="collection-heading">
            <div className="section-rule"><span>02</span><h2>Your little museum.</h2><span /></div>
            <p>A few moments you've decided to keep.</p>
          </div>
          {memories.length ? (
            <>
              <div className="memory-grid">
                {memories.map((memory, index) => (
                  <MemoryCard key={memory.id} memory={memory} index={index} onOpen={setDetailMemory} />
                ))}
              </div>
              <button type="button" className="rediscover-button" onClick={takeMeSomewhere}>
                <span>Take me somewhere</span><ArrowUpRight size={16} />
              </button>
            </>
          ) : (
            <div className="collection-empty">
              <span>Nothing here just yet.</span>
              <h3>Your little museum is waiting for its first exhibit.</h3>
              <button type="button" className="primary-button" onClick={openCreate}>Add your first little thing</button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>“Life happens in the little things.”</p>
        <div><span>{String(memories.length).padStart(2, '0')} LITTLE THINGS COLLECTED</span><span>EST. 2026</span><strong>little things.</strong></div>
      </footer>

      {formOpen && <MemoryFormModal memory={formMemory} onClose={() => setFormOpen(false)} onSave={saveMemory} />}
      {detailMemory && (
        <DetailModal
          memory={detailMemory}
          onClose={() => setDetailMemory(null)}
          onEdit={(memory) => {
            setDetailMemory(null)
            setFormMemory(memory)
            setFormOpen(true)
          }}
          onDelete={deleteMemory}
        />
      )}
    </div>
  )
}

export default App
