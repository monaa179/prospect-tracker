import { describe, it, expect } from 'vitest'
import { normalizeName, normalizePhone, extractEmails, extractMobiles, calculateMatchingScore, getContactStrength } from './prospect.utils'

describe('Prospect Utilities', () => {
    it('should normalize restaurant names', () => {
        expect(normalizeName('Restaurant Le Gourmet SAS')).toBe('gourmet')
        expect(normalizeName('Chez l\'ami Jean')).toBe('ami jean')
        expect(normalizeName('L\'Auberge du Lac')).toBe('auberge lac')
        expect(normalizeName('Café de la Gare')).toBe('cafe gare')
    })

    it('should normalize phone numbers', () => {
        expect(normalizePhone('0612345678')).toBe('06 12 34 56 78')
        expect(normalizePhone('+33 6 12 34 56 78')).toBe('06 12 34 56 78')
        expect(normalizePhone('01.23.45.67.89')).toBe('01 23 45 67 89')
        expect(normalizePhone('invalid')).toBe(null)
    })

    it('should extract emails from text', () => {
        const text = 'Contact: test@example.com, info@resto.fr. Non-email: abc@def.'
        const emails = extractEmails(text)
        expect(emails).toContain('test@example.com')
        expect(emails).toContain('info@resto.fr')
        expect(emails.length).toBe(2)
    })

    it('should extract French mobiles from text', () => {
        const text = 'Mobile: 06 12 34 56 78, Fixe: 01 23 45 67 89, Autre: +33 7 12 34 56 78'
        const mobiles = extractMobiles(text)
        expect(mobiles).toContain('06 12 34 56 78')
        expect(mobiles).toContain('07 12 34 56 78')
        expect(mobiles.length).toBe(2)
    })

    it('should calculate matching score based on name and postcode', () => {
        const insee = { name: 'Le Bistrot', postcode: '75001' }
        const osm = { name: 'LE BISTROT restaurant', postcode: '75001', lat: 48.8566, lon: 2.3522 }

        // Perfect match (normalized)
        expect(calculateMatchingScore(insee, osm)).toBeGreaterThanOrEqual(90)

        // Name match but different postcode
        const osm2 = { name: 'Le Bistrot', postcode: '69002', lat: 45.7578, lon: 4.8320 }
        expect(calculateMatchingScore(insee, osm2)).toBe(60)
    })

    it('should determine contact strength', () => {
        expect(getContactStrength(['a@b.com'], ['06 11 22 33 44'])).toBe('email+mobile')
        expect(getContactStrength(['a@b.com'], [])).toBe('email_only')
        expect(getContactStrength([], ['06 11 22 33 44'])).toBe('mobile_only')
        expect(getContactStrength([], [])).toBe('none')
    })
})
