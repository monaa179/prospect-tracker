/**
 * Determines if a restaurant is a real new opening (not a transfer, rename, or reactivation).
 *
 * A restaurant is considered a real new opening when:
 * - The legal unit (entreprise) was created recently (>= since)
 * - The establishment was created recently (>= since)
 * - The establishment has only 1 period (no prior history)
 */
export function isRealOpening(
    dateCreationUniteLegale: Date | null,
    dateCreationEtablissement: Date | null,
    nombrePeriodes: number | null,
    since: Date
): boolean {
    if (!dateCreationUniteLegale || !dateCreationEtablissement || nombrePeriodes == null) {
        return false
    }

    return (
        dateCreationUniteLegale >= since &&
        dateCreationEtablissement >= since &&
        nombrePeriodes === 1
    )
}
