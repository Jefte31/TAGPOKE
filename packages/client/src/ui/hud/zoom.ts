/**
 * Zoom sobre a área de caça. Os controles funcionam no toque, no mouse e com teclado.
 * "Normal" volta a 1x; "Afastar" chega a 0,5x para ampliar o campo de visão no celular.
 */
import type { Scene } from '../../scene/app.js'
import { passoZoom, ZOOM_MAXIMO, ZOOM_MINIMO, ZOOM_NORMAL } from '../../scene/zoom-limites.js'
import { el } from '../dom.js'

export interface ControleDeZoom {
  readonly sincronizar: () => void
  readonly desmontar: () => void
}

/** `obter` devolve a cena depois do import dinâmico; `aoMudar` guarda a preferência. */
export function mountZoom(root: HTMLElement, obter: () => Scene | null, aoMudar?: (nivel: number) => void): ControleDeZoom {
  const nivel = el('span', { class: 'zoom-nivel', 'aria-live': 'polite', 'aria-atomic': 'true' }, '')
  const menos = el('button', { type: 'button', class: 'zoom-botao', 'aria-label': 'Afastar' }, '−') as HTMLButtonElement
  const mais = el('button', { type: 'button', class: 'zoom-botao', 'aria-label': 'Aproximar' }, '+') as HTMLButtonElement
  const normal = el('button', { type: 'button', class: 'zoom-botao zoom-normal', 'aria-label': 'Restaurar zoom normal' }, 'Normal') as HTMLButtonElement
  const caixa = el('div', { class: 'zoom', role: 'group', 'aria-label': 'Zoom do mapa' }, menos, nivel, mais, normal)

  const sincronizar = (): void => {
    const cena = obter()
    caixa.hidden = cena === null
    if (!cena) return
    const z = cena.zoom()
    nivel.textContent = `${String(z).replace('.', ',')}×`
    menos.disabled = z <= ZOOM_MINIMO
    mais.disabled = z >= ZOOM_MAXIMO
    normal.disabled = z === ZOOM_NORMAL
  }

  const mudar = (calcular: (valor: number) => number) => (): void => {
    const cena = obter()
    if (!cena) return
    const anterior = cena.zoom()
    cena.setZoom(calcular(anterior))
    sincronizar()
    if (cena.zoom() !== anterior) aoMudar?.(cena.zoom())
  }

  menos.addEventListener('click', mudar((z) => passoZoom(z, -1)))
  mais.addEventListener('click', mudar((z) => passoZoom(z, 1)))
  normal.addEventListener('click', mudar(() => ZOOM_NORMAL))

  root.append(caixa)
  sincronizar()
  return { sincronizar, desmontar: () => caixa.remove() }
}
