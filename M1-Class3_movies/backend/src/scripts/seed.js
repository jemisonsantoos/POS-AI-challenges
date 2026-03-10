import 'dotenv/config';
import { getClient, getCollection, COLLECTION_NAME } from '../config/chromadb.js';
import { generateMovies, buildEmbedding } from '../data/movies.js';

async function main() {
    const client = await getClient();
    const existingCollections = await client.listCollections();
    const exists = existingCollections.some(c => c === COLLECTION_NAME || c.name === COLLECTION_NAME);

    if (exists) {
        const col = await getCollection();
        const count = await col.count();
        if (count > 0) {
            console.log(`Collection "${COLLECTION_NAME}" already has ${count} documents. Skipping seed.`);
            console.log('To re-seed, delete the collection first (or remove the chroma_data volume).');
            return;
        }
    }

    console.log('Generating movie dataset...');
    const movies = generateMovies(100);
    const maxLikes = Math.max(...movies.map(m => m.likes));

    console.log(`Generated ${movies.length} movies (max likes: ${maxLikes})`);

    const genreCounts = {};
    for (const m of movies) genreCounts[m.genre] = (genreCounts[m.genre] || 0) + 1;
    console.log('\nGenre distribution:');
    for (const [g, c] of Object.entries(genreCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${g.padEnd(14)} ${c} movies`);
    }

    const collection = await getCollection();

    const BATCH_SIZE = 100;
    for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);

        await collection.add({
            ids: batch.map(m => m.id),
            embeddings: batch.map(m => buildEmbedding(m, maxLikes)),
            metadatas: batch.map(m => ({
                title: m.title,
                genre: m.genre,
                ageRating: m.ageRating,
                year: m.year,
                rating: m.rating,
                likes: m.likes,
                duration: m.duration,
                poster: m.poster,
                maxLikes,
            })),
            documents: batch.map(m =>
                `${m.title} — ${m.genre} (${m.year}) | Rating: ${m.rating} | Likes: ${m.likes} | Age: ${m.ageRating}`
            ),
        });

        console.log(`  Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(movies.length / BATCH_SIZE)}`);
    }

    const total = await collection.count();
    console.log(`\nSeed complete! ${total} movies in ChromaDB.`);
}

main().catch(err => { console.error(err); process.exit(1); });
