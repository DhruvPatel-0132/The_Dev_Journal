'use client'

import { useState, useEffect, useRef } from "react"
import BackgroundGlow from "@/components/common/BackgroundGlow"
import GridPattern from "@/components/common/GridPattern"
import TipTapEditor from "@/components/editor/TipTapEditor"
import { Image as ImageIcon, Send, Save, ArrowLeft, X, Settings, Loader2 } from "lucide-react"
import Link from "next/link"
import { articleApi, uploadApi } from "@/lib/api"
import { useRouter, useParams } from "next/navigation"

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
    const [tagInput, setTagInput] = useState("")
    
    // SEO Keywords
    const [seoKeywords, setSeoKeywords] = useState<string[]>([])
    const [keywordInput, setKeywordInput] = useState("")

    // Fetch existing article
    useEffect(() => {
        if (slug) {
            articleApi.getArticleForEdit(slug).then(res => {
                const a = res.article;
                setTitle(a.title || "");
                setContent(a.content || "");
                setCoverImage(a.bannerImage?.url || "");
                setSeoSlug(a.seoSlug || "");
                setSummary(a.summary || "");
                setCategory(a.category || "");
                setTags(a.tags || []);
                setSeoKeywords(a.seoKeywords || []);
            }).catch(err => {
                setError("Failed to load article details");
            }).finally(() => {
                setIsFetching(false);
            });
        }
    }, [slug]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                setIsLoading(true);
                setError("");
                const result = await uploadApi.uploadImage(e.target.files[0]);
                setCoverImage(result.url); 
            } catch (err: any) {
                console.error("Failed to upload image:", err);
                setError(err.message || "Failed to upload image");
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
            
            // Redirect after successful save
            router.push('/dashboard')
        } catch (err: any) {
            console.error("Failed to save article:", err)
            setError(err.message || "An error occurred while saving the article.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    }

    const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            e.preventDefault();
            const newKeyword = keywordInput.trim();
            if (!seoKeywords.includes(newKeyword)) {
                setSeoKeywords([...seoKeywords, newKeyword]);
            }
            setKeywordInput("");
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
                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
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
                    <div className="bg-[#1A1A1D] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 sticky top-8">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <Settings size={20} className="text-gray-400" />
                            <h2 className="text-lg font-semibold text-white/90">Publish Settings</h2>
                        </div>

                        {/* Summary */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Summary (max 500 chars)</label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value.slice(0, 500))}
                                placeholder="Write a brief summary..."
                                className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none h-24"
                            />
                            <div className="text-xs text-right text-gray-500">{summary.length}/500</div>
                        </div>

                        {/* Category */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g. Technology, Lifestyle..."
                                className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">Tags (Press Enter)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-white/10 rounded-md text-xs flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-400 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add a tag..."
                                className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>

                        {/* SEO Slug */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">SEO Slug</label>
                            <div className="flex items-center bg-[#0A0A0B] border border-white/10 rounded-lg p-3 text-sm text-gray-500 overflow-hidden">
                                <span className="whitespace-nowrap select-none">/blog/</span>
                                <input
                                    type="text"
                                    value={seoSlug}
                                    readOnly
                                    placeholder="your-blog-slug"
                                    className="bg-transparent text-white focus:outline-none w-full font-mono cursor-default"
                                />
                            </div>
                        </div>

                        {/* SEO Keywords */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-400">SEO Keywords (Press Enter)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {seoKeywords.map(keyword => (
                                    <span key={keyword} className="px-2 py-1 bg-white/10 rounded-md text-xs flex items-center gap-1">
                                        {keyword}
                                        <button onClick={() => setSeoKeywords(seoKeywords.filter(k => k !== keyword))} className="hover:text-red-400 transition-colors">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={handleAddKeyword}
                                placeholder="Add an SEO keyword..."
                                className="w-full bg-[#0A0A0B] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/30 transition-colors"
                            />
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}

export default EditBlogPage