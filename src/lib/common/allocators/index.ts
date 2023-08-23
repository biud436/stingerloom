import { getRepositoryAllocator } from "./getRepositoryAllocator";
import { getDefaultAllocator } from "./getDefaultAllocator";
import {
    ParameterAllocator,
    ParameterListManager,
} from "../ParameterListManager";

export const allocators: [string, ParameterAllocator][] = [
    ["Repository", getRepositoryAllocator],
    [ParameterListManager.DEFAULT, getDefaultAllocator],
];
