import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { GeneratedPost, Platform, Tone } from "@/lib/types/database";
import { PLATFORMS } from "@/lib/constants";
import { GoogleAIFileManager } from "@google/generative-ai/server";

interface GenerateRequest {
  content?: string;
  platforms: Platform[];
  pdfFile?: File;
  tones: Record<Platform, Tone>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: GenerateRequest = await request.json();
    const { content, platforms, tones, pdfFile } = body;

    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const generation = await prisma.generation.create({
      data: {
        userId: session.user.id,
        originalContent: content,
        contentType: "text",
        platforms,
      },
    });

    let fileUri: string | null = null;
    if (pdfFile) {
      const fileManager = new GoogleAIFileManager(
        process.env.GOOGLE_GENERATIVE_AI_API_KEY as string
      );
      const buffer = await pdfFile.arrayBuffer();
      const geminiFile = await fileManager.uploadFile(Buffer.from(buffer), {
        mimeType: "application/pdf",
      });
      fileUri = geminiFile.file.uri;
    }

    // Process all platforms in parallel for faster generation
    const platformPromises = platforms.map(async (platform) => {
      const tone = tones[platform];
      const platformInfo = PLATFORMS.find((p) => p.value === platform);
      if (!platformInfo) return [];

      const systemPrompt = createViralSystemPrompt(
        platform,
        tone,
        platformInfo.maxChars
      );

      const userContent = [
        { type: "text", text: content },
        ...(fileUri
          ? [{ type: "file", data: fileUri, mimeType: "application/pdf" }]
          : []),
      ];

      try {
        const { text } = await generateText({
          model: google("gemini-2.5-flash"),
          system: systemPrompt,
          temperature: 0.7, // Reduced for faster, more consistent responses
          messages: [{ role: "user", content: userContent as any }],
        });
        
        const posts: GeneratedPost[] = parseLLMResponse(text);
        const validPosts = posts.filter(post => 
          post && 
          post.content && 
          typeof post.content === 'string' && 
          post.content.trim().length > 0 &&
          post.hashtags && 
          Array.isArray(post.hashtags)
        );

        if (validPosts.length === 0) {
          console.warn(`No valid posts generated for ${platform}, creating fallback`);
          return createFallbackPosts(content, platform, tone);
        }

        return validPosts.map(post => {
          const { cleanContent, hashtags: contentHashtags } = sanitizePostContent(post.content);
          const finalHashtags = mergeAndDeduplicateHashtags(contentHashtags, post.hashtags);
          
          return {
            platform,
            tone,
            content: cleanContent,
            hashtags: finalHashtags,
          };
        });
      } catch (error) {
        console.error(`Error generating for ${platform}:`, error);
        return createFallbackPosts(content, platform, tone);
      }
    });

    // Wait for all platforms to complete
    const platformResults = await Promise.all(platformPromises);
    const allPosts = platformResults.flat();

    // Batch create all posts in database
    const generatedPosts = [];
    for (const post of allPosts) {
      try {
        const dbPost = await prisma.generatedPost.create({
          data: {
            generationId: generation.id,
            platform: post.platform,
            tone: post.tone,
            content: post.content,
            hashtags: post.hashtags,
          },
        });
        generatedPosts.push(dbPost);
      } catch (dbError) {
        console.error('Failed to create post:', dbError);
      }
    }

    return NextResponse.json({
      generationId: generation.id,
      posts: generatedPosts,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


function sanitizePostContent(content: string): { cleanContent: string; hashtags: string[] } {
  // Extract hashtags from content
  const hashtagMatches = content.match(/#\w+/g) || [];
  const extractedHashtags = hashtagMatches.map(tag => tag.slice(1)); // Remove # symbol
  
  // Remove hashtags from content
  const cleanContent = content.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
  
  return {
    cleanContent,
    hashtags: extractedHashtags
  };
}

function mergeAndDeduplicateHashtags(contentHashtags: string[], providedHashtags: string[]): string[] {
  const allHashtags = [...contentHashtags, ...providedHashtags];
  const uniqueHashtags = [...new Set(allHashtags.map(tag => tag.toLowerCase()))];
  return uniqueHashtags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1));
}

function extractJsonFromMarkdown(text: string): string {
  let cleanedText = text.trim();
  
  // Remove markdown code blocks
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  
  return cleanedText.trim();
}

function parseLLMResponse(text: string): GeneratedPost[] {
  try {
    // First try direct parsing
    return JSON.parse(text);
  } catch (error) {
    try {
      // Try cleaning markdown first
      const cleanedText = extractJsonFromMarkdown(text);
      return JSON.parse(cleanedText);
    } catch (error) {
      try {
        // Try to extract JSON array from text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Try to find individual objects
        const objectMatches = text.match(/\{[^{}]*"content"[^{}]*\}/g);
        if (objectMatches) {
          return objectMatches.map(match => {
            try {
              return JSON.parse(match);
            } catch {
              return null;
            }
          }).filter(Boolean);
        }
      } catch (error) {
        console.error('Failed to parse LLM response:', error);
      }
    }
  }
  
  // If all parsing fails, return empty array
  console.warn('Could not parse LLM response, returning empty array');
  return [];
}

function createFallbackPosts(content: string, platform: Platform, tone: Tone): GeneratedPost[] {
  const platformInfo = PLATFORMS.find(p => p.value === platform);
  const maxChars = platformInfo?.maxChars || 280;
  
  const fallbackTemplates = {
    twitter: {
      casual: [
        `Check this out! ${content.substring(0, 200)}... #ViralContent #SocialMedia`,
        `This is amazing! ${content.substring(0, 200)}... #Trending #MustSee`,
        `You won't believe this! ${content.substring(0, 200)}... #Wow #Amazing`
      ],
      professional: [
        `Key insight: ${content.substring(0, 200)}... #BusinessTips #Leadership`,
        `Important update: ${content.substring(0, 200)}... #IndustryNews #Professional`,
        `Strategic thinking: ${content.substring(0, 200)}... #Strategy #Business`
      ],
      educational: [
        `Learn this: ${content.substring(0, 200)}... #Education #Learning`,
        `Did you know? ${content.substring(0, 200)}... #Facts #Knowledge`,
        `Here's how: ${content.substring(0, 200)}... #Tutorial #HowTo`
      ]
    },
    linkedin: {
      professional: [
        `Professional insight: ${content.substring(0, 300)}... #ProfessionalDevelopment #Leadership #BusinessStrategy`,
        `Industry update: ${content.substring(0, 300)}... #IndustryInsights #CareerGrowth #Networking`,
        `Strategic perspective: ${content.substring(0, 300)}... #BusinessStrategy #Leadership #Innovation`
      ],
      educational: [
        `Educational content: ${content.substring(0, 300)}... #Learning #ProfessionalDevelopment #Skills`,
        `Knowledge sharing: ${content.substring(0, 300)}... #Education #CareerTips #Growth`,
        `Professional learning: ${content.substring(0, 300)}... #ProfessionalGrowth #Skills #Development`
      ],
      casual: [
        `Thoughts on: ${content.substring(0, 300)}... #ProfessionalThoughts #Career #Networking`,
        `Sharing insights: ${content.substring(0, 300)}... #ProfessionalInsights #Career #Growth`,
        `Professional perspective: ${content.substring(0, 300)}... #Career #Professional #Networking`
      ]
    },
    reddit: {
      casual: [
        `So I was thinking about this: ${content.substring(0, 400)}... What do you all think?`,
        `Interesting take on this topic: ${content.substring(0, 400)}... Thoughts?`,
        `This is pretty cool: ${content.substring(0, 400)}... Anyone else have experience with this?`
      ],
      educational: [
        `Educational post: ${content.substring(0, 400)}... Hope this helps someone!`,
        `Learning moment: ${content.substring(0, 400)}... Sharing knowledge with the community.`,
        `Informative content: ${content.substring(0, 400)}... Always happy to share what I know.`
      ],
      professional: [
        `Professional insight: ${content.substring(0, 400)}... Would love to hear your thoughts.`,
        `Industry perspective: ${content.substring(0, 400)}... What's your experience?`,
        `Business insight: ${content.substring(0, 400)}... Curious about others' views.`
      ]
    }
  };

  const platformTemplates = fallbackTemplates[platform];
  const toneTemplates = platformTemplates?.[tone as keyof typeof platformTemplates];
  const templates = toneTemplates || platformTemplates?.casual || [
    `${content.substring(0, maxChars - 50)}... #Content #SocialMedia`
  ];

  return templates.slice(0, 3).map((template: string, index: number) => ({
    id: `fallback-${platform}-${index}`,
    content: template,
    platform,
    tone,
    hashtags: template.match(/#\w+/g)?.map((tag: string) => tag.slice(1)) || ['Content'],
    character_count: template.length,
    created_at: new Date().toISOString(),
    generation_id: 'fallback'
  }));
}

function createViralSystemPrompt(
  platform: Platform,
  tone: Tone,
  maxChars: number
) {
  return `
You are an expert viral post writer with 10+ years experience.
Your job is to transform provided text into exactly THREE highly viral social media posts for the "${platform}" platform in "${tone}" tone.
Each post must:
- Follow the most current best practices for ${platform}: length limits, formatting, use of line breaks, hashtags, and engagement tactics.
- Strictly match the "${tone}" tone:
    - Educational: Teach, give insights, break down info clearly.
    - Professional: Be confident, authoritative, actionable.
    - Funny: Use clever humor, playfulness, memes, light-hearted language.
    - Inspirational: Motivate, use energetic and uplifting language.
    - Casual: Light, conversational, friendly, relaxed.
- Be optimized for maximum shares, likes, and platform-specific virality.
- Use emojis and trending hashtags only if relevant.
- Each post must be in this exact response format:

RESPONSE_FORMAT:
[
  {
    "content": "string, best viral post text, under ${maxChars} characters",
    "platform": "${platform}",
    "tone": "${tone}",
    "hashtags": ["trending", "tags", "etc"]
  },
  {...}, {...}
]

Do not include any other text, explanations, intros or outros. Deliver exactly 3 posts and nothing else and Must follow the RESPONSE_FORMAT only.
`;
}
