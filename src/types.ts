export type CategoryType = 'ethnic wear' | 'western wear' | 'footwear' | 'accessories';
export type OccasionType = 'wedding' | 'festival' | 'daily' | 'office' | 'casual' | 'work' | 'party';
export type GenderType = 'men' | 'women' | 'unisex' | 'kids';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryType;
  price: number;
  mrp: number;
  occasion: OccasionType;
  color: string;
  gender: GenderType;
  styleTags: string[];
  region_relevance: string[]; // e.g. ["Bihar", "Uttar Pradesh"]
  imageUrl: string;
  local_purchase_count: number;
  local_trending_tag: string;
  rating?: number;
  reviewCount?: string;
  isAd?: boolean;
}

export interface CityStateResult {
  city: string;
  state: string;
  cached?: boolean;
  fallbackUsed?: boolean;
}

export interface FestivalItem {
  name: string;
  dateRange: string;
  culturalNote: string;
}

export interface EditorialContextData {
  festivals: FestivalItem[];
  headline: string;
  subtext: string;
  userDate?: string;
  cached?: boolean;
  error?: string;
}

export interface FestivalData {
  festivals?: FestivalItem[];
  festival?: string;
  dateRange?: string;
  culturalNote?: string;
  cached?: boolean;
}

export interface BannerCopyData {
  headline: string;
  subtext: string;
  cached?: boolean;
}

export interface MatchedFestiveFit {
  product: Product;
  matchedFestivalName: string;
  matchScore: number;
  matchReason: string;
}

export interface SearchIntent {
  category?: CategoryType | string | null;
  occasion?: OccasionType | string | null;
  price_range?: {
    min?: number;
    max?: number;
  } | null;
  gender?: GenderType | string | null;
  keywords?: string[];
  rawQuery?: string;
}
