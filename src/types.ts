export interface Hull {
  Ship: string;
  Type: string;
  Tech: string;
  Faction: string;
}

export interface FleetItem {
  shipName: string;
  hull: string;
  tags: string[];
}

export interface TagCategory {
  category: string;
  tags: string[];
}
