import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useDropzone } from 'react-dropzone'
import {
  Package, Plus, Trash2, Upload, Image, X, ChevronLeft, ShoppingBag,
  Eye, EyeOff, Edit3, Save, Check, AlertCircle, Search, Filter,
  FileText, DollarSign, Clock, CheckCircle, Send, ArrowRight,
  Menu, LogOut, Grid, List, ChevronRight, Star, Minus, Plane, Ship, Zap,
  TrendingUp
} from 'lucide-react'

// ─── STYLES ─────────────────────────────────────────────────────────────────
const s = {
  // Layout
  page: { minHeight: '100vh', background: '#FAFAFA' },
  adminLayout: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: 240, background: '#000', color: '#fff', padding: '32px 0',
    display: 'flex', flexDirection: 'column', position: 'fixed', top: 0,
    left: 0, bottom: 0, zIndex: 100
  },
  sidebarLogo: {
    padding: '0 24px 32px', borderBottom: '1px solid #222',
    marginBottom: 8, fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em',
    textTransform: 'uppercase'
  },
  sidebarLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px',
    fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#fff' : '#888',
    background: active ? '#1a1a1a' : 'transparent', cursor: 'pointer',
    border: 'none', width: '100%', textAlign: 'left', transition: 'all 0.15s'
  }),
  mainContent: { marginLeft: 240, flex: 1, padding: '32px 40px' },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 32
  },
  pageTitle: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#000' },

  // Cards
  card: {
    background: '#fff', borderRadius: 12, border: '1px solid #E5E5E5',
    overflow: 'hidden', transition: 'box-shadow 0.2s'
  },
  cardHover: { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },

  // Buttons
  btnPrimary: {
    background: '#000', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'opacity 0.15s'
  },
  btnSecondary: {
    background: '#fff', color: '#000', border: '1px solid #E5E5E5', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.15s'
  },
  btnDanger: {
    background: '#fff', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8
  },
  btnSmall: { padding: '6px 14px', fontSize: 13 },

  // Form
  label: { fontSize: 13, fontWeight: 600, color: '#000', marginBottom: 6, display: 'block' },
  input: {
    width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #E5E5E5',
    borderRadius: 8, outline: 'none', transition: 'border-color 0.15s',
    background: '#fff', color: '#000'
  },
  textarea: {
    width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #E5E5E5',
    borderRadius: 8, outline: 'none', minHeight: 100, resize: 'vertical',
    fontFamily: 'inherit', background: '#fff', color: '#000'
  },

  // Badges
  badge: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
    borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: color === 'green' ? '#DCFCE7' : color === 'amber' ? '#FEF3C7' :
      color === 'blue' ? '#DBEAFE' : color === 'red' ? '#FEE2E2' : '#F5F5F5',
    color: color === 'green' ? '#16A34A' : color === 'amber' ? '#D97706' :
      color === 'blue' ? '#2563EB' : color === 'red' ? '#DC2626' : '#555'
  }),

  // Storefront
  storeNav: {
    background: '#000', color: '#fff', padding: '16px 40px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'sticky', top: 0, zIndex: 50
  },
  storeLogo: {
    fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase'
  },
  storeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 24, padding: '40px'
  },
  productCard: {
    background: '#fff', borderRadius: 12, overflow: 'hidden',
    border: '1px solid #E5E5E5', cursor: 'pointer', transition: 'all 0.2s'
  },
  productImage: {
    width: '100%', height: 320, objectFit: 'cover', background: '#F5F5F5'
  },
  productInfo: { padding: '20px' },

  // Dropzone
  dropzone: (isDragActive) => ({
    border: `2px dashed ${isDragActive ? '#000' : '#D4D4D4'}`,
    borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer',
    background: isDragActive ? '#FAFAFA' : '#fff', transition: 'all 0.2s'
  }),

  // Table
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700,
    color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid #E5E5E5', background: '#FAFAFA'
  },
  td: {
    padding: '14px 16px', fontSize: 14, borderBottom: '1px solid #F5F5F5',
    color: '#000'
  },

  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20
  },
  modal: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640,
    maxHeight: '90vh', overflow: 'auto', padding: 32
  },
  modalLarge: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 900,
    maxHeight: '90vh', overflow: 'auto', padding: 32
  },
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatMoney = (n) => {
  if (n == null) return '—'
  return '$' + Number(n).toFixed(2)
}

const statusColors = {
  pending: 'amber', reviewed: 'blue', priced: 'blue', accepted: 'green', invoiced: 'green'
}

const uploadFile = async (bucket, file, path) => {
  const ext = file.name.split('.').pop()
  const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return publicUrl
}

// ─── CONFIRM MODAL ──────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={{ ...s.modal, maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <AlertCircle size={40} style={{ color: '#DC2626', marginBottom: 16 }} />
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{message}</p>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>This action cannot be undone.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button style={s.btnSecondary} onClick={onCancel}>Cancel</button>
          <button style={{ ...s.btnPrimary, background: '#DC2626' }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── IMAGE UPLOADER ─────────────────────────────────────────────────────────
function ImageUploader({ onUpload, label, multiple = false }) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (files) => {
    setUploading(true)
    try {
      const urls = []
      for (const file of files) {
        const url = await uploadFile('product-images', file, 'products')
        urls.push(url)
      }
      onUpload(multiple ? urls : urls[0])
    } catch (err) {
      console.error('Upload error:', err)
    }
    setUploading(false)
  }, [onUpload, multiple])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple
  })

  return (
    <div>
      {label && <label style={s.label}>{label}</label>}
      <div {...getRootProps()} style={s.dropzone(isDragActive)}>
        <input {...getInputProps()} />
        {uploading ? (
          <p style={{ fontSize: 14, color: '#555' }}>Uploading...</p>
        ) : (
          <>
            <Upload size={24} style={{ color: '#A3A3A3', marginBottom: 8, margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14, color: '#555', fontWeight: 500 }}>
              {isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}
            </p>
            <p style={{ fontSize: 12, color: '#A3A3A3', marginTop: 4 }}>PNG, JPG up to 10MB</p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── LOGO UPLOADER (for clients) ────────────────────────────────────────────
function LogoUploader({ onUpload, currentUrl }) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (files) => {
    setUploading(true)
    try {
      const url = await uploadFile('client-logos', files[0], 'logos')
      onUpload(url)
    } catch (err) {
      console.error('Upload error:', err)
    }
    setUploading(false)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'application/pdf': [] }, multiple: false
  })

  return (
    <div {...getRootProps()} style={{
      ...s.dropzone(isDragActive),
      padding: currentUrl ? 16 : 40,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
    }}>
      <input {...getInputProps()} />
      {currentUrl ? (
        <>
          <img src={currentUrl} alt="Logo" style={{ height: 80, objectFit: 'contain' }} />
          <p style={{ fontSize: 13, color: '#555' }}>Click to change logo</p>
        </>
      ) : uploading ? (
        <p style={{ fontSize: 14, color: '#555' }}>Uploading...</p>
      ) : (
        <>
          <Upload size={28} style={{ color: '#A3A3A3' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>Upload your logo</p>
          <p style={{ fontSize: 13, color: '#555' }}>PNG, JPG, PDF, or AI file</p>
        </>
      )}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════
// ADMIN SECTION
// ═══════════════════════════════════════════════════════════════════════════

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  const links = [
    { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
    { to: '/admin/quotes', icon: <FileText size={18} />, label: 'Quotes' },
  ]

  return (
    <div style={s.adminLayout}>
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>Create & Source</div>
        {links.map(l => (
          <button key={l.to} style={s.sidebarLink(path.startsWith(l.to))}
            onClick={() => navigate(l.to)}>
            {l.icon} {l.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={s.sidebarLink(false)} onClick={() => navigate('/')}>
          <Eye size={18} /> View Storefront
        </button>
      </div>
      <div style={s.mainContent}>
        <Routes>
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<AdminProductEdit />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="quotes/:id" element={<AdminQuoteDetail />} />
          <Route path="*" element={<AdminProducts />} />
        </Routes>
      </div>
    </div>
  )
}


// ─── ADMIN: PRODUCTS LIST ───────────────────────────────────────────────────
function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    const { data } = await supabase.from('products').select('*, pricing_tiers(*)').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    await supabase.from('products').delete().eq('id', deleteId)
    setDeleteId(null)
    load()
  }

  const toggleActive = async (id, current) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    load()
  }

  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>Products</h1>
        <button style={s.btnPrimary} onClick={() => setShowAdd(true)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#555', fontSize: 14 }}>Loading...</p>
      ) : products.length === 0 ? (
        <div style={{ ...s.card, padding: 60, textAlign: 'center' }}>
          <Package size={48} style={{ color: '#D4D4D4', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No products yet</p>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>Add your first product to get started.</p>
          <button style={s.btnPrimary} onClick={() => setShowAdd(true)}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {products.map(p => (
            <div key={p.id} style={s.card}>
              <div style={{ position: 'relative' }}>
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.name}
                    style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: 220, background: '#F5F5F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Image size={40} style={{ color: '#D4D4D4' }} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <span style={s.badge(p.is_active ? 'green' : 'default')}>
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                {p.pricing_tiers && p.pricing_tiers.length > 0 && (
                  <p style={{ fontSize: 14, color: '#555' }}>
                    From {formatMoney(Math.min(...p.pricing_tiers.map(t => t.price_per_unit)))}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button style={{ ...s.btnSecondary, ...s.btnSmall, flex: 1 }}
                    onClick={() => navigate(`/admin/products/${p.id}`)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button style={{ ...s.btnSecondary, ...s.btnSmall }}
                    onClick={() => toggleActive(p.id, p.is_active)}>
                    {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button style={{ ...s.btnDanger, ...s.btnSmall }}
                    onClick={() => setDeleteId(p.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load() }} />}
      {deleteId && <ConfirmModal message="Delete this product?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  )
}


// ─── ADD PRODUCT MODAL ──────────────────────────────────────────────────────
function AddProductModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [images, setImages] = useState([])
  const [tiers, setTiers] = useState([{ min_qty: 1, max_qty: 49, price_per_unit: '', cost_per_unit: '', exact: false }])
  const [shippingAir, setShippingAir] = useState('')
  const [shippingAirExpress, setShippingAirExpress] = useState('')
  const [shippingSea, setShippingSea] = useState('')
  const [saving, setSaving] = useState(false)

  const addTier = () => {
    const lastMax = tiers.length > 0 ? (tiers[tiers.length - 1].max_qty || 0) + 1 : 1
    setTiers([...tiers, { min_qty: lastMax, max_qty: null, price_per_unit: '', cost_per_unit: '', exact: false }])
  }

  const updateTier = (i, field, val) => {
    const next = [...tiers]
    if (field === 'exact') {
      next[i] = { ...next[i], exact: val }
      if (val) next[i].max_qty = next[i].min_qty
    } else {
      next[i] = { ...next[i], [field]: (field === 'price_per_unit' || field === 'cost_per_unit') ? val : (val === '' ? null : parseInt(val)) }
      if (next[i].exact && field === 'min_qty') next[i].max_qty = next[i].min_qty
    }
    setTiers(next)
  }

  const removeTier = (i) => setTiers(tiers.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    const { data: product, error } = await supabase.from('products')
      .insert({
        name, description, category, cover_image: coverImage,
        shipping_air: shippingAir ? parseFloat(shippingAir) : null,
        shipping_air_express: shippingAirExpress ? parseFloat(shippingAirExpress) : null,
        shipping_sea: shippingSea ? parseFloat(shippingSea) : null
      })
      .select().single()

    if (error) { console.error(error); setSaving(false); return }

    // Save images
    if (images.length > 0) {
      await supabase.from('product_images').insert(
        images.map((url, i) => ({ product_id: product.id, image_url: url, sort_order: i }))
      )
    }

    // Save tiers
    const validTiers = tiers.filter(t => t.price_per_unit !== '' && t.price_per_unit != null)
    if (validTiers.length > 0) {
      await supabase.from('pricing_tiers').insert(
        validTiers.map(t => ({
          product_id: product.id, min_qty: t.min_qty,
          max_qty: t.max_qty, price_per_unit: parseFloat(t.price_per_unit),
          cost_per_unit: t.cost_per_unit ? parseFloat(t.cost_per_unit) : null
        }))
      )
    }

    setSaving(false)
    onSave()
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modalLarge} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Add Product</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={s.label}>Product Name *</label>
              <input style={s.input} value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Custom Polo Shirt" />
            </div>
            <div>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Product details, materials, etc." />
            </div>
            <div>
              <label style={s.label}>Category</label>
              <input style={s.input} value={category} onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Apparel, Drinkware, Bags" />
            </div>
          </div>

          {/* Right: Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={s.label}>Cover Photo</label>
              {coverImage ? (
                <div style={{ position: 'relative' }}>
                  <img src={coverImage} alt="Cover" style={{
                    width: '100%', height: 200, objectFit: 'cover', borderRadius: 8
                  }} />
                  <button onClick={() => setCoverImage('')} style={{
                    position: 'absolute', top: 8, right: 8, background: '#000',
                    color: '#fff', border: 'none', borderRadius: 20, width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}><X size={14} /></button>
                </div>
              ) : (
                <ImageUploader onUpload={setCoverImage} />
              )}
            </div>

            <div>
              <label style={s.label}>Additional Photos</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: images.length > 0 ? 12 : 0 }}>
                {images.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} />
                    <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} style={{
                      position: 'absolute', top: -6, right: -6, background: '#000',
                      color: '#fff', border: 'none', borderRadius: 20, width: 20, height: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10
                    }}><X size={10} /></button>
                  </div>
                ))}
              </div>
              <ImageUploader multiple onUpload={urls => setImages([...images, ...urls])} />
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ ...s.label, marginBottom: 0 }}>Quantity Pricing</label>
            <button style={{ ...s.btnSecondary, ...s.btnSmall }} onClick={addTier}>
              <Plus size={14} /> Add Tier
            </button>
          </div>

          {tiers.map((tier, i) => {
            const margin = (tier.price_per_unit && tier.cost_per_unit)
              ? ((parseFloat(tier.price_per_unit) - parseFloat(tier.cost_per_unit)) / parseFloat(tier.price_per_unit) * 100).toFixed(0)
              : null
            return (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8,
                padding: 12, background: '#FAFAFA', borderRadius: 8
              }}>
                <div style={{ width: 80 }}>
                  <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Type</label>
                  <button onClick={() => updateTier(i, 'exact', !tier.exact)} style={{
                    ...s.btnSecondary, ...s.btnSmall, width: '100%', justifyContent: 'center',
                    marginTop: 4, fontSize: 11, padding: '7px 6px'
                  }}>{tier.exact ? 'Exact' : 'Range'}</button>
                </div>
                {tier.exact ? (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Quantity</label>
                    <input style={{ ...s.input, padding: '8px 10px' }} type="number"
                      value={tier.min_qty} onChange={e => updateTier(i, 'min_qty', e.target.value)} />
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Min Qty</label>
                      <input style={{ ...s.input, padding: '8px 10px' }} type="number"
                        value={tier.min_qty} onChange={e => updateTier(i, 'min_qty', e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Max Qty</label>
                      <input style={{ ...s.input, padding: '8px 10px' }} type="number"
                        value={tier.max_qty || ''} onChange={e => updateTier(i, 'max_qty', e.target.value)}
                        placeholder="No limit" />
                    </div>
                  </>
                )}
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Your Cost / Unit</label>
                  <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                    value={tier.cost_per_unit} onChange={e => updateTier(i, 'cost_per_unit', e.target.value)}
                    placeholder="$0.00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Sell Price / Unit</label>
                  <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                    value={tier.price_per_unit} onChange={e => updateTier(i, 'price_per_unit', e.target.value)}
                    placeholder="$0.00" />
                </div>
                <div style={{ width: 60, textAlign: 'center' }}>
                  <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Margin</label>
                  <p style={{
                    fontSize: 14, fontWeight: 700, marginTop: 8,
                    color: margin > 0 ? '#16A34A' : margin < 0 ? '#DC2626' : '#A3A3A3'
                  }}>{margin != null ? `${margin}%` : '—'}</p>
                </div>
                {tiers.length > 1 && (
                  <button onClick={() => removeTier(i)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626',
                    marginTop: 16
                  }}><Trash2 size={16} /></button>
                )}
              </div>
            )
          })}
        </div>

        {/* Shipping Costs */}
        <div style={{ marginTop: 24 }}>
          <label style={{ ...s.label, marginBottom: 12 }}>Shipping Costs (per unit)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ship size={14} style={{ color: '#555' }} />
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Sea</label>
              </div>
              <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                value={shippingSea} onChange={e => setShippingSea(e.target.value)} placeholder="$0.00" />
            </div>
            <div style={{ padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Plane size={14} style={{ color: '#555' }} />
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Air</label>
              </div>
              <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                value={shippingAir} onChange={e => setShippingAir(e.target.value)} placeholder="$0.00" />
            </div>
            <div style={{ padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Zap size={14} style={{ color: '#555' }} />
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Air Express</label>
              </div>
              <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                value={shippingAirExpress} onChange={e => setShippingAirExpress(e.target.value)} placeholder="$0.00" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : <><Save size={16} /> Save Product</>}
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── ADMIN: PRODUCT EDIT ────────────────────────────────────────────────────
function AdminProductEdit() {
  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [tiers, setTiers] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const id = useLocation().pathname.split('/').pop()

  const load = async () => {
    const { data: p } = await supabase.from('products').select('*').eq('id', id).single()
    const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', id).order('sort_order')
    const { data: t } = await supabase.from('pricing_tiers').select('*').eq('product_id', id).order('min_qty')
    setProduct(p)
    setImages(imgs || [])
    setTiers(t && t.length > 0 ? t : [{ min_qty: 1, max_qty: 49, price_per_unit: '', cost_per_unit: '' }])
  }

  useEffect(() => { load() }, [id])

  const save = async () => {
    setSaving(true)
    await supabase.from('products').update({
      name: product.name, description: product.description,
      category: product.category, cover_image: product.cover_image,
      shipping_air: product.shipping_air || null,
      shipping_air_express: product.shipping_air_express || null,
      shipping_sea: product.shipping_sea || null
    }).eq('id', id)

    // Replace images
    await supabase.from('product_images').delete().eq('product_id', id)
    if (images.length > 0) {
      await supabase.from('product_images').insert(
        images.map((img, i) => ({
          product_id: id, image_url: img.image_url || img, sort_order: i
        }))
      )
    }

    // Replace tiers
    await supabase.from('pricing_tiers').delete().eq('product_id', id)
    const validTiers = tiers.filter(t => t.price_per_unit !== '' && t.price_per_unit != null)
    if (validTiers.length > 0) {
      await supabase.from('pricing_tiers').insert(
        validTiers.map(t => ({
          product_id: id, min_qty: t.min_qty,
          max_qty: t.max_qty || null, price_per_unit: parseFloat(t.price_per_unit),
          cost_per_unit: t.cost_per_unit ? parseFloat(t.cost_per_unit) : null
        }))
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addTier = () => {
    const lastMax = tiers.length > 0 ? (tiers[tiers.length - 1].max_qty || 0) + 1 : 1
    setTiers([...tiers, { min_qty: lastMax, max_qty: null, price_per_unit: '', cost_per_unit: '', exact: false }])
  }

  if (!product) return <p style={{ color: '#555' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button style={{ ...s.btnSecondary, ...s.btnSmall }} onClick={() => navigate('/admin/products')}>
          <ChevronLeft size={16} /> Back
        </button>
        <h1 style={s.pageTitle}>Edit Product</h1>
        <div style={{ flex: 1 }} />
        {saved && <span style={{ color: '#16A34A', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={16} /> Saved
        </span>}
        <button style={s.btnPrimary} onClick={save} disabled={saving}>
          {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div style={{ ...s.card, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={s.label}>Product Name</label>
            <input style={s.input} value={product.name}
              onChange={e => setProduct({ ...product, name: e.target.value })} />
          </div>
          <div>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} value={product.description || ''}
              onChange={e => setProduct({ ...product, description: e.target.value })} />
          </div>
          <div>
            <label style={s.label}>Category</label>
            <input style={s.input} value={product.category || ''}
              onChange={e => setProduct({ ...product, category: e.target.value })} />
          </div>
        </div>

        <div style={{ ...s.card, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={s.label}>Cover Photo</label>
            {product.cover_image ? (
              <div style={{ position: 'relative' }}>
                <img src={product.cover_image} alt="" style={{
                  width: '100%', height: 200, objectFit: 'cover', borderRadius: 8
                }} />
                <button onClick={() => setProduct({ ...product, cover_image: '' })} style={{
                  position: 'absolute', top: 8, right: 8, background: '#000', color: '#fff',
                  border: 'none', borderRadius: 20, width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}><X size={14} /></button>
              </div>
            ) : (
              <ImageUploader onUpload={url => setProduct({ ...product, cover_image: url })} />
            )}
          </div>
          <div>
            <label style={s.label}>Additional Photos</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={img.image_url || img} alt="" style={{
                    width: 72, height: 72, objectFit: 'cover', borderRadius: 6
                  }} />
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} style={{
                    position: 'absolute', top: -6, right: -6, background: '#000', color: '#fff',
                    border: 'none', borderRadius: 20, width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}><X size={10} /></button>
                </div>
              ))}
            </div>
            <ImageUploader multiple onUpload={urls => setImages([...images, ...urls.map(u => ({ image_url: u }))])} />
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div style={{ ...s.card, padding: 24, marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <label style={{ ...s.label, marginBottom: 0, fontSize: 16 }}>Quantity Pricing</label>
          <button style={{ ...s.btnSecondary, ...s.btnSmall }} onClick={addTier}>
            <Plus size={14} /> Add Tier
          </button>
        </div>

        {tiers.map((tier, i) => {
          const isExact = tier.exact || (tier.min_qty && tier.max_qty && tier.min_qty === tier.max_qty)
          const margin = (tier.price_per_unit && tier.cost_per_unit)
            ? ((parseFloat(tier.price_per_unit) - parseFloat(tier.cost_per_unit)) / parseFloat(tier.price_per_unit) * 100).toFixed(0)
            : null
          return (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8,
              padding: 12, background: '#FAFAFA', borderRadius: 8
            }}>
              <div style={{ width: 80 }}>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Type</label>
                <button onClick={() => {
                  const next = [...tiers]
                  const newExact = !isExact
                  next[i] = { ...next[i], exact: newExact }
                  if (newExact) next[i].max_qty = next[i].min_qty
                  setTiers(next)
                }} style={{
                  ...s.btnSecondary, ...s.btnSmall, width: '100%', justifyContent: 'center',
                  marginTop: 4, fontSize: 11, padding: '7px 6px'
                }}>{isExact ? 'Exact' : 'Range'}</button>
              </div>
              {isExact ? (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Quantity</label>
                  <input style={{ ...s.input, padding: '8px 10px' }} type="number"
                    value={tier.min_qty} onChange={e => {
                      const val = parseInt(e.target.value) || 0
                      const next = [...tiers]; next[i] = { ...next[i], min_qty: val, max_qty: val }; setTiers(next)
                    }} />
                </div>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Min Qty</label>
                    <input style={{ ...s.input, padding: '8px 10px' }} type="number"
                      value={tier.min_qty} onChange={e => {
                        const next = [...tiers]; next[i] = { ...next[i], min_qty: parseInt(e.target.value) || 0 }; setTiers(next)
                      }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Max Qty</label>
                    <input style={{ ...s.input, padding: '8px 10px' }} type="number"
                      value={tier.max_qty || ''} onChange={e => {
                        const next = [...tiers]; next[i] = { ...next[i], max_qty: e.target.value === '' ? null : parseInt(e.target.value) }; setTiers(next)
                      }} placeholder="No limit" />
                  </div>
                </>
              )}
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Your Cost / Unit</label>
                <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                  value={tier.cost_per_unit || ''} onChange={e => {
                    const next = [...tiers]; next[i] = { ...next[i], cost_per_unit: e.target.value }; setTiers(next)
                  }} placeholder="$0.00" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Sell Price / Unit</label>
                <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                  value={tier.price_per_unit} onChange={e => {
                    const next = [...tiers]; next[i] = { ...next[i], price_per_unit: e.target.value }; setTiers(next)
                  }} placeholder="$0.00" />
              </div>
              <div style={{ width: 60, textAlign: 'center' }}>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Margin</label>
                <p style={{
                  fontSize: 14, fontWeight: 700, marginTop: 8,
                  color: margin > 0 ? '#16A34A' : margin < 0 ? '#DC2626' : '#A3A3A3'
                }}>{margin != null ? `${margin}%` : '—'}</p>
              </div>
              {tiers.length > 1 && (
                <button onClick={() => setTiers(tiers.filter((_, idx) => idx !== i))} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', marginTop: 16
                }}><Trash2 size={16} /></button>
              )}
            </div>
          )
        })}
      </div>

      {/* Shipping Costs */}
      <div style={{ ...s.card, padding: 24, marginTop: 24 }}>
        <label style={{ ...s.label, marginBottom: 16, fontSize: 16 }}>Shipping Costs (per unit)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={{ padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Ship size={16} style={{ color: '#555' }} />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Sea</label>
            </div>
            <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
              value={product.shipping_sea || ''} onChange={e => setProduct({ ...product, shipping_sea: e.target.value })}
              placeholder="$0.00" />
          </div>
          <div style={{ padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Plane size={16} style={{ color: '#555' }} />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Air</label>
            </div>
            <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
              value={product.shipping_air || ''} onChange={e => setProduct({ ...product, shipping_air: e.target.value })}
              placeholder="$0.00" />
          </div>
          <div style={{ padding: 16, background: '#FAFAFA', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Zap size={16} style={{ color: '#555' }} />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Air Express</label>
            </div>
            <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
              value={product.shipping_air_express || ''} onChange={e => setProduct({ ...product, shipping_air_express: e.target.value })}
              placeholder="$0.00" />
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── ADMIN: QUOTES LIST ─────────────────────────────────────────────────────
function AdminQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('quotes').select('*, quote_items(*)').order('created_at', { ascending: false })
      setQuotes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>Quotes</h1>
      </div>

      {loading ? (
        <p style={{ color: '#555', fontSize: 14 }}>Loading...</p>
      ) : quotes.length === 0 ? (
        <div style={{ ...s.card, padding: 60, textAlign: 'center' }}>
          <FileText size={48} style={{ color: '#D4D4D4', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No quotes yet</p>
          <p style={{ fontSize: 14, color: '#555' }}>When clients submit orders from the storefront, they'll appear here.</p>
        </div>
      ) : (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Client</th>
                <th style={s.th}>Items</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/quotes/${q.id}`)}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600 }}>{q.client_name}</div>
                    <div style={{ fontSize: 13, color: '#555' }}>{q.client_email}</div>
                    {q.client_company && <div style={{ fontSize: 12, color: '#A3A3A3' }}>{q.client_company}</div>}
                  </td>
                  <td style={s.td}>{q.quote_items?.length || 0} items</td>
                  <td style={s.td}>
                    <span style={s.badge(statusColors[q.status] || 'default')}>
                      {q.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ ...s.td, textAlign: 'right' }}>
                    <ChevronRight size={18} style={{ color: '#A3A3A3' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


// ─── ADMIN: QUOTE DETAIL ────────────────────────────────────────────────────
function AdminQuoteDetail() {
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const id = useLocation().pathname.split('/').pop()

  const load = async () => {
    const { data: q } = await supabase.from('quotes').select('*').eq('id', id).single()
    const { data: qi } = await supabase.from('quote_items').select('*').eq('quote_id', id)
    setQuote(q)
    setItems(qi || [])
  }

  useEffect(() => { load() }, [id])

  const updateFinalPrice = (itemId, price) => {
    setItems(items.map(i => i.id === itemId ? { ...i, final_price: price } : i))
  }

  const saveAndSend = async (newStatus) => {
    setSaving(true)
    // Update each item's final price
    for (const item of items) {
      if (item.final_price != null) {
        await supabase.from('quote_items').update({ final_price: parseFloat(item.final_price) }).eq('id', item.id)
      }
    }
    // Calculate total
    const total = items.reduce((sum, i) => sum + (parseFloat(i.final_price || i.estimated_price || 0) * i.quantity), 0)
    await supabase.from('quotes').update({ status: newStatus, total }).eq('id', id)
    setSaving(false)
    load()
  }

  if (!quote) return <p style={{ color: '#555' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button style={{ ...s.btnSecondary, ...s.btnSmall }} onClick={() => navigate('/admin/quotes')}>
          <ChevronLeft size={16} /> Back
        </button>
        <h1 style={s.pageTitle}>Quote Details</h1>
        <span style={s.badge(statusColors[quote.status] || 'default')}>{quote.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          {/* Items */}
          <div style={{ ...s.card, marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E5E5' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Items</h3>
            </div>
            {items.map(item => (
              <div key={item.id} style={{
                display: 'flex', gap: 16, padding: 20,
                borderBottom: '1px solid #F5F5F5', alignItems: 'center'
              }}>
                {item.product_image ? (
                  <img src={item.product_image} alt="" style={{
                    width: 72, height: 72, objectFit: 'cover', borderRadius: 8
                  }} />
                ) : (
                  <div style={{
                    width: 72, height: 72, background: '#F5F5F5', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}><Package size={24} style={{ color: '#D4D4D4' }} /></div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{item.product_name}</p>
                  <p style={{ fontSize: 13, color: '#555' }}>Qty: {item.quantity}</p>
                  {item.estimated_price && (
                    <p style={{ fontSize: 13, color: '#555' }}>
                      Estimated: {formatMoney(item.estimated_price)} each
                    </p>
                  )}
                  {item.notes && <p style={{ fontSize: 12, color: '#A3A3A3', marginTop: 4 }}>{item.notes}</p>}
                </div>
                <div style={{ width: 140 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Final Price / Unit</label>
                  <input style={{ ...s.input, padding: '8px 10px' }} type="number" step="0.01"
                    value={item.final_price || ''} onChange={e => updateFinalPrice(item.id, e.target.value)}
                    placeholder={item.estimated_price ? `$${item.estimated_price}` : '$0.00'} />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            {quote.status === 'pending' && (
              <button style={s.btnPrimary} onClick={() => saveAndSend('priced')} disabled={saving}>
                <DollarSign size={16} /> {saving ? 'Saving...' : 'Set Final Pricing'}
              </button>
            )}
            {quote.status === 'priced' && (
              <button style={s.btnPrimary} onClick={() => saveAndSend('invoiced')} disabled={saving}>
                <Send size={16} /> {saving ? 'Saving...' : 'Convert to Invoice'}
              </button>
            )}
            {(quote.status === 'pending' || quote.status === 'priced') && (
              <button style={s.btnSecondary} onClick={() => saveAndSend(quote.status)} disabled={saving}>
                <Save size={16} /> Save
              </button>
            )}
          </div>
        </div>

        {/* Client Info Sidebar */}
        <div>
          <div style={{ ...s.card, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Client Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Name</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{quote.client_name}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Email</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{quote.client_email}</p>
              </div>
              {quote.client_phone && (
                <div>
                  <p style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Phone</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{quote.client_phone}</p>
                </div>
              )}
              {quote.client_company && (
                <div>
                  <p style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Company</p>
                  <p style={{ fontSize: 14, fontWeight: 500 }}>{quote.client_company}</p>
                </div>
              )}
              {quote.logo_url && (
                <div>
                  <p style={{ fontSize: 12, color: '#555', fontWeight: 600, marginBottom: 8 }}>Logo</p>
                  <img src={quote.logo_url} alt="Client logo" style={{
                    maxWidth: '100%', maxHeight: 120, objectFit: 'contain',
                    background: '#F5F5F5', borderRadius: 8, padding: 12
                  }} />
                </div>
              )}
              {quote.notes && (
                <div>
                  <p style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Notes</p>
                  <p style={{ fontSize: 14, color: '#000' }}>{quote.notes}</p>
                </div>
              )}
            </div>
          </div>

          {quote.total != null && (
            <div style={{ ...s.card, padding: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 800 }}>{formatMoney(quote.total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════
// CLIENT STOREFRONT
// ═══════════════════════════════════════════════════════════════════════════

function Storefront() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [cart, setCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('products')
        .select('*, pricing_tiers(*), product_images(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = !categoryFilter || p.category === categoryFilter
    return matchSearch && matchCat
  })

  const addToCart = (product, quantity, notes, shippingMethod) => {
    const tiers = product.pricing_tiers?.sort((a, b) => a.min_qty - b.min_qty) || []
    const tier = tiers.find(t => quantity >= t.min_qty && (!t.max_qty || quantity <= t.max_qty))
    const price = tier ? tier.price_per_unit : (tiers.length > 0 ? tiers[tiers.length - 1].price_per_unit : null)
    const shippingCost = shippingMethod === 'sea' ? product.shipping_sea
      : shippingMethod === 'air' ? product.shipping_air
      : shippingMethod === 'air_express' ? product.shipping_air_express : 0
    const shippingLabel = shippingMethod === 'sea' ? 'Sea'
      : shippingMethod === 'air' ? 'Air'
      : shippingMethod === 'air_express' ? 'Air Express' : null

    setCart([...cart, {
      product_id: product.id, product_name: product.name,
      product_image: product.cover_image, quantity,
      estimated_price: price, notes,
      shipping_method: shippingLabel,
      shipping_cost: parseFloat(shippingCost) || 0
    }])
    setSelected(null)
    setShowCart(true)
  }

  const removeFromCart = (idx) => setCart(cart.filter((_, i) => i !== idx))

  const updateCartQty = (idx, qty) => {
    const item = cart[idx]
    const product = products.find(p => p.id === item.product_id)
    const tiers = product?.pricing_tiers?.sort((a, b) => a.min_qty - b.min_qty) || []
    const tier = tiers.find(t => qty >= t.min_qty && (!t.max_qty || qty <= t.max_qty))
    const price = tier ? tier.price_per_unit : (tiers.length > 0 ? tiers[tiers.length - 1].price_per_unit : null)
    setCart(cart.map((c, i) => i === idx ? { ...c, quantity: qty, estimated_price: price } : c))
  }

  const cartTotal = cart.reduce((sum, i) => sum + ((parseFloat(i.estimated_price || 0) + parseFloat(i.shipping_cost || 0)) * i.quantity), 0)

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.storeNav}>
        <div style={s.storeLogo}>Create & Source</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => setShowCart(true)} style={{
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500
          }}>
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span style={{
                background: '#fff', color: '#000', borderRadius: 20,
                padding: '2px 8px', fontSize: 12, fontWeight: 700
              }}>{cart.length}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        background: '#000', color: '#fff', padding: '60px 40px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 12 }}>
          Your Merch Store
        </h1>
        <p style={{ fontSize: 16, color: '#A3A3A3', maxWidth: 500, margin: '0 auto' }}>
          Browse products, select quantities for pricing, and submit your order with your logo.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        padding: '20px 40px', borderBottom: '1px solid #E5E5E5', background: '#fff',
        display: 'flex', gap: 12, alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#A3A3A3' }} />
          <input style={{ ...s.input, paddingLeft: 38 }} placeholder="Search products..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              ...s.btnSecondary, ...s.btnSmall,
              background: !categoryFilter ? '#000' : '#fff',
              color: !categoryFilter ? '#fff' : '#000'
            }} onClick={() => setCategoryFilter('')}>All</button>
            {categories.map(cat => (
              <button key={cat} style={{
                ...s.btnSecondary, ...s.btnSmall,
                background: categoryFilter === cat ? '#000' : '#fff',
                color: categoryFilter === cat ? '#fff' : '#000'
              }} onClick={() => setCategoryFilter(cat)}>{cat}</button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <p style={{ color: '#555' }}>Loading products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 80, textAlign: 'center' }}>
          <Package size={48} style={{ color: '#D4D4D4', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 700 }}>No products found</p>
        </div>
      ) : (
        <div style={s.storeGrid}>
          {filtered.map(p => (
            <div key={p.id} style={s.productCard}
              onClick={() => setSelected(p)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              {p.cover_image ? (
                <img src={p.cover_image} alt={p.name} style={s.productImage} />
              ) : (
                <div style={{
                  ...s.productImage, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: '#F5F5F5'
                }}>
                  <Image size={48} style={{ color: '#D4D4D4' }} />
                </div>
              )}
              <div style={s.productInfo}>
                {p.category && (
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {p.category}
                  </p>
                )}
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{p.name}</h3>
                {p.pricing_tiers && p.pricing_tiers.length > 0 && (
                  <p style={{ fontSize: 15, color: '#555' }}>
                    Starting at {formatMoney(Math.min(...p.pricing_tiers.map(t => t.price_per_unit)))} / unit
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selected && <ProductDetailModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}

      {/* Cart Drawer */}
      {showCart && (
        <div style={s.overlay} onClick={() => setShowCart(false)}>
          <div style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: 440,
            background: '#fff', padding: 32, overflow: 'auto',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>Your Quote</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <ShoppingBag size={40} style={{ color: '#D4D4D4', margin: '0 auto 12px' }} />
                <p style={{ color: '#555', fontSize: 14 }}>Your quote is empty</p>
              </div>
            ) : (
              <>
                {cart.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: 12, padding: '16px 0',
                    borderBottom: '1px solid #F5F5F5', alignItems: 'center'
                  }}>
                    {item.product_image ? (
                      <img src={item.product_image} alt="" style={{
                        width: 56, height: 56, objectFit: 'cover', borderRadius: 8
                      }} />
                    ) : (
                      <div style={{
                        width: 56, height: 56, background: '#F5F5F5', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}><Package size={20} style={{ color: '#D4D4D4' }} /></div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{item.product_name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <button onClick={() => updateCartQty(idx, Math.max(1, item.quantity - 1))}
                          style={{ ...s.btnSecondary, padding: '2px 6px', minWidth: 0 }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateCartQty(idx, item.quantity + 1)}
                          style={{ ...s.btnSecondary, padding: '2px 6px', minWidth: 0 }}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>
                        {formatMoney((parseFloat(item.estimated_price || 0) + parseFloat(item.shipping_cost || 0)) * item.quantity)}
                      </p>
                      <p style={{ fontSize: 11, color: '#555' }}>
                        {formatMoney(item.estimated_price)} ea
                      </p>
                      {item.shipping_method ? (
                        <p style={{ fontSize: 10, color: '#A3A3A3' }}>
                          + {formatMoney(item.shipping_cost)} {item.shipping_method}
                        </p>
                      ) : (
                        <p style={{ fontSize: 10, color: '#16A34A' }}>Free Shipping</p>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div style={{
                  display: 'flex', justifyContent: 'space-between', padding: '20px 0',
                  borderTop: '2px solid #000', marginTop: 12
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Estimated Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{formatMoney(cartTotal)}</span>
                </div>
                <p style={{ fontSize: 12, color: '#555', marginBottom: 20 }}>
                  Final pricing will be provided after review.
                </p>

                <button style={{ ...s.btnPrimary, width: '100%', justifyContent: 'center', padding: '14px 20px' }}
                  onClick={() => { setShowCart(false); setShowCheckout(true) }}>
                  Submit Quote Request <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={cartTotal}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => { setCart([]); setShowCheckout(false) }}
        />
      )}
    </div>
  )
}


// ─── PRODUCT DETAIL MODAL ───────────────────────────────────────────────────
function ProductDetailModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(product.pricing_tiers?.[0]?.min_qty || 1)
  const [notes, setNotes] = useState('')
  const [activeImg, setActiveImg] = useState(product.cover_image)
  const [shippingMethod, setShippingMethod] = useState('')

  const tiers = (product.pricing_tiers || []).sort((a, b) => a.min_qty - b.min_qty)
  const shippingOptions = [
    product.shipping_sea != null && { key: 'sea', label: 'Sea', icon: Ship, cost: parseFloat(product.shipping_sea), time: '25–40 days' },
    product.shipping_air != null && { key: 'air', label: 'Air', icon: Plane, cost: parseFloat(product.shipping_air), time: '7–14 days' },
    product.shipping_air_express != null && { key: 'air_express', label: 'Air Express', icon: Zap, cost: parseFloat(product.shipping_air_express), time: '3–5 days' },
  ].filter(Boolean)
  const allImages = [
    product.cover_image,
    ...(product.product_images || []).map(i => i.image_url)
  ].filter(Boolean)

  const currentTier = tiers.find(t => qty >= t.min_qty && (!t.max_qty || qty <= t.max_qty))
  const unitPrice = currentTier ? currentTier.price_per_unit : (tiers.length > 0 ? tiers[tiers.length - 1].price_per_unit : 0)

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ ...s.modalLarge, maxWidth: 960, padding: 0, display: 'flex', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        {/* Image Side */}
        <div style={{ width: '50%', background: '#F5F5F5' }}>
          {activeImg ? (
            <img src={activeImg} alt={product.name} style={{
              width: '100%', height: 420, objectFit: 'cover'
            }} />
          ) : (
            <div style={{
              width: '100%', height: 420, display: 'flex', alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Image size={64} style={{ color: '#D4D4D4' }} />
            </div>
          )}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: 16, overflowX: 'auto' }}>
              {allImages.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setActiveImg(img)}
                  style={{
                    width: 64, height: 64, objectFit: 'cover', borderRadius: 6,
                    cursor: 'pointer', border: activeImg === img ? '2px solid #000' : '2px solid transparent',
                    opacity: activeImg === img ? 1 : 0.6
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* Info Side */}
        <div style={{ width: '50%', padding: 32, overflow: 'auto', maxHeight: '90vh' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16, background: 'none',
            border: 'none', cursor: 'pointer'
          }}><X size={24} /></button>

          {product.category && (
            <p style={{
              fontSize: 12, fontWeight: 600, color: '#A3A3A3',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8
            }}>{product.category}</p>
          )}
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{product.name}</h2>
          {product.description && (
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24 }}>
              {product.description}
            </p>
          )}

          {/* Pricing Table */}
          {tiers.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quantity Pricing</h4>
              <div style={{ borderRadius: 8, border: '1px solid #E5E5E5', overflow: 'hidden' }}>
                {tiers.map((tier, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 16px',
                    background: currentTier === tier ? '#000' : (i % 2 === 0 ? '#FAFAFA' : '#fff'),
                    color: currentTier === tier ? '#fff' : '#000',
                    fontSize: 14, fontWeight: currentTier === tier ? 600 : 400,
                    transition: 'all 0.15s'
                  }}>
                    <span>{tier.min_qty === tier.max_qty ? `${tier.min_qty}` : `${tier.min_qty}${tier.max_qty ? `–${tier.max_qty}` : '+'}`} units</span>
                    <span style={{ fontWeight: 700 }}>{formatMoney(tier.price_per_unit)} / unit</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ ...s.btnSecondary, padding: '8px 12px' }}>
                <Minus size={16} />
              </button>
              <input style={{ ...s.input, width: 80, textAlign: 'center', fontSize: 18, fontWeight: 700 }}
                type="number" min="1" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} />
              <button onClick={() => setQty(qty + 1)}
                style={{ ...s.btnSecondary, padding: '8px 12px' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Shipping Method */}
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Shipping</label>
            {shippingOptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {shippingOptions.map(opt => {
                  const Icon = opt.icon
                  const isSelected = shippingMethod === opt.key
                  return (
                    <button key={opt.key} onClick={() => setShippingMethod(opt.key)} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      border: isSelected ? '2px solid #000' : '1px solid #E5E5E5',
                      borderRadius: 8, background: isSelected ? '#FAFAFA' : '#fff',
                      cursor: 'pointer', textAlign: 'left', width: '100%'
                    }}>
                      <Icon size={18} style={{ color: isSelected ? '#000' : '#A3A3A3' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: '#555' }}>{opt.time}</p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>+{formatMoney(opt.cost)}/unit</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{
                padding: '12px 16px', borderRadius: 8, background: '#DCFCE7',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <Check size={18} style={{ color: '#16A34A' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>Free Shipping</span>
              </div>
            )}
          </div>

          {/* Live Price */}
          {unitPrice > 0 && (() => {
            const selectedShipping = shippingOptions.find(o => o.key === shippingMethod)
            const shippingCost = selectedShipping ? selectedShipping.cost : 0
            const totalPerUnit = parseFloat(unitPrice) + shippingCost
            return (
              <div style={{
                background: '#F5F5F5', borderRadius: 8, padding: 16, marginBottom: 20,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#555' }}>Product: {formatMoney(unitPrice)} x {qty}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{formatMoney(unitPrice * qty)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#555' }}>Shipping</span>
                  {shippingCost > 0 ? (
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{formatMoney(shippingCost)} x {qty} = {formatMoney(shippingCost * qty)}</span>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>Free</span>
                  )}
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: '1px solid #D4D4D4', paddingTop: 8, marginTop: 8
                }}>
                  <p style={{ fontSize: 11, color: '#A3A3A3' }}>Estimated — final pricing after review</p>
                  <p style={{ fontSize: 24, fontWeight: 800 }}>{formatMoney(totalPerUnit * qty)}</p>
                </div>
              </div>
            )
          })()}

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Notes (optional)</label>
            <textarea style={{ ...s.textarea, minHeight: 60 }} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Colors, sizes, special instructions..." />
          </div>

          {shippingOptions.length > 0 && !shippingMethod && (
            <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>Please select a shipping method</p>
          )}
          <button style={{
            ...s.btnPrimary, width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 15,
            opacity: (shippingOptions.length > 0 && !shippingMethod) ? 0.5 : 1
          }}
            disabled={shippingOptions.length > 0 && !shippingMethod}
            onClick={() => onAdd(product, qty, notes, shippingMethod)}>
            <ShoppingBag size={18} /> Add to Quote
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── CHECKOUT MODAL ─────────────────────────────────────────────────────────
function CheckoutModal({ cart, total, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = async () => {
    if (!name.trim() || !email.trim()) return
    setSubmitting(true)

    const { data: quote, error } = await supabase.from('quotes').insert({
      client_name: name, client_email: email, client_phone: phone,
      client_company: company, logo_url: logoUrl, notes,
      status: 'pending', total
    }).select().single()

    if (error) { console.error(error); setSubmitting(false); return }

    await supabase.from('quote_items').insert(
      cart.map(item => ({
        quote_id: quote.id, product_id: item.product_id,
        product_name: item.product_name, product_image: item.product_image,
        quantity: item.quantity, estimated_price: item.estimated_price,
        notes: [item.notes, item.shipping_method ? `Shipping: ${item.shipping_method} (+${formatMoney(item.shipping_cost)}/unit)` : null].filter(Boolean).join(' | ') || null
      }))
    )

    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={s.overlay}>
        <div style={{ ...s.modal, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 32, background: '#DCFCE7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Check size={32} style={{ color: '#16A34A' }} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Quote Submitted!</h2>
          <p style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>
            We've received your request and will review it shortly.
            You'll receive final pricing at <strong>{email}</strong>.
          </p>
          <button style={s.btnPrimary} onClick={onSuccess}>Back to Store</button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modalLarge} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Submit Your Quote</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Left: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={s.label}>Your Name *</label>
              <input style={s.input} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Email *</label>
              <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Phone</label>
              <input style={s.input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Company</label>
              <input style={s.input} value={company} onChange={e => setCompany(e.target.value)} />
            </div>
            <div>
              <label style={s.label}>Additional Notes</label>
              <textarea style={{ ...s.textarea, minHeight: 60 }} value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requests or details..." />
            </div>
          </div>

          {/* Right: Logo + Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={s.label}>Upload Your Logo / Design</label>
              <LogoUploader onUpload={setLogoUrl} currentUrl={logoUrl} />
            </div>

            <div style={{ background: '#FAFAFA', borderRadius: 12, padding: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Order Summary</h4>
              {cart.map((item, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #E5E5E5', fontSize: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.product_name} x {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{formatMoney((parseFloat(item.estimated_price || 0) + parseFloat(item.shipping_cost || 0)) * item.quantity)}</span>
                  </div>
                  <p style={{ fontSize: 11, color: item.shipping_method ? '#555' : '#16A34A', marginTop: 2 }}>
                    {item.shipping_method ? `Shipping: ${item.shipping_method} (+${formatMoney(item.shipping_cost)}/unit)` : 'Free Shipping'}
                  </p>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', padding: '12px 0 0',
                fontSize: 16, fontWeight: 700
              }}>
                <span>Estimated Total</span>
                <span>{formatMoney(total)}</span>
              </div>
              <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
                Final pricing provided after review
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={submit} disabled={submitting || !name.trim() || !email.trim()}>
            {submitting ? 'Submitting...' : <><Send size={16} /> Submit Quote Request</>}
          </button>
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════
// APP ROUTES
// ═══════════════════════════════════════════════════════════════════════════

function App() {
  return (
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/admin/*" element={<AdminLayout />} />
    </Routes>
  )
}

export default App
