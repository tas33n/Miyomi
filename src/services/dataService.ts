import { supabaseDataService } from './supabaseDataService';
import type { AppData, ExtensionData, FAQData, GuideCategoryData } from '../types/data';

const service = supabaseDataService;

export const dataService = {
  getApps: (): Promise<AppData[]> => service.getApps(),
  getExtensions: (): Promise<ExtensionData[]> => service.getExtensions(),
  getFAQs: (): Promise<FAQData[]> => service.getFAQs(),
  getGuideCategories: (): Promise<GuideCategoryData[]> => service.getGuideCategories(),
};
