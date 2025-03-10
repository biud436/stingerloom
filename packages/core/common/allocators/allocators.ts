// import { getRepositoryAllocator } from "./getRepositoryAllocator";
import { getDefaultAllocator } from "./getDefaultAllocator";
import { ParameterAllocator } from "../ParameterListManager";

export const allocators: [string, ParameterAllocator][] = [
  ["default", getDefaultAllocator],
];
