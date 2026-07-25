import { Product, FestivalItem, MatchedFestiveFit } from '../types';

// Map of festival keywords to specific clothing and style tags
const FESTIVAL_TAG_MAP: Record<string, string[]> = {
  // Punjab / Haryana
  baisakhi: ['patiala suit', 'phulkari', 'punjabi suit', 'jutti', 'chikankari', 'dupatta', 'mojari', 'kurta pajama', 'nehru jacket'],
  lohri: ['patiala suit', 'phulkari', 'mojari', 'sherwani', 'jutti', 'kurta pajama', 'nehru jacket'],
  gurpurab: ['patiala suit', 'phulkari', 'kurta pajama', 'nehru jacket', 'jutti', 'dupatta'],
  
  // Bihar / UP / Jharkhand
  chhath: ['pure tussar', 'handloom', 'traditional', 'temple border', 'jhumka', 'chikankari', 'silk', 'saree', 'dhoti kurta'],
  teej: ['saree', 'bandhani', 'green', 'red', 'potli bag', 'jhumka', 'gotapatti', 'silk', 'patiala suit', 'phulkari', 'jutti'],
  saraswati: ['yellow', 'mustard gold', 'handloom', 'chikankari', 'saree', 'kurta'],

  // West Bengal / Odisha
  durga: ['silk', 'handloom', 'pure tussar', 'zardozi', 'potli bag', 'traditional', 'kantha'],
  poila: ['cotton', 'handloom', 'jamdani', 'saree', 'kurta'],

  // Maharashtra / Goa
  ganesh: ['paithani', 'silk', 'zari border', 'kolhapuri', 'leather', 'peacock motif'],
  gudi: ['paithani', 'silk', 'ethnic', 'kolhapuri'],

  // Tamil Nadu / Kerala / Karnataka
  pongal: ['kanjeevaram', 'pure silk', 'gold zari', 'temple border', 'temple jewelry', 'veshti'],
  onam: ['kasavu', 'gold zari', 'handloom', 'pure silk', 'temple jewelry'],
  ugadi: ['silk', 'kanjeevaram', 'temple jewelry', 'linen'],
  dasara: ['mysore silk', 'kanjeevaram', 'temple jewelry', 'royal'],

  // Gujarat / Rajasthan
  navratri: ['bandhani', 'tie and dye', 'gotapatti', 'lehenga', 'mojari', 'chaniya choli'],
  garba: ['bandhani', 'gotapatti', 'jhumka', 'mojari'],
  diwali: ['bandhani', 'gotapatti', 'zardozi', 'kundan', 'silk', 'mojari', 'jhumka', 'potli bag'],
  
  // Assam / North East
  bihu: ['muga silk', 'tussar', 'handloom', 'traditional'],
};

export function getTopFitsForFestival(
  festival: FestivalItem,
  state: string,
  products: Product[],
  limit = 8
): MatchedFestiveFit[] {
  const festNameLower = festival.name.toLowerCase();
  const noteLower = festival.culturalNote.toLowerCase();
  const stateLower = state.toLowerCase();

  // Extract matching style tags for this festival
  const relevantTags: string[] = [];
  for (const [key, tags] of Object.entries(FESTIVAL_TAG_MAP)) {
    if (festNameLower.includes(key) || noteLower.includes(key)) {
      relevantTags.push(...tags);
    }
  }

  // Helper function to check if a product is truly an ethnic / festive item
  const isEthnicFestiveItem = (product: Product): boolean => {
    const cat = product.category.toLowerCase();
    if (cat === 'ethnic wear') return true;

    const textSpace = `${product.name} ${product.styleTags.join(' ')} ${product.local_trending_tag}`.toLowerCase();

    if (cat === 'footwear') {
      // Allow only traditional ethnic footwear (juttis, mojaris, kolhapuri, festive heels/sandals)
      return (
        textSpace.includes('jutti') ||
        textSpace.includes('mojari') ||
        textSpace.includes('kolhapuri') ||
        textSpace.includes('heels') ||
        textSpace.includes('sandals') ||
        textSpace.includes('ethnic') ||
        textSpace.includes('embroidery')
      );
    }

    if (cat === 'accessories') {
      // Allow only traditional jewelry, potli bags, or ethnic accessories
      return (
        textSpace.includes('jhumka') ||
        textSpace.includes('kundan') ||
        textSpace.includes('temple') ||
        textSpace.includes('potli') ||
        textSpace.includes('pearl') ||
        textSpace.includes('jewelry') ||
        textSpace.includes('jewellery') ||
        textSpace.includes('zardozi') ||
        textSpace.includes('necklace')
      );
    }

    return false;
  };

  const scoredFits: MatchedFestiveFit[] = [];

  products.forEach((product) => {
    // 1. STRICT EXCLUSION: Only allow ethnic/festive appropriate products
    if (!isEthnicFestiveItem(product)) {
      return;
    }

    let score = 0;

    // 2. Direct State / Region match
    const isStateMatch = product.region_relevance.some(
      (r) => r.toLowerCase() === stateLower
    );

    if (isStateMatch) {
      score += 60;
    }

    // 3. Occasion relevance
    if (product.occasion === 'festival') score += 30;
    else if (product.occasion === 'wedding') score += 20;

    // 4. Style tags & keyword alignment against festival requirements
    let tagMatches = 0;
    product.styleTags.forEach((tag) => {
      const tagL = tag.toLowerCase();
      if (relevantTags.some((rt) => tagL.includes(rt) || rt.includes(tagL))) {
        tagMatches++;
        score += 35;
      }
      if (noteLower.includes(tagL) || festNameLower.includes(tagL)) {
        score += 25;
      }
    });

    // 5. Product name / local trending tag alignment with festival or state
    const nameL = product.name.toLowerCase();
    const trendL = product.local_trending_tag.toLowerCase();
    if (nameL.includes(festNameLower) || trendL.includes(festNameLower)) score += 40;
    if (nameL.includes(stateLower) || trendL.includes(stateLower)) score += 30;

    // If neither state match nor tag match, keep score low or skip if limit is tight
    if (!isStateMatch && tagMatches === 0 && !trendL.includes(stateLower) && !nameL.includes(stateLower)) {
      score = Math.max(5, score - 20);
    }

    // Calculate match score percentage (85% - 99%)
    const matchScore = Math.min(99, Math.max(85, Math.round(75 + score / 2)));

    // Build specific match reason string
    let matchReason = `Top Choice for ${festival.name} in ${state}`;
    if (tagMatches > 0) {
      matchReason = `${product.styleTags.slice(0, 2).join(' & ')} fit for ${festival.name}`;
    } else if (isStateMatch) {
      matchReason = `${state} traditional favorite for ${festival.name}`;
    }

    scoredFits.push({
      product,
      matchedFestivalName: festival.name,
      matchScore,
      matchReason,
    });
  });

  // Sort by highest match score first, then state match, then local purchase count
  scoredFits.sort((a, b) => {
    const aState = a.product.region_relevance.some(r => r.toLowerCase() === stateLower);
    const bState = b.product.region_relevance.some(r => r.toLowerCase() === stateLower);

    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    if (aState !== bState) {
      return aState ? -1 : 1;
    }
    return b.product.local_purchase_count - a.product.local_purchase_count;
  });

  // Fallback: If strict state match yields fewer items than limit, include top rated ethnic items ONLY
  if (scoredFits.length < limit) {
    const existingIds = new Set(scoredFits.map(f => f.product.id));
    const fallbackProducts = products
      .filter(p => !existingIds.has(p.id) && isEthnicFestiveItem(p))
      .slice(0, limit - scoredFits.length);

    fallbackProducts.forEach(p => {
      scoredFits.push({
        product: p,
        matchedFestivalName: festival.name,
        matchScore: 85,
        matchReason: `Festive popular choice in ${state}`
      });
    });
  }

  return scoredFits.slice(0, limit);
}

export function getAllRegionalFestiveFits(
  festivals: FestivalItem[],
  state: string,
  products: Product[]
): {
  matchedFits: MatchedFestiveFit[];
  festivalFitsMap: Record<string, MatchedFestiveFit[]>;
} {
  const festivalFitsMap: Record<string, MatchedFestiveFit[]> = {};
  const fitProductIds = new Set<string>();
  const matchedFits: MatchedFestiveFit[] = [];

  festivals.forEach((fest) => {
    const fits = getTopFitsForFestival(fest, state, products, 8);
    festivalFitsMap[fest.name] = fits;

    fits.forEach((fit) => {
      if (!fitProductIds.has(fit.product.id)) {
        fitProductIds.add(fit.product.id);
        matchedFits.push(fit);
      }
    });
  });

  // Sort overall matched fits by match score
  matchedFits.sort((a, b) => b.matchScore - a.matchScore);

  return {
    matchedFits,
    festivalFitsMap,
  };
}
