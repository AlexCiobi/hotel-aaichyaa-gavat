import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { menuData } from '../lib/menuData'
import type { MenuCategory } from '../lib/types'

type FilterVeg = 'all' | 'veg' | 'nonveg'

const CATEGORIES: { id: MenuCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'VEG', label: 'Veg' },
  { id: 'CHICKEN_THALI', label: 'Chicken Thali' },
  { id: 'MUTTON_THALI', label: 'Mutton Thali' },
  { id: 'HANDI', label: 'Handi' },
  { id: 'EGG', label: 'Egg' },
  { id: 'RICE', label: 'Rice' },
  { id: 'BREADS', label: 'Breads' },
  { id: 'OTHERS', label: 'Others' },
]

export default function Menu() {
  const { t, language } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'ALL'>('ALL')
  const [vegFilter, setVegFilter] = useState<FilterVeg>('all')
  const [search, setSearch] = useState('')

  const filteredItems = useMemo(() => {
    return menuData.filter((item) => {
      if (activeCategory !== 'ALL' && item.category !== activeCategory) return false
      if (vegFilter === 'veg' && !item.is_veg) return false
      if (vegFilter === 'nonveg' && item.is_veg) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const name = (item[`name_${language}` as keyof typeof item] as string).toLowerCase()
        const desc = (item[`description_${language}` as keyof typeof item] as string).toLowerCase()
        const nameEn = item.name_en.toLowerCase()
        if (!name.includes(q) && !desc.includes(q) && !nameEn.includes(q)) return false
      }
      return true
    })
  }, [activeCategory, vegFilter, search, language])

  const countForCategory = (cat: MenuCategory | 'ALL') => {
    if (cat === 'ALL') return menuData.length
    return menuData.filter((m) => m.category === cat).length
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="page-wrapper pt-16"
    >
      {/* Hero banner */}
      <div className="relative h-48 sm:h-64 flex items-center justify-center overflow-hidden">
        <img
          src="/images/hero-1.jpg"
          alt="Menu"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#C0272D]/70 to-charcoal/90" />
        <div className="relative z-10 text-center px-4">
          <motion.span
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#C0272D]/80 text-xs font-semibold uppercase tracking-[0.2em] block mb-2"
          >
            Hotel Aaichyaa Gavat
          </motion.span>
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-playfair font-bold text-3xl sm:text-4xl text-white"
          >
            {t('sections.exploreMenu')}
          </motion.h1>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(({ id, label }) => {
              const isActive = activeCategory === id
              return (
                <motion.button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#C0272D] text-white shadow-md'
                      : 'bg-offwhite text-charcoal/70 hover:bg-[#C0272D]/10 hover:text-[#C0272D]'
                  }`}
                >
                  {label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-charcoal/10 text-charcoal/50'
                    }`}
                  >
                    {countForCategory(id)}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Search + veg filter */}
          <div className="flex items-center gap-3 pb-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('menu.searchPlaceholder')}
                className="w-full pl-9 pr-8 py-2 text-sm bg-offwhite rounded-full border border-transparent focus:border-[#C0272D]/50 focus:outline-none transition-colors duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {(['all', 'veg', 'nonveg'] as FilterVeg[]).map((f) => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setVegFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    vegFilter === f
                      ? f === 'veg'
                        ? 'bg-green-600 text-white'
                        : f === 'nonveg'
                        ? 'bg-red-600 text-white'
                        : 'bg-charcoal text-white'
                      : 'bg-offwhite text-charcoal/60 hover:bg-offwhite/80'
                  }`}
                >
                  {f === 'veg' && (
                    <span className="w-3 h-3 rounded-sm border border-current flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    </span>
                  )}
                  {f === 'nonveg' && (
                    <span className="w-3 h-3 rounded-sm border border-current flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    </span>
                  )}
                  {f === 'all' ? t('menu.allItems') : f === 'veg' ? t('menu.vegOnly') : t('menu.nonVegOnly')}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="font-playfair text-xl text-charcoal mb-2">No items found</h3>
              <p className="text-charcoal/50 text-sm">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item, i) => {
                const name = item[`name_${language}` as keyof typeof item] as string
                const desc = item[`description_${language}` as keyof typeof item] as string
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    style={{ transition: 'box-shadow 0.2s' }}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:ring-1 hover:ring-[#C0272D]/30 transition-shadow duration-300 group"
                  >
                    <div className="relative overflow-hidden h-48">
                      <motion.img
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                        src={item.image_url}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = '/images/default-food.jpg' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {/* Veg/Non-veg indicator */}
                      <span
                        className={`absolute top-3 left-3 w-5 h-5 rounded-sm border-2 flex items-center justify-center bg-white ${
                          item.is_veg ? 'border-green-600' : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.is_veg ? 'bg-green-600' : 'bg-red-600'
                          }`}
                        />
                      </span>
                      <span className="absolute top-3 right-3 bg-charcoal/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {item.category === 'CHICKEN_THALI' ? 'Chicken' : item.category === 'MUTTON_THALI' ? 'Mutton' : item.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-playfair font-semibold text-base text-charcoal mb-1.5 leading-tight line-clamp-2">
                        {name}
                      </h3>
                      <p className="text-charcoal/55 text-xs leading-relaxed mb-4 line-clamp-2">
                        {desc}
                      </p>
                      <div className="flex items-center justify-between">
                        <motion.span
                          initial={false}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="font-dmserif text-2xl text-[#C0272D]"
                        >
                          ₹{item.price}
                        </motion.span>
                        <Link
                          to="/order"
                          className="bg-[#C0272D]/10 hover:bg-[#C0272D] text-[#C0272D] hover:text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200"
                        >
                          {t('buttons.addToOrder')}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
