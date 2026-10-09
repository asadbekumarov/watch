export interface CollectionItem {
  id: string;
  number: string;
  name: string;
  headline: string;
  theme: 'aura' | 'elixir' | 'rose' | 'crimson';
  colorHex: string;
  glowHex: string;
  image: string;
  description: string;
  specs: {
    movement: string;
    powerReserve: string;
    caseMaterial: string;
    waterResistance: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
}
