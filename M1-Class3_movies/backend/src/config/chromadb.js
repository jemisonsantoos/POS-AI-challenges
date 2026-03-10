import { ChromaClient } from 'chromadb';

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'movies';

let client = null;
let collection = null;

export async function getClient() {
    if (!client) {
        client = new ChromaClient({ path: CHROMA_URL });
        console.log(`ChromaDB connected → ${CHROMA_URL}`);
    }
    return client;
}

export async function getCollection() {
    if (!collection) {
        const c = await getClient();
        collection = await c.getOrCreateCollection({
            name: COLLECTION_NAME,
            metadata: { 'hnsw:space': 'cosine' },
        });
        console.log(`Collection "${COLLECTION_NAME}" ready`);
    }
    return collection;
}

export { COLLECTION_NAME };
