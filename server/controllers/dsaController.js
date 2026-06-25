const fs = require('fs');
const path = require('path');
const Algorithm = require('../models/Algorithm');

/**
 * Controller to fetch the DSA Taxonomy
 */
const getTaxonomy = (req, res) => {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'dsa_taxonomy.json');
    const data = fs.readFileSync(dataPath, 'utf8');
    const taxonomy = JSON.parse(data);
    return res.status(200).json({ success: true, taxonomy });
  } catch (error) {
    console.error("Error reading DSA taxonomy:", error);
    return res.status(500).json({ success: false, message: "Failed to load DSA taxonomy data" });
  }
};

/**
 * Controller to fetch details for a specific algorithm from MongoDB
 */
const getAlgorithmDetails = async (req, res) => {
  try {
    const algoName = req.params.name;
    
    // Auto-seed database from JSON if empty
    const count = await Algorithm.countDocuments();
    if (count === 0) {
      console.log("Seeding algorithms to MongoDB from JSON...");
      const dataPath = path.join(__dirname, '..', 'data', 'dsa_algorithms.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf8').replace(/^\uFEFF/, '');
        const algorithms = JSON.parse(raw);
        
        const algosToInsert = Object.keys(algorithms).map(key => ({
            name: key,
            ...algorithms[key]
        }));
        await Algorithm.insertMany(algosToInsert);
        console.log(`Seeded ${algosToInsert.length} algorithms.`);
      }
    }
    
    // Fetch from MongoDB
    const algo = await Algorithm.findOne({ name: algoName });
    
    if (algo) {
      return res.status(200).json({ success: true, requestedName: algoName, details: algo });
    } else {
      return res.status(200).json({ success: true, requestedName: algoName, details: { description: "Algorithm details not found in database for: " + algoName, pseudoCode: "" } });
    }
    
  } catch (error) {
    console.error("Error reading algorithm details from DB:", error);
    return res.status(500).json({ success: false, message: "Failed to load algorithm details from database" });
  }
};

module.exports = {
  getTaxonomy,
  getAlgorithmDetails,
};
