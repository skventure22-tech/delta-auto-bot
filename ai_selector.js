import { scalpingStrategy } from './strategy.js';

export function selectStrategy(market){
  // Later ML model attach karta yeil
  if(market.volatility > 1.5){
    return scalpingStrategy;
  }
  return scalpingStrategy;
}
