
import { config } from 'dotenv';
config();

// To improve development startup time, comment out the flows you are not currently working on.
import '@/ai/flows/government-scheme-suggestions.ts';
import '@/ai/flows/smart-irrigation-scheduling.ts';
import '@/ai/flows/crop-price-info.ts';
import '@/ai/flows/crop-suggestion.ts';
import '@/ai/flows/soil-quality-advisor.ts';
import '@/ai/flows/suggest-soil-type.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/send-contact-email.ts';
