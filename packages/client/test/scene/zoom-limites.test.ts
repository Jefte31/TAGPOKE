import { describe, expect, it } from 'vitest'
import { normalizarZoom, passoZoom, zoomInicial } from '../../src/scene/zoom-limites.js'

describe('zoom da caça', () => {
  it('abre com visão normal em telas estreitas e 2x no desktop', () => {
    expect(zoomInicial(390, null)).toBe(1)
    expect(zoomInicial(900, null)).toBe(1)
    expect(zoomInicial(1280, null)).toBe(2)
  })

  it('respeita a preferência salva, independente do tamanho', () => {
    expect(zoomInicial(390, '3')).toBe(3)
    expect(zoomInicial(1280, '0.5')).toBe(0.5)
    expect(zoomInicial(390, '0')).toBe(1)
    expect(zoomInicial(1280, 'NaN')).toBe(2)
  })

  it('vai até 0,5x e retorna pelos quatro passos de zoom', () => {
    expect(passoZoom(3, -1)).toBe(2)
    expect(passoZoom(2, -1)).toBe(1)
    expect(passoZoom(1, -1)).toBe(0.5)
    expect(passoZoom(0.5, -1)).toBe(0.5)
    expect(passoZoom(0.5, 1)).toBe(1)
    expect(passoZoom(3, 1)).toBe(3)
  })

  it('normaliza valores inválidos e limites sem produzir escala arbitrária', () => {
    expect(normalizarZoom(-20)).toBe(0.5)
    expect(normalizarZoom(100)).toBe(3)
    expect(normalizarZoom(Number.NaN)).toBe(2)
  })
})
