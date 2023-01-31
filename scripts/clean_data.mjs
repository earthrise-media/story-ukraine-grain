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

// First we need to get a list of files in the folder
const files = fs.readdirSync(path.join(process.cwd(), "public/data/ovuzpsg_1221"));

// remove 'cleaned' from the list of files
files.splice(files.indexOf("cleaned"), 1);

console.log({files})

// Then we need to loop through each file and clean it up
files.forEach((file) => {
  // Read the file
  const fileData = fs.readFileSync(
    path.join(process.cwd(), "public/data/ovuzpsg_1221", file),
    "utf8"
  );

  // console.log('fileData', fileData)

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
        oblastNameEnglish
      ] = row;
      // make a new object to return for each row
      return {
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
        oblastNameEnglish
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
    path.join(process.cwd(), "public/data/ovuzpsg_1221/cleaned", file),
    d3.csvFormat(parsed_data)
  );

});