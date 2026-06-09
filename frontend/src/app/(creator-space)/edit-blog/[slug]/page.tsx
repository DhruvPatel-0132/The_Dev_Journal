'use client'

import { useState, useEffect, useRef } from "react"
import BackgroundGlow from "@/components/common/BackgroundGlow"
import GridPattern from "@/components/common/GridPattern"
import dynamic from "next/dynamic"
const TipTapEditor = dynamic(() => import("@/components/editor/TipTapEditor"), { ssr: false, loading: () => <p className="text-gray-400">Loading editor...</p> })
import { Image as ImageIcon, Send, Save, ArrowLeft, X, Settings, Loader2 } from "lucide-react"
import Link from "next/link"
import { articleApi, uploadApi } from "@/lib/api"
import { useRouter, useParams } from "next/navigation"
import { getErrorMessage } from "@/lib/utils"
import Image from "next/image"
import PublishSettingsSidebar from "@/components/editor/PublishSettingsSidebar"
function EditBlogPage() {
    const router = useRouter()
    const params = useParams()
    const slug = params.slug as string
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Main Content
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [coverImage, setCoverImage] = useState("")
    
    // Metadata (Article Schema)
    const [seoSlug, setSeoSlug] = useState("")
    const [summary, setSummary] = useState("")
    const [category, setCategory] = useState("")
    
    // Tags
    const [tags, setTags] = useState<string[]>([])
    
    // SEO Keywords
    const [seoKeywords, setSeoKeywords] = useState<string[]>([])

    // Fetch existing article
    useEffect(() => {
        if (slug) {
            articleApi.getArticleForEdit(slug).then(res => {
                const a = res.article;

                const savedDraft = localStorage.getItem(`draft-edit-blog-${slug}`)
                let parsedDraft = null
                if (savedDraft) {
                    try {
                        parsedDraft = JSON.parse(savedDraft)
                    } catch (err) {
                        console.error("Failed to parse draft from local storage", err)
                    }
                }

                setTitle(parsedDraft?.title !== undefined ? parsedDraft.title : (a.title || ""));
                setContent(parsedDraft?.content !== undefined ? parsedDraft.content : (a.content || ""));
                setCoverImage(parsedDraft?.coverImage !== undefined ? parsedDraft.coverImage : (a.bannerImage?.url || ""));
                setSeoSlug(parsedDraft?.seoSlug !== undefined ? parsedDraft.seoSlug : (a.seoSlug || ""));
                setSummary(parsedDraft?.summary !== undefined ? parsedDraft.summary : (a.summary || ""));
                setCategory(parsedDraft?.category !== undefined ? parsedDraft.category : (a.category || ""));
                setTags(parsedDraft?.tags !== undefined ? parsedDraft.tags : (a.tags || []));
                setSeoKeywords(parsedDraft?.seoKeywords !== undefined ? parsedDraft.seoKeywords : (a.seoKeywords || []));
            }).catch(err => {
                setError("Failed to load article details");
            }).finally(() => {
                setIsFetching(false);
            });
        }
    }, [slug]);

    // Save to local storage when fields change (after initial fetch)
    useEffect(() => {
        if (isFetching) return;
        const draft = { title, content, coverImage, seoSlug, summary, category, tags, seoKeywords }
        localStorage.setItem(`draft-edit-blog-${slug}`, JSON.stringify(draft))
    }, [title, content, coverImage, seoSlug, summary, category, tags, seoKeywords, slug, isFetching])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setIsLoading(true);
                setError("");
                const result = await uploadApi.uploadImage(e.target.files[0]);
                setCoverImage(result.url); 
            } catch (err) {
                console.error("Failed to upload image:", err);
                setError(getErrorMessage(err) || "Failed to upload image");
            } finally {
                setIsLoading(false);
            }
        }
    }

    const handlePublish = async (status: 'published' | 'draft') => {
        setIsLoading(true)
        setError("")
        try {
            const articleData = {
                title,
                seoSlug,
                bannerImage: coverImage ? { url: coverImage, publicId: "" } : undefined, // Adjust based on your upload logic
                content,
                summary,
                category,
                tags,
                seoKeywords,
                status
            }
            console.log(`Saving as ${status}:`, articleData)
            await articleApi.update(slug, articleData)
            localStorage.removeItem(`draft-edit-blog-${slug}`)
            
            // Redirect after successful save
            router.push('/dashboard')
        } catch (err) {
            console.error("Failed to update article:", err)
            setError(getErrorMessage(err) || "An error occurred while saving the article.")
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <main className="min-h-screen overflow-y-auto bg-[#0A0A0B] text-white relative flex flex-col">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <BackgroundGlow />
                <GridPattern />
            </div>

            {/* Header / Navbar area */}
            <div className="w-full max-w-7xl mx-auto px-6 py-8 relative z-10 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </Link>

                <div className="flex items-center gap-4">
                    {error && <span className="text-red-400 text-sm">{error}</span>}
                    <button 
                        onClick={() => handlePublish('draft')}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Draft
                    </button>
                    <button 
                        onClick={() => handlePublish('published')}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Publish
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content Area */}
                <div className="lg:col-span-2 flex flex-col">
                    {/* Title Input */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Article Title..."
                        className="w-full bg-transparent text-4xl md:text-5xl font-bold placeholder:text-gray-600 focus:outline-none mb-8 resize-none text-white/90"
                    />

                    {/* Cover Image Placeholder */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                    />
                    {!coverImage ? (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/1] rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all mb-10 flex flex-col items-center justify-center gap-4 group cursor-pointer">
                            <div className="p-4 rounded-full bg-white/5 group-hover:scale-110 transition-transform">
                                <ImageIcon size={32} className="text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-gray-400 font-medium group-hover:text-white transition-colors">Add Cover Image</span>
                        </button>
                    ) : (
                        <div className="w-full aspect-[4/1] rounded-2xl mb-10 relative overflow-hidden group">
                            <Image src={coverImage} alt="Cover" fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => setCoverImage("")} className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-colors">
                                    Remove Image
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tiptap Editor */}
                    <div className="flex-1 min-h-[500px]">
                        {isFetching ? (
                            <div className="flex items-center justify-center h-full text-white/50">
                                <Loader2 size={32} className="animate-spin" />
                            </div>
                        ) : (
                            <TipTapEditor content={content} onChange={setContent} />
                        )}
                    </div>
                </div>

                {/* Settings Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <PublishSettingsSidebar
                        summary={summary}
                        onSummaryChange={setSummary}
                        category={category}
                        onCategoryChange={setCategory}
                        tags={tags}
                        onTagsChange={setTags}
                        seoSlug={seoSlug}
                        seoKeywords={seoKeywords}
                        onSeoKeywordsChange={setSeoKeywords}
                    />
                </div>
            </div>
        </main>
    )
}

export default EditBlogPage