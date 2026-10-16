/**
 * O controle de zoom precisa DIZER onde está e onde acaba.
 *
 * Os dois erros que ele pode cometer são invisíveis num olhar rápido e caros no uso: aparecer
 * quando não há cena — apertável e inerte —, e oferecer um passo que a cena vai recusar em
 * silêncio, porque `setZoom` prende o valor na faixa. O segundo é pior: o botão responde ao clique,
 * o número não muda, e o jogador conclui que o jogo está travado.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { mountZoom } from '../../../src/ui/hud/zoom.js'
import { normalizarZoom, ZOOM_MAXIMO, ZOOM_MINIMO } from '../../../src/scene/zoom-limites.js'
import type { Scene } from '../../../src/scene/app.js'

/** Uma cena que só sabe o zoom, e o prende como a de verdade prende. */
function cenaFalsa(inicial: number): Scene {
  let z = inicial
  return {
    zoom: () => z,
    setZoom: (n: number) => { z = normalizarZoom(n) },
    applyView: () => {}, onEvent: () => {}, resize: () => {}, destroy: () => {},
  }
}

let raiz: HTMLElement
const botao = (rotulo: string): HTMLButtonElement =>
  raiz.querySelector<HTMLButtonElement>(`button[aria-label="${rotulo}"]`)!
const nivel = (): string => raiz.querySelector('.zoom-nivel')!.textContent ?? ''

beforeEach(() => { raiz = document.createElement('div') })

describe('mountZoom', () => {
  it('fica escondido enquanto a cena não chegou', () => {
    mountZoom(raiz, () => null)
    expect(raiz.querySelector<HTMLElement>('.zoom')!.hidden).toBe(true)
  })

  it('aparece quando a cena chega, ao ser sincronizado', () => {
    let cena: Scene | null = null
    const controle = mountZoom(raiz, () => cena)
    cena = cenaFalsa(2)
    controle.sincronizar()
    expect(raiz.querySelector<HTMLElement>('.zoom')!.hidden).toBe(false)
    expect(nivel()).toBe('2×')
  })

  it('aproxima e afasta de um em um, mostrando o nível', () => {
    const cena = cenaFalsa(2)
    mountZoom(raiz, () => cena)
    botao('Aproximar').click()
    expect(nivel()).toBe('3×')
    botao('Afastar').click()
    botao('Afastar').click()
    expect(nivel()).toBe('1×')
  })

  it('desabilita o botão da ponta, em vez de deixar clicar e nada acontecer', () => {
    const cena = cenaFalsa(ZOOM_MINIMO)
    const controle = mountZoom(raiz, () => cena)
    controle.sincronizar()
    expect(botao('Afastar').disabled).toBe(true)
    expect(botao('Aproximar').disabled).toBe(false)
    botao('Aproximar').click()
    botao('Aproximar').click()
    expect(nivel()).toBe(`${ZOOM_MAXIMO}×`)
    expect(botao('Aproximar').disabled).toBe(true)
    expect(botao('Afastar').disabled).toBe(false)
  })

  it('afasta para 0,5x e volta a 1x com o botão Normal', () => {
    const cena = cenaFalsa(1)
    mountZoom(raiz, () => cena)
    botao('Afastar').click()
    expect(nivel()).toBe('0,5×')
    expect(botao('Afastar').disabled).toBe(true)
    botao('Restaurar zoom normal').click()
    expect(nivel()).toBe('1×')
    expect(botao('Restaurar zoom normal').disabled).toBe(true)
  })

  it('avisa apenas quando o zoom realmente mudou, para salvar a preferência', () => {
    const valores: number[] = []
    const cena = cenaFalsa(ZOOM_MINIMO)
    mountZoom(raiz, () => cena, (valor) => valores.push(valor))
    botao('Afastar').click()
    expect(valores).toEqual([])
    botao('Aproximar').click()
    botao('Restaurar zoom normal').click()
    expect(valores).toEqual([1])
  })

  it('desmontar tira o controle da tela', () => {
    const controle = mountZoom(raiz, () => cenaFalsa(2))
    controle.desmontar()
    expect(raiz.querySelector('.zoom')).toBeNull()
  })
})
