import axios from 'axios';

const BASE_URL = 'https://solsniffer.com/api/v1/sniffer';

export interface Token {
  address: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders: number;
  scanCount: number;
}

interface IndicatorSection {
  count: number;
  details: Record<string, boolean | null>;
}

interface IndicatorData {
  high: IndicatorSection;
  moderate?: IndicatorSection;
  low?: IndicatorSection;
  specific?: IndicatorSection;
}

interface LiquidityPool {
  address: string;
  amount: number;
  lpPair: string;
}

interface LiquidityList {
  fluxbeam?: LiquidityPool;
  meteoraDlmm?: LiquidityPool;
  raydium?: LiquidityPool;
  orca?: LiquidityPool;
}

interface Owner {
  address: string;
  amount: string;
  percentage: string;
}

interface AuditRisk {
  mintDisabled?: boolean;
  freezeDisabled?: boolean;
  lpBurned?: boolean;
  top10Holders?: boolean;
}

export interface TokenDetails {
  address: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  holders: number;
  scanCount: number;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  supply?: number;
  deployer?: string;
  deployTime?: string;
  score?: number;
  tokenImg?: string;
  type?: string;
  mint?: string;
  decimals?: number;
  auditRisk?: AuditRisk;
  ownersList?: Owner[];
  liquidityList?: LiquidityList[];
  indicatorData?: IndicatorData;
}

export interface ApiResponse<T> {
  tokenData: any[];
  success: boolean;
  data: T;
  message?: string;
}

export const api = {
  getMostScannedTokens: async (page: number = 0): Promise<Token[]> => {
    try {
      const response = await axios.get<ApiResponse<{tokenData: any[]}>>(`${BASE_URL}/getMostScannedTokens?page=${page}`);
      
      console.log('Raw API Response:', JSON.stringify(response.data, null, 2));

      // More flexible response structure handling
      const tokenData = response.data?.data?.tokenData || response.data?.tokenData || [];
      
      if (!Array.isArray(tokenData)) {
        console.error('Invalid tokenData structure:', tokenData);
        throw new Error('Invalid API response format: tokenData is not an array');
      }

      return tokenData.map(token => ({
        address: token.address || '',
        name: token.tokenName || token.name || 'Unknown',
        symbol: token.tokenSymbol || token.symbol || '',
        price: Number(token.price) || 0,
        marketCap: Number(token.marketCap) || 0,
        volume24h: Number(token.volume24h) || 0,
        priceChange24h: Number(token.priceChange24h) || 0,
        holders: Number(token.holders) || 0,
        scanCount: Number(token.pageViews || token.scanCount) || 0
      }));
    } catch (error) {
      console.error('Error fetching most scanned tokens:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch most scanned tokens: ${error.message}`);
      }
      throw new Error('Failed to fetch most scanned tokens');
    }
  },

  getTokenDetails: async (address: string): Promise<TokenDetails | null> => {
    try {
      const response = await axios.get<ApiResponse<{tokenData: any}>>(`${BASE_URL}/token/${address}`);
      
      console.log('Token Details Raw Response:', JSON.stringify(response.data, null, 2));

      // More flexible response structure handling
      const tokenData = response.data?.data?.tokenData || response.data?.tokenData || response.data;
      
      if (!tokenData || typeof tokenData !== 'object') {
        console.error('Invalid tokenData structure:', tokenData);
        throw new Error('Invalid API response format: tokenData is missing or invalid');
      }

      const externals = typeof tokenData.externals === 'string' 
        ? JSON.parse(tokenData.externals) 
        : tokenData.externals || {};

      const parseIndicatorDetails = (details: string | Record<string, boolean | null>): Record<string, boolean | null> => {
        if (typeof details === 'string') {
          try {
            return JSON.parse(details);
          } catch {
            return {};
          }
        }
        return details || {};
      };

      return {
        address: tokenData.address || '',
        name: tokenData.tokenName || tokenData.name || 'Unknown',
        symbol: tokenData.tokenSymbol || tokenData.symbol || '',
        price: Number(tokenData.price) || 0,
        marketCap: Number(tokenData.marketCap) || 0,
        volume24h: Number(tokenData.volume24h) || 0,
        priceChange24h: Number(tokenData.priceChange24h) || 0,
        holders: Number(tokenData.holders) || 0,
        scanCount: Number(tokenData.pageViews || tokenData.scanCount) || 0,
        supply: Number(tokenData.tokenOverview?.supply) || 0,
        deployer: tokenData.tokenOverview?.deployer,
        deployTime: tokenData.deployTime,
        score: Number(tokenData.score),
        tokenImg: tokenData.tokenImg,
        type: tokenData.tokenOverview?.type,
        mint: tokenData.tokenOverview?.mint,
        decimals: Number(tokenData.decimals),
        auditRisk: tokenData.auditRisk,
        ownersList: Array.isArray(tokenData.ownersList) ? tokenData.ownersList : [],
        liquidityList: tokenData.liquidityList || [],
        indicatorData: tokenData.indicatorData ? {
          high: {
            count: Number(tokenData.indicatorData.high?.count) || 0,
            details: parseIndicatorDetails(tokenData.indicatorData.high?.details || {})
          },
          moderate: tokenData.indicatorData.moderate ? {
            count: Number(tokenData.indicatorData.moderate.count) || 0,
            details: parseIndicatorDetails(tokenData.indicatorData.moderate.details)
          } : undefined,
          low: tokenData.indicatorData.low ? {
            count: Number(tokenData.indicatorData.low.count) || 0,
            details: parseIndicatorDetails(tokenData.indicatorData.low.details)
          } : undefined,
          specific: tokenData.indicatorData.specific ? {
            count: Number(tokenData.indicatorData.specific.count) || 0,
            details: parseIndicatorDetails(tokenData.indicatorData.specific.details)
          } : undefined
        } : undefined,
        description: tokenData.description,
        website: externals.website,
        twitter: externals.twitter_handle,
        telegram: externals.telegram_handle
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch token details: ${error.message}`);
      }
      throw new Error('Failed to fetch token details');
    }
  }
};
