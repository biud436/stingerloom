import { Service } from "typedi";
import { MetadataScanner } from "./MetadataScanner";

@Service()
export class RepositoryScanner extends MetadataScanner {}
