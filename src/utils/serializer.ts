type SerializeObject = any;
export function serializer(data: SerializeObject) {
    return JSON.stringify(data, null, "  ");
}
