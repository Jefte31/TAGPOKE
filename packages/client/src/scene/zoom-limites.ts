/**
 * Níveis discretos de zoom: valores inteiros preservam pixel art e 0,5x permite
 * enxergar mais mapa em telefones sem exigir gesto de pinça ou teclado.
 *
 * Fica fora de app.ts para que a tela de login não importe PixiJS.
 */
export const ZOOM_NIVEIS = [0.5, 1, 2, 3] as const
export const ZOOM_MINIMO = 0.5
export const ZOOM_MAXIMO = 3
/** Visão normal (1x), diferente do padrão ampliado do desktop (2x). */
export const ZOOM_NORMAL = 1
export const ZOOM_PADRAO = 2
export const ZOOM_PADRAO_MOBILE = 1

/** Aceita apenas níveis previstos; entrada inválida não chega ao renderizador. */
export function normalizarZoom(valor: number): number {
  if (!Number.isFinite(valor)) return ZOOM_PADRAO
  return ZOOM_NIVEIS.reduce<number>(
    (maisProximo, nivel) => Math.abs(nivel - valor) < Math.abs(maisProximo - valor) ? nivel : maisProximo,
    ZOOM_PADRAO,
  )
}

/** Caminha pela lista, sem arredondamento que poderia pular o nível de 0,5x. */
export function passoZoom(atual: number, direcao: -1 | 1): number {
  const indice = ZOOM_NIVEIS.indexOf(normalizarZoom(atual) as typeof ZOOM_NIVEIS[number])
  return ZOOM_NIVEIS[Math.max(0, Math.min(ZOOM_NIVEIS.length - 1, indice + direcao))] ?? ZOOM_PADRAO
}

/** Preferência ganha do tamanho da tela; valor armazenado inválido é ignorado. */
export function zoomInicial(largura: number, salvo: string | null): number {
  if (salvo !== null) {
    const valor = Number(salvo)
    if (ZOOM_NIVEIS.some((nivel) => nivel === valor)) return valor
  }
  return largura <= 900 ? ZOOM_PADRAO_MOBILE : ZOOM_PADRAO
}
