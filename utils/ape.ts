/**
 * Mapping of APE/NAF codes to human-readable labels
 */
export const APE_LABELS: Record<string, string> = {
    // --- Restauration ---
    '56.10A': 'Restauration traditionnelle',
    '56.10B': 'Cafétérias et autres libres-services',
    '56.10C': 'Restauration rapide',
    '56.21Z': 'Services des traiteurs',
    '56.29A': 'Restauration collective sous contrat',
    '56.29B': 'Autres services de restauration',
    '56.30Z': 'Débits de boissons',

    // --- Commerce alimentaire ---
    '47.11A': 'Commerce de détail de produits surgelés',
    '47.11B': 'Commerce d\'alimentation générale',
    '47.11C': 'Supérettes',
    '47.11D': 'Supermarchés',
    '47.11F': 'Hypermarchés',
    '47.24Z': 'Boulangeries et boulangeries-pâtisseries',
    '47.29Z': 'Autres commerces de détail alimentaires en magasin spécialisé',
    '47.76Z': 'Commerce de détail de fleurs, plantes et graines',
    '47.79Z': 'Commerce de détail de biens d\'occasion en magasin',
    '47.62Z': 'Commerce de détail de journaux et papeterie',
    '47.89Z': 'Autres commerces de détail sur éventaires et marchés',
    '47.91A': 'Vente à distance sur catalogue général',
    '47.91B': 'Vente à distance sur catalogue spécialisé',
    '47.99A': 'Vente à domicile',
    '47.99B': 'Vente par automates et autres commerces de détail hors magasin',

    // --- Industrie alimentaire ---
    '10.11Z': 'Transformation et conservation de la viande de boucherie',
    '10.13A': 'Préparation industrielle de produits à base de viande',
    '10.52Z': 'Fabrication de glaces et sorbets',
    '10.71A': 'Fabrication industrielle de pain et de pâtisserie fraîche',
    '10.71B': 'Cuisson de produits de boulangerie',
    '10.71C': 'Boulangerie et boulangerie-pâtisserie',
    '10.71D': 'Pâtisserie',

    // --- Immobilier ---
    '68.20A': 'Location de logements',
    '68.20B': 'Location de terrains et d\'autres biens immobiliers',

    // --- Services aux entreprises ---
    '70.10Z': 'Activités des sièges sociaux',
    '70.22Z': 'Conseil pour les affaires et autres conseils de gestion',
    '74.20Z': 'Activités photographiques',

    // --- Nettoyage & services ---
    '81.21Z': 'Nettoyage courant des bâtiments',
    '82.30Z': 'Organisation de foires, salons et congrès',
    '80.10Z': 'Activités de sécurité privée',

    // --- Transport & logistique ---
    '49.32Z': 'Transports de voyageurs par taxis',
    '53.20Z': 'Autres activités de poste et de courrier',

    // --- Commerce de gros ---
    '46.45Z': 'Commerce de gros de parfumerie et de produits de beauté',
    '46.90Z': 'Commerce de gros non spécialisé',
}

/**
 * Returns the human-readable label for an APE code, or the code itself if unknown.
 * e.g. "56.10A" → "Restauration traditionnelle"
 */
export function apeLabel(code: string | null | undefined): string {
    if (!code) return '—'
    // Normalize: INSEE sometimes returns without dot (5610A → 56.10A)
    const normalized = code.includes('.') ? code : code.replace(/^(\d{2})(\d{2})([A-Z])$/, '$1.$2$3')
    return APE_LABELS[normalized] || code
}
