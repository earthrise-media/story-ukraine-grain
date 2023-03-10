/*

We have a folder of files in /public/data/ovuzpsg_1221/ that we need to clean up

The files are named like this:
- 4 зерн-Table 1.csv
- 5-Table 1.csv
- 6 пшен-Table 1.csv
- 7-Table 1.csv

Each of these files need to be cleaned up and saved as new files in /public/data/ovuzpsg_1221/cleaned/

  */

import fs from "fs";
import path from "path";
import * as d3 from "d3";
import slugify from "slugify";

// We use the spelling from the data set - NOT the map property data
function standardizeOblastSpelling(oblastName) {
  switch (oblastName) {
    // TODO crimea / sevastopal are missing due to russian occupation.
    case "khmelnytskyy":
      return "khmelnytskiy";
    case "kiev":
      return "kyiv";
    case "kiev-city":
      return "kyiv";
    case "odessa":
      return "odesa";
    case "mykolayiv":
      return "mikolayiv";
    case "transcarpathia":
      return "zakarpattya";
    default:
      return oblastName
  }
}

// Normalize our oblast name using slugify
function normalizeOblastName(key) {
  if (!key) return key;
  return standardizeOblastSpelling(
    slugify(key, {
      strict: true,
      lower: true,
    })
  );
}

// First we need to get a list of files in the folder
const files = fs.readdirSync(
  path.join(process.cwd(), "public/data/ovuzpsg_1221")
);

// remove 'cleaned' from the list of files
files.splice(files.indexOf("cleaned"), 1);

// We are going to combine all of the .csvs together at the end, so we need to make an array to hold them
const all_data = [];

// Then we need to loop through each file and clean it up
files.forEach((file) => {
  // Read the file
  const fileData = fs.readFileSync(
    path.join(process.cwd(), "public/data/ovuzpsg_1221", file),
    "utf8"
  );

  // console.log('fileData', fileData)

  // grab the current file name
  const fileName = file.split(".")[0];

  // grab the metadata out of the first 2 rows
  const metadata = d3.csvParseRows(fileData).slice(0, 2);

  // Parse the file
  const parsed_data = d3
    .csvParseRows(fileData)
    // throw away the first two header rows
    .slice(2)
    // make a new array where we pull out each row and do something with it
    .map((row) => {
      const [
        ,
        oblastNameUkrainian,
        harvestedArea,
        volume,
        grainYield,
        harvestedAreaEnterprise,
        volumeEnterprise,
        grainYieldEnterprise,
        harvestedAreaHousehold,
        volumeHousehold,
        grainYieldHousehold,
        oblastNameEnglish,
      ] = row;
      // make a new object to return for each row
      return {
        fileName,
        metadata,
        oblastNameUkrainian,
        harvestedArea: +harvestedArea,
        volume: +volume,
        grainYield: +grainYield,
        harvestedArea: +harvestedArea,
        volumeEnterprise: +volumeEnterprise,
        grainYieldEnterprise: +grainYieldEnterprise,
        harvestedAreaEnterprise: +harvestedAreaEnterprise,
        volumeHousehold: +volumeHousehold,
        grainYieldHousehold: +grainYieldHousehold,
        harvestedAreaHousehold: +harvestedAreaHousehold,
        oblastNameEnglish,
        oblastNameNormalized: normalizeOblastName(oblastNameEnglish),
      };
    })
    .filter((d) => d.oblastNameUkrainian);

  // Write the file as JSON
  // fs.writeFileSync(
  //   path.join(process.cwd(), "public/data/ovuzpsg_1221/cleaned", file),
  //   JSON.stringify(parsed_data, null, 2)
  // );

  // Write the file as .csv
  fs.writeFileSync(
    path.join(
      process.cwd(),
      "public/data/ovuzpsg_1221/cleaned",
      "all_data.csv"
    ),
    d3.csvFormat(parsed_data)
  );

  // Then we need to add the parsed data to the all_data array
  all_data.push(...parsed_data);
});

// Write the all_data array as JSON
fs.writeFileSync(
  path.join(process.cwd(), "public/data/ovuzpsg_1221/cleaned", "all_data.json"),
  JSON.stringify(all_data, null, 2)
);
