import type { ShardWithKey, Recipes } from "../types";

export class DataService {
  private static instance: DataService;
  private shardsCache: ShardWithKey[] | null = null;
  private shardNameToKeyCache: Record<string, string> | null = null;
  private defaultRatesCache: Record<string, number> | null = null;
  private recipesCache: Recipes | null = null;

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async loadShards(): Promise<ShardWithKey[]> {
    if (this.shardsCache) {
      return this.shardsCache;
    }

    try {
      const response = await fetch("/fusion-data.json");
      const data = await response.json();

      this.shardsCache = Object.entries(data.shards).map(([key, shard]: [string, any]) => ({
        key,
        ...shard,
        id: key,
      }));

      return this.shardsCache;
    } catch (error) {
      throw new Error(`Failed to load shards: ${error}`);
    }
  }

  async getShardNameToKeyMap(): Promise<Record<string, string>> {
    if (this.shardNameToKeyCache) {
      return this.shardNameToKeyCache;
    }

    const shards = await this.loadShards();
    this.shardNameToKeyCache = shards.reduce((acc, shard) => {
      acc[shard.name.toLowerCase()] = shard.key;
      return acc;
    }, {} as Record<string, string>);

    return this.shardNameToKeyCache;
  }

  async loadDefaultRates(): Promise<Record<string, number>> {
    if (this.defaultRatesCache) {
      return this.defaultRatesCache;
    }

    try {
      const response = await fetch("/rates.json");
      this.defaultRatesCache = await response.json();
      return this.defaultRatesCache!;
    } catch (error) {
      throw new Error(`Failed to load default rates: ${error}`);
    }
  }

  async loadRecipes(): Promise<Recipes> {
    if (this.recipesCache) {
      return this.recipesCache;
    }

    try {
      const response = await fetch("/fusion-data.json");
      const data = await response.json();

      const recipes: Recipes = {};
      for (const outputShard in data.recipes) {
        recipes[outputShard] = [];
        for (const qtyStr in data.recipes[outputShard]) {
          const qty = parseInt(qtyStr);
          const recipeList = data.recipes[outputShard][qtyStr];
          recipeList.forEach((inputs: [string, string]) => {
            recipes[outputShard].push({ inputs, outputQuantity: qty });
          });
        }
      }

      this.recipesCache = recipes;
      return recipes;
    } catch (error) {
      throw new Error(`Failed to load recipes: ${error}`);
    }
  }

  async searchShards(query: string): Promise<ShardWithKey[]> {
    const shards = await this.loadShards();
    const lowerQuery = query.toLowerCase();

    return shards.filter((shard) => shard.name.toLowerCase().includes(lowerQuery));
  }

  async getShardByKey(key: string): Promise<ShardWithKey | undefined> {
    const shards = await this.loadShards();
    return shards.find((shard) => shard.key === key);
  }

  async getShardByName(name: string): Promise<ShardWithKey | undefined> {
    const nameToKeyMap = await this.getShardNameToKeyMap();
    const key = nameToKeyMap[name.toLowerCase()];
    if (!key) return undefined;

    return this.getShardByKey(key);
  }
}
