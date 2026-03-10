/**
 * Utilities for prospect data processing and matching
 */

/**
 * Normalize a name for matching: lowercase, remove accents, remove stopwords
 */
export function normalizeName(name: string): string {
    if (!name) return ''

    // Lowercase and remove accents
    let normalized = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

    // Remove special characters
    normalized = normalized.replace(/[^a-z0-9 ]/g, ' ')

    // Stopwords (common restaurant words that don't help in matching)
    const stopwords = ['restaurant', 'resto', 'le', 'la', 'les', 'du', 'des', 'de', 'l', 'd', 'au', 'aux', 'chez', 'sarl', 'sas']

    return normalized
        .split(/\s+/)
        .filter(word => word && !stopwords.includes(word))
        .join(' ')
        .trim()
}

/**
 * Check if a normalized phone number is a French mobile (06 or 07)
 */
export function isMobile(phone: string | null): boolean {
    if (!phone) return false
    const digits = phone.replace(/\D/g, '')
    return digits.startsWith('06') || digits.startsWith('07')
}

/**
 * Normalize phone numbers to French format (06 or 07 for mobiles)
 */
export function normalizePhone(phone: string): string | null {
    if (!phone) return null

    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '')

    // Handle international format +33
    if (digits.startsWith('33')) {
        digits = '0' + digits.slice(2)
    }

    // Ensure it's a valid French number (10 digits starting with 0)
    if (digits.length === 10 && digits.startsWith('0')) {
        return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    }

    return null
}

/**
 * Extract emails from text
 */
export function extractEmails(text: string): string[] {
    if (!text) return []
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailRegex) || []
    return [...new Set(matches.map(e => e.toLowerCase()))]
}

/**
 * Extract French mobile numbers (06/07) from text
 */
export function extractMobiles(text: string): string[] {
    if (!text) return []

    // Match common French phone formats for 06/07
    // Examples: 0612345678, 06 12 34 56 78, +33 6 12 34 56 78, 06.12.34.56.78
    const phoneRegex = /(?:(?:\+|00)33|0)\s*[67](?:[\s.-]*\d{2}){4}/g
    const matches = text.match(phoneRegex) || []

    return [...new Set(matches.map(p => normalizePhone(p)).filter(isMobile) as string[])]
}

/**
 * Calculate distance between two coordinates in meters
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180
    const phi2 = lat2 * Math.PI / 180
    const deltaPhi = (lat2 - lat1) * Math.PI / 180
    const deltaLambda = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

/**
 * Calculate matching score between INSEE and OSM data (0-100)
 */
export function calculateMatchingScore(
    insee: { name: string, postcode: string, lat?: number, lon?: number },
    osm: { name: string, postcode?: string, lat?: number, lon?: number }
): number {
    let score = 0

    const normInsee = normalizeName(insee.name)
    const normOsm = normalizeName(osm.name)

    // 1. Name Similarity (Basic)
    if (normInsee === normOsm) {
        score += 60
    } else if (normInsee.includes(normOsm) || normOsm.includes(normInsee)) {
        score += 30
    }

    // 2. Postcode Match
    if (osm.postcode && insee.postcode === osm.postcode) {
        score += 30
    }

    // 3. Distance Match (< 150m)
    if (insee.lat && insee.lon && osm.lat && osm.lon) {
        const dist = getDistance(insee.lat, insee.lon, osm.lat, osm.lon)
        if (dist < 150) {
            score += 40
        } else if (dist < 500) {
            score += 10
        }
    }

    return Math.min(score, 100)
}

/**
 * Determine contact strength
 */
export function getContactStrength(emails: string[], mobiles: string[]): string {
    if (emails.length > 0 && mobiles.length > 0) return 'email+mobile'
    if (emails.length > 0) return 'email_only'
    if (mobiles.length > 0) return 'mobile_only'
    return 'none'
}
