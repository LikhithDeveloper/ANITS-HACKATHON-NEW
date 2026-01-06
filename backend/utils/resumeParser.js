const pdf = require('pdf-parse');
const fs = require('fs');

const parseResume = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
    const stats = fs.statSync(filePath);
    if (stats.size === 0) throw new Error("File is empty (0 bytes)");
    console.log(`Parsing PDF: ${filePath} (${stats.size} bytes)`);

    const dataBuffer = fs.readFileSync(filePath);
    
    // Standard pdf-parse v1.1.1 usage
    const data = await pdf(dataBuffer);
    
    // data.text contains the text content
    if (!data || !data.text) {
        throw new Error("No text extracted from PDF");
    }

    const text = data.text.replace(/\s+/g, ' ').trim();
    return text;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume file");
  }
};

module.exports = { parseResume };
