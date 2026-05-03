
/**
 * Ollama Bridge
 * This script allows Antigravity to communicate with the local Ollama instance using native fetch.
 */

const OLLAMA_URL = 'http://localhost:11434/api/generate';

async function queryLocalAI(prompt: string, model: string = 'qwen3.5:27b') {
    try {
        console.log(`\n--- Consulting Local AI (${model}) ---`);
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error connecting to Ollama:', error.message);
        return null;
    }
}

// Example usage (run with ts-node or similar):
// queryLocalAI("Hello!").then(console.log);

export { queryLocalAI };
