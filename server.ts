import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini AI client initialization
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured. Falling back to local smart heuristics.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: AI Auto-Responder when user is away/busy
app.post("/api/ai/auto-reply", async (req, res) => {
  try {
    const {
      userProfile,
      partnerProfile,
      chatHistory,
      partnerMessage,
      aiSettings,
    } = req.body;

    const tone = aiSettings?.personalityTone || "charmant_esprit";
    const flirting = aiSettings?.flirtingLevel || "subtil";
    const customInstructions = aiSettings?.customPromptInstructions || "";

    const toneDescriptions: Record<string, string> = {
      charmant_esprit: "Pétillant, spirituel, élégant, avec une touche d'humour fin et bienveillant.",
      romantique_doux: "Chaleureux, poétique, attentif et sincère, axé sur les émotions et le partage.",
      humour_petillant: "Très drôle, auto-dérisoire avec modération, vif et taquin mais toujours respectueux.",
      mysterieux: "Intriguant, séduisant avec subtilité, posant des questions ouvertes captivantes.",
      direct_bienveillant: "Authentique, direct, sans détour, chaleureux et engageant.",
    };

    const ai = getAiClient();

    if (!ai) {
      // Fallback generator if no key
      const fallbackReplies = [
        `Coucou ! Je suis actuellement un peu pris(e), mais ton message me fait très plaisir. J'ai vu qu'on adorait tous les deux ${partnerProfile?.interests?.[0] || 'les mêmes choses'} ! Je te réponds plus longuement très vite :)`,
        `Salut ! Mon répondeur IA prend le relais le temps que je me libère, mais j'adore ton énergie ! Dis-moi, quel est ton coin favori pour ${userProfile?.interests?.[0] || 'se détendre'} ?`,
        `Hello ! Petit mot express généré avec mon ton habituel : ton profil m'a tout de suite attiré(e). Hâte de discuter dès que je me reconnecte !`,
      ];
      const selected = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({ reply: selected, isFallback: true });
    }

    const systemInstruction = `Tu es l'assistant personnel IA de "${userProfile?.name || 'l\'utilisateur'}" sur une application de rencontres amoureuse haut de gamme et sécurisée.
Tu réponds EN SON NOM avec son consentement pendant qu'il/elle est temporairement indisponible ou absent(e).

Voici le profil de la personne que tu représentes :
- Prénom : ${userProfile?.name || 'Moi'}
- Âge : ${userProfile?.age || 27} ans
- Ville : ${userProfile?.city || 'Paris'}
- Bio : "${userProfile?.bio || ''}"
- Centres d'intérêt : ${(userProfile?.interests || []).join(', ')}
- Objectif relationnel : ${userProfile?.relationshipGoal || 'Rencontre sérieuse ou sincère'}

Voici le profil de son match (destinataire du message) :
- Prénom : ${partnerProfile?.name || 'Partenaire'}
- Âge : ${partnerProfile?.age || 26} ans
- Centres d'intérêt : ${(partnerProfile?.interests || []).join(', ')}
- Bio : "${partnerProfile?.bio || ''}"

Paramètres de style et personnalité souhaités par l'utilisateur :
- Tonalité : ${toneDescriptions[tone] || tone}
- Niveau de séduction : ${flirting} (subtil, amical ou séducteur)
${customInstructions ? `- Consignes personnalisées : "${customInstructions}"` : ''}

Règles impératives :
1. Réponds en français naturel, chaleureux et concis (1 à 3 phrases maximum, comme un vrai SMS de dating).
2. Fais référence subtilement à un intérêt commun ou au message reçu pour montrer de l'intérêt réel.
3. Reste respectueux, sans jamais divulguer d'informations sensibles (numéro de téléphone, adresse exacte, mot de passe).
4. Précise ou laisse transparaître avec charme que tu réponds via le mode IA indisponible mais que tu as hâte de poursuivre la conversation dès ton retour.
5. Ne mets pas de guillemets autour de la réponse.`;

    const recentHistoryText = (chatHistory || [])
      .slice(-4)
      .map((m: any) => `${m.isSelf ? userProfile?.name : partnerProfile?.name}: ${m.text}`)
      .join("\n");

    const prompt = `Historique récent :
${recentHistoryText || 'Début de conversation'}

Nouveau message de ${partnerProfile?.name} : "${partnerMessage}"

Génère la réponse parfaite :`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.85,
        maxOutputTokens: 250,
      },
    });

    const reply = response.text ? response.text.trim().replace(/^"(.*)"$/, '$1') : "Coucou ! Je ne suis pas disponible à l'instant mais je te réponds très vite !";

    res.json({ reply, isFallback: false });
  } catch (error: any) {
    console.error("AI Auto-reply error:", error);
    res.status(500).json({
      reply: "Coucou ! Je suis temporairement indisponible mais ton message me fait très plaisir. Je reviens vers toi au plus vite !",
      error: error.message,
    });
  }
});

// API: Compatibility calculation and deep analysis
app.post("/api/ai/compatibility", async (req, res) => {
  try {
    const { userProfile, targetProfile } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Heuristic compatibility
      const common = (userProfile?.interests || []).filter((i: string) =>
        (targetProfile?.interests || []).includes(i)
      );
      const score = Math.min(98, Math.max(65, 60 + common.length * 9));
      return res.json({
        score,
        summary: `Forte affinité sur ${common.slice(0, 3).join(', ') || 'vos valeurs et votre vision du couple'}.`,
        strengths: [
          `Passions partagées (${common.length} en commun)`,
          "Rythme de vie et vision relationnelle alignés",
          "Complémentarité intellectuelle et spontanéité",
        ],
        icebreaker: `J'ai remarqué qu'on adore tous les deux ${common[0] || 'les voyages'} ! Quel est ton meilleur souvenir là-dessus ?`,
      });
    }

    const prompt = `Analyse la compatibilité amoureuse entre deux personnes selon leurs profils :
Profil 1 :
- Nom : ${userProfile?.name}
- Âge : ${userProfile?.age}
- Objectif : ${userProfile?.relationshipGoal}
- Bio : ${userProfile?.bio}
- Intérêts : ${(userProfile?.interests || []).join(', ')}

Profil 2 :
- Nom : ${targetProfile?.name}
- Âge : ${targetProfile?.age}
- Objectif : ${targetProfile?.relationshipGoal}
- Bio : ${targetProfile?.bio}
- Intérêts : ${(targetProfile?.interests || []).join(', ')}

Réponds en JSON avec le format suivant :
{
  "score": 88,
  "summary": "Court résumé en 1-2 phrases soulignant l'alchimie.",
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "icebreaker": "Une phrase d'accroche originale et sur-mesure pour briser la glace"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    let data;
    try {
      data = JSON.parse(response.text || "{}");
    } catch {
      data = {
        score: 85,
        summary: "Belle connexion émotionnelle et centres d'intérêt très proches.",
        strengths: ["Intérêts communs", "Vision partagée"],
        icebreaker: "Salut ! On semble avoir énormément de points en commun !",
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error("Compatibility AI error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API: Generate Icebreakers based on mutual interests
app.post("/api/ai/icebreakers", async (req, res) => {
  try {
    const { userProfile, targetProfile } = req.body;
    const ai = getAiClient();

    if (!ai) {
      const common = (userProfile?.interests || []).filter((i: string) =>
        (targetProfile?.interests || []).includes(i)
      );
      const interest = common[0] || targetProfile?.interests?.[0] || 'les escapades';
      return res.json({
        icebreakers: [
          `Je vois qu'on a un penchant sérieux pour ${interest}... Tu préfères une session improvisée ou minutieusement préparée ?`,
          `Deux profils qui matchent sur ${interest} : simple hasard ou signe du destin ? 😉`,
          `Si on devait organiser un premier rendez-vous autour de ${interest}, ce serait quoi ton scénario idéal ?`,
        ],
      });
    }

    const prompt = `Génère 3 phrases d'accroche uniques, amusantes, séduisantes et élégantes en français pour briser la glace entre ${userProfile?.name} et ${targetProfile?.name}.
Intérêts de ${userProfile?.name}: ${(userProfile?.interests || []).join(', ')}
Intérêts de ${targetProfile?.name}: ${(targetProfile?.interests || []).join(', ')}
Bio de ${targetProfile?.name}: "${targetProfile?.bio || ''}"

Renvoie un JSON au format :
{
  "icebreakers": ["Accroche 1", "Accroche 2", "Accroche 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || '{"icebreakers": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error("Icebreakers error:", error);
    res.status(500).json({ icebreakers: [] });
  }
});

// API: Enhance Bio with AI
app.post("/api/ai/enhance-bio", async (req, res) => {
  try {
    const { bio, interests, vibe, relationshipGoal } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        enhancedBio: `${bio ? bio + " • " : ""}Passionné(e) par ${(interests || []).slice(0, 3).join(', ')}, à la recherche d'une connexion authentique et pleine de complicité ✨`,
      });
    }

    const prompt = `Tu es un expert en profils de rencontres authentiques et attirants.
Améliore cette bio pour une application de rencontre haut de gamme :
Bio brute de départ : "${bio || ''}"
Centres d'intérêt : ${(interests || []).join(', ')}
Objectif : ${relationshipGoal || 'Sérieux'}
Style/Vibe souhaité : ${vibe || 'Élégant et naturel'}

Rédige une bio captivante en français, naturelle, originale, sans clichés (max 3-4 lignes courtes).
Renvoie un JSON : { "enhancedBio": "..." }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error("Enhance bio error:", error);
    res.status(500).json({ enhancedBio: req.body?.bio || '' });
  }
});

// Start Server & mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Amour & Affinités server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
