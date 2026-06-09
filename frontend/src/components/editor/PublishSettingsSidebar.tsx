import { Settings, X } from "lucide-react"
import { useState } from "react"

interface PublishSettingsSidebarProps {
    summary: string
    onSummaryChange: (summary: string) => void
    category: string
    onCategoryChange: (category: string) => void
    tags: string[]
    onTagsChange: (tags: string[]) => void
    seoSlug: string
    seoKeywords: string[]
    onSeoKeywordsChange: (keywords: string[]) => void
}

export default function PublishSettingsSidebar({
    summary,
    onSummaryChange,
    category,
    onCategoryChange,
    tags,
    onTagsChange,
    seoSlug,
    seoKeywords,
    onSeoKeywordsChange
}: PublishSettingsSidebarProps) {
    const [tagInput, setTagInput] = useState("")
    const [keywordInput, setKeywordInput] = useState("")

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (!tags.includes(newTag)) {
                onTagsChange([...tags, newTag]);
            }
            setTagInput("");
        }
    }

    const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            e.preventDefault();
            const newKeyword = keywordInput.trim();
            if (!seoKeywords.includes(newKeyword)) {
                onSeoKeywordsChange([...seoKeywords, newKeyword]);
            }
            setKeywordInput("");
        }
    }

    return (
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
                    onChange={(e) => onSummaryChange(e.target.value.slice(0, 500))}
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
                    onChange={(e) => onCategoryChange(e.target.value)}
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
                            <button onClick={() => onTagsChange(tags.filter(t => t !== tag))} className="hover:text-red-400 transition-colors">
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
                            <button onClick={() => onSeoKeywordsChange(seoKeywords.filter(k => k !== keyword))} className="hover:text-red-400 transition-colors">
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
    )
}
