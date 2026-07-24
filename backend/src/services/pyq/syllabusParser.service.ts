export class SyllabusParserService {
  static parseUnits(text: string): { name: string }[] {
    // Regex to match "Unit 1", "UNIT-I", "UNIT I", "Unit - 1", "1. Unit", "I. Unit"
    // Non-capturing group for 'unit', optional spaces/dashes, capturing group for number or roman numeral up to VIII.
    const regex = /(?:unit\s*[-:]?\s*([1-9]|i{1,3}|iv|v|vi{1,3}))|(?:([1-9]|i{1,3}|iv|v|vi{1,3})\s*\.\s*unit)/gi;
    
    const unitsSet = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      // match[1] is the number/roman if 'Unit X' matched
      // match[2] is the number/roman if 'X. Unit' matched
      const numOrRoman = (match[1] || match[2]).toUpperCase();
      unitsSet.add(`Unit ${numOrRoman}`);
    }
    
    return Array.from(unitsSet).map(name => ({ name }));
  }
}
