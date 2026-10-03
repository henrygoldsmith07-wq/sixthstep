import programmes from "@/data/catalogue/programmes.json";
import directories from "@/data/catalogue/directories.json";
import order from "@/data/catalogue/index.json";
import { validateCatalogue } from "./catalogue-validation";
export const catalogue=validateCatalogue([...programmes,...directories],order);
