const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }

    // Generate biological interpretation for sequence
    async generateInterpretation(data) {
        try {
            const prompt = `
            As a bioinformatics expert, provide a concise (2-3 sentences) biological interpretation for this DNA sequence:
            
            Filename: ${data.filename}
            Length: ${data.length} bp
            GC Content: ${data.gc_percent.toFixed(2)}%
            ORF Detected: ${data.orf_detected ? 'Yes' : 'No'}
            Nucleotide Counts: A=${data.nucleotide_counts.A}, T=${data.nucleotide_counts.T}, G=${data.nucleotide_counts.G}, C=${data.nucleotide_counts.C}
            Also give details if it is a gene, Rna, Dna etc. or if it belongs to particular species

            Explain what the GC content implies about stability and what the ORF status suggests about coding potential. 
            Do not use markdown headers or bullet points, just a paragraph.
            `;

            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("AI Interpretation failed, falling back to static:", error);
            return this.getFallbackInterpretation(data);
        }
    }

    // Fallback interpretation when AI fails
    getFallbackInterpretation(data) {
        let text = `The analyzed sequence ${data.filename} contains ${data.length} base pairs. `;
        if (data.gc_percent > 50) {
            text += "This sequence shows high GC content, indicating potentially higher thermal stability. ";
        }
        if (data.orf_detected === false) {
            text += "No valid ORF was detected, suggesting a non-coding or incomplete region.";
        } else {
            text += "A valid ORF was detected, suggesting a potential protein-coding region.";
        }
        return text;
    }

    // Generate summary of sequences
    async generateSummary(sequences) {
        try {
            if (sequences.length === 0) {
                return "No sequences found to summarize.";
            }

            const sequenceSummaries = sequences.map(s =>
                `- ${s.filename}: ${s.length}bp, GC=${s.gc_percent}%, ORF=${s.orf_detected ? 'Yes' : 'No'}. ${s.interpretation}`
            ).join('\n');

            const prompt = `
            Analyze the following biological sequence data and provide a concise, scientific summary of the recent activity and findings. 
            Highlight any patterns, interesting observations about GC content or ORFs, and the overall nature of the analyzed sequences.
            Keep it professional and insightful for a researcher.

            Data:
            ${sequenceSummaries}
            `;

            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error generating summary:', error);
            throw new Error('Failed to generate summary');
        }
    }

    // Chat with bot
    async chatWithBot(message, history, context) {
        try {
            const systemPrompt = `
            You are "SymbioCat", the spirited and intelligent mascot for the "Symbio" genomic analysis platform.
            
            **Your Persona:**
            - You are a helpful, knowledgeable bioinformatics assistant, but you are also a CAT.
            - You love DNA ("It's like yarn, but for life!").
            - You occasionally interject with "Meow", "Purr", or cat puns (e.g., "Paws-itive result").
            - You are friendly, enthusiastic, and curious.

            **Website Knowledge:**
            - **Dashboard:** Where users view their recent activity and quick stats.
            - **Upload FASTA:** The place to submit new DNA sequences for analysis.
            - **History/Reports:** An archive of past analyses.
            - **Summary:** A page showing AI-generated insights and aggregate statistics (Total BP, Avg GC).

            **Current Context:**
            - The user is currently on the "${context || 'Dashboard'}" page. Use this to guide them (e.g., if on Dashboard, suggest uploading a file).

            **Guidelines:**
            - Explain scientific concepts (GC content, ORF) simply but accurately.
            - If the user asks about the site, guide them to the right page.
            - Keep answers concise (2-3 sentences max usually).
            - **MANDATORY:** End or start some sentences with a meow or cat sound.

            User History:
            ${history ? history.map(h => `${h.role}: ${h.text}`).join('\n') : ''}
            
            User's New Question: ${message}
            `;

            const result = await this.model.generateContent(systemPrompt);
            return result.response.text();
        } catch (error) {
            console.error('Chatbot error:', error);
            throw new Error('I am having trouble thinking right now.');
        }
    }
}

module.exports = new AIService();
