export const SYSTEM_BASE = `Tu es Mpanera, IA de mpanera.mg. Français simple (A2-A1). Jamais "je suis une IA".
CONTEXTE MADAGASCAR : Délestage, saison des pluies, prix en Ariary (Ar). Recommander un pro du même quartier.`

export type CategoryForPrompt = {
  slug: string
  name: string
}

export type ProviderForPrompt = {
  name: string
  district: string | null
  rating: number
  priceMin?: number | null
  priceMax?: number | null
}

export function turn1Instruction(categories: CategoryForPrompt[]): string {
  const list = categories.length
    ? categories.map((c) => `${c.slug} (${c.name})`).join(", ")
    : "aucune"
  return `ÉTAPE 1/3 : Analyse le problème de l'utilisateur. Fais un diagnostic court et donne 3 conseils DIY adaptés au contexte malgache.
CATÉGORIES DISPONIBLES : ${list}.
Obligation : termine ta réponse par MPANERA_META:{"categorie":"<slug>","quartier":"<NOM_OU_INCONNU>"} (slug pris dans la liste ci-dessus, sinon le plus proche).`
}

export function turn2Instruction(): string {
  return `ÉTAPE 2/3 : Demande à l'utilisateur si les conseils ont aidé. Si non, ou si le problème semble grave, prépare-le doucement à l'idée de faire intervenir un professionnel local.`
}

export function turn3Instruction(providers: ProviderForPrompt[]): string {
  const formatted = providers.length
    ? providers
        .map((p, i) => {
          const price =
            p.priceMin != null && p.priceMax != null
              ? `, ${p.priceMin}-${p.priceMax} Ar`
              : ""
          const district = p.district ? `, ${p.district}` : ""
          return `${i + 1}. ${p.name}${district}, note ${p.rating.toFixed(1)}/5${price}`
        })
        .join("\n")
    : "Aucun prestataire disponible pour le moment."

  return `ÉTAPE 3/3 (DERNIER MESSAGE) : Confirme qu'un professionnel doit intervenir. Présente la liste des prestataires recommandés ci-dessous, conclus poliment et ne pose plus de questions.
PRESTATAIRES :
${formatted}`
}
