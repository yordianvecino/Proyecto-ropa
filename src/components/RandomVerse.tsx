"use client"
import { useEffect, useState } from 'react'

type VerseData = {
  reference: string
  text: string
}

// Fuentes posibles:
// 1. OurManna API (JSON): https://beta.ourmanna.com/api/v1/get/?format=json
// 2. labs.bible.org (texto plano EN): https://labs.bible.org/api/?passage=random&type=json
// Implementamos: intento OurManna -> labs.bible.org -> fallback local ES

const FALLBACKS_ES: VerseData[] = [
  { reference: 'Juan 3:16', text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito...' },
  { reference: 'Salmo 23:1', text: 'Jehová es mi pastor; nada me faltará.' },
  { reference: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' },
  { reference: 'Jeremías 29:11', text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová...' },
  { reference: 'Isaías 40:31', text: 'Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.' },
  { reference: 'Proverbios 3:5', text: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.' },
  { reference: 'Romanos 8:28', text: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.' },
  { reference: 'Salmo 46:1', text: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.' },
  { reference: 'Mateo 11:28', text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.' },
  { reference: 'Josué 1:9', text: 'Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.' },
  { reference: 'Salmo 37:4', text: 'Deléitate asimismo en Jehová, y él te concederá las peticiones de tu corazón.' },
  { reference: 'Filipenses 4:6-7', text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios... y la paz de Dios guardará vuestros corazones.' },
  { reference: '1 Pedro 5:7', text: 'Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.' },
  { reference: 'Salmo 121:1-2', text: 'Alzaré mis ojos a los montes; ¿de dónde vendrá mi socorro? Mi socorro viene de Jehová.' },
  { reference: 'Juan 14:6', text: 'Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.' },
]

// Preferir 100% versos en español sin depender de APIs externas (evita CORS/tiempos muertos)
const PREFER_LOCAL_ES = true

async function abortableFetch(url: string, ms = 3500): Promise<Response | null> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } catch (e) {
    console?.warn?.('[RandomVerse] fetch timeout/abort', url)
    return null
  } finally {
    clearTimeout(t)
  }
}

async function fetchOurManna(): Promise<VerseData | null> {
  try {
    const res = await abortableFetch('https://beta.ourmanna.com/api/v1/get/?format=json')
    if (!res || !res.ok) return null
    const data = await res.json()
    const verse = data?.verse?.details
    if (!verse) return null
    return { reference: verse.reference, text: verse.text }
  } catch {
    return null
  }
}

async function fetchLabsBible(): Promise<VerseData | null> {
  try {
    const res = await abortableFetch('https://labs.bible.org/api/?passage=random&type=json')
    if (!res || !res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const v = data[0]
      const ref = `${v.bookname} ${v.chapter}:${v.verse}`
      return { reference: ref, text: v.text }
    }
    return null
  } catch {
    return null
  }
}

function getFallback(): VerseData {
  const idx = Math.floor(Math.random() * FALLBACKS_ES.length)
  return FALLBACKS_ES[idx]
}

export default function RandomVerse() {
  const [verse, setVerse] = useState<VerseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      console.log('[RandomVerse] buscando versículo…')
      if (PREFER_LOCAL_ES) {
        if (active) {
          setVerse(getFallback())
          setLoading(false)
        }
        return
      }
      // Intento 1: OurManna
      const v1 = await fetchOurManna()
      if (active && v1) {
        console.log('[RandomVerse] fuente: OurManna', v1.reference)
        setVerse(v1)
        setLoading(false)
        return
      }
      // Intento 2: labs.bible.org
      const v2 = await fetchLabsBible()
      if (active && v2) {
        console.log('[RandomVerse] fuente: labs.bible.org', v2.reference)
        setVerse(v2)
        setLoading(false)
        return
      }
      // Fallback local ES
      if (active) {
        console.log('[RandomVerse] fuente: fallback local')
        setVerse(getFallback())
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-4 bg-brand-rose/20 rounded w-64 mx-auto mb-2" />
        <div className="h-4 bg-brand-rose/10 rounded w-80 mx-auto" />
      </div>
    )
  }

  if (!verse) return null

  return (
    <div className="mb-8 max-w-2xl mx-auto text-brand-black/80">
      <blockquote className="italic text-base md:text-lg leading-relaxed">
        “{verse.text}”
      </blockquote>
      <p className="mt-2 text-sm font-medium text-brand-rose">{verse.reference}</p>
      <button
        type="button"
        onClick={() => {
          // Intento rápido: otro fallback local (instantáneo)
          setVerse(getFallback())
        }}
        className="mt-3 text-xs px-3 py-1 rounded bg-brand-rose text-white hover:bg-brand-pink transition-colors"
      >
        Otro versículo
      </button>
    </div>
  )
}
