import { Button, Card, Select, TextField } from '@/components/ui'
import { AppLayout } from '@/layouts'
import { csrfToken, type Project, type SidebarSection } from '@/types/type'
import { Head, router } from '@inertiajs/react'
import MDEditor from '@uiw/react-md-editor'
import { IconBrain, IconCheck, IconChevronLeft, IconChevronRight, IconLoader, IconPlus, IconSparklesTwo, IconX } from 'justd-icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

interface CreateArticleProps {
    sidebarSections: SidebarSection[]
    projects: Project[]
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const CreateArticlePage: React.FC<CreateArticleProps> = ({ sidebarSections, projects }) => {
    const [selectedSection, setSelectedSection] = useState<SidebarSection | null>(null)
    const [createNewSection, setCreateNewSection] = useState(false)
    const [newSectionName, setNewSectionName] = useState('')

    const [itemTitle, setItemTitle] = useState('')
    const [content, setContent] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split')
    const [isMetaCollapsed, setIsMetaCollapsed] = useState(false)
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

    const canSubmit = useMemo(() => {
        const sectionOk = (createNewSection ? newSectionName.trim().length > 1 : !!selectedSection?.id)
        return sectionOk && itemTitle.trim().length > 1 && content.trim().length > 0
    }, [createNewSection, newSectionName, selectedSection, itemTitle, content])

    useEffect(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
            autoSaveTimerRef.current = null
        }
        if (!content && !itemTitle && !newSectionName && !selectedSection) return
        autoSaveTimerRef.current = setTimeout(() => {
            localStorage.setItem('createArticleDraft', JSON.stringify({
                selectedSectionId: selectedSection?.id ?? null,
                newSectionName,
                itemTitle,
                content,
                coverImageUrl,
                tags,
            }))
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 1200)
        }, 1200)
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
                autoSaveTimerRef.current = null
            }
        }
    }, [selectedSection, newSectionName, itemTitle, content, coverImageUrl, tags])

    useEffect(() => {
        const raw = localStorage.getItem('createArticleDraft')
        if (!raw) return
        try {
            const d = JSON.parse(raw)
            if (d.selectedSectionId) {
                const sec = sidebarSections.find(s => s.id === d.selectedSectionId)
                if (sec) setSelectedSection(sec)
            }
            setNewSectionName(d.newSectionName || '')
            setItemTitle(d.itemTitle || '')
            setContent(d.content || '')
            setCoverImageUrl(d.coverImageUrl || '')
            setTags(Array.isArray(d.tags) ? d.tags : [])
        } catch {}
    }, [])

    const handleAddTag = () => {
        const t = tagInput.trim()
        if (!t) return
        if (tags.includes(t)) return
        setTags(prev => [...prev, t])
        setTagInput('')
    }

    const handleRemoveTag = (t: string) => setTags(prev => prev.filter(x => x !== t))

    const handleAIGenerate = async () => {
        if (isSubmitting) return
        
        setIsSubmitting(true)
        setSaveStatus('saving')
        
        // Build context from form data
        const context = [
            itemTitle && `Title: ${itemTitle}`,
            tags.length > 0 && `Tags: ${tags.join(', ')}`,
            coverImageUrl && `Cover Image: ${coverImageUrl}`,
            content && `Current content: ${content.substring(0, 200)}...`,
        ].filter(Boolean).join('\n')
        
        const prompt = `Write a comprehensive article based on these preferences:\n\n${context}\n\nRequirements:
- Use the provided title as the main heading
- Include the cover image if provided
- Incorporate the tags naturally
- Build upon the existing content if any
- Write in a professional, engaging style
- Use proper markdown formatting
- Include practical examples where relevant
- Aim for 800-1200 words`

        try {
            const res = await fetch('/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken ?? '' },
                body: JSON.stringify({ prompt }),
            })
            
            const data = await res.json()
            if (data.markdown) {
                setContent(data.markdown)
                toast.success('AI content generated!')
            } else {
                toast.error('Failed to generate content')
            }
        } catch (e) {
            toast.error('AI generation failed')
        } finally {
            setIsSubmitting(false)
            setSaveStatus('idle')
        }
    }

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting) return
        setIsSubmitting(true)
        setSaveStatus('saving')

        const payload = {
            sidebarSectionId: createNewSection ? null : selectedSection?.id ?? null,
            sidebarSectionName: createNewSection ? newSectionName.trim() : (selectedSection?.title_section ?? ''),
            sidebarItemId: null,
            sidebarItemName: itemTitle.trim(),
            content: [
                coverImageUrl ? `![cover](${coverImageUrl})` : '',
                tags.length ? `\nTags: ${tags.join(', ')}` : '',
                '',
                content,
            ].filter(Boolean).join('\n'),
        }

        try {
            const res = await fetch('/article/create-or-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken ?? '' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Article created!')
                localStorage.removeItem('createArticleDraft')
                router.visit('/dashboard')
            } else {
                setSaveStatus('error')
                toast.error(data.message || 'Failed to create')
            }
        } catch (e) {
            setSaveStatus('error')
            toast.error('Request failed')
        } finally {
            setIsSubmitting(false)
            setTimeout(() => setSaveStatus('idle'), 1500)
        }
    }

    const SaveIndicator = () => {
        switch (saveStatus) {
            case 'saving':
                return <div className="flex items-center gap-2 text-blue-500 text-sm"><IconLoader className="animate-spin" /> Saving…</div>
            case 'saved':
                return <div className="flex items-center gap-2 text-green-500 text-sm"><IconCheck /> Draft saved</div>
            case 'error':
                return <div className="flex items-center gap-2 text-red-500 text-sm"><IconX /> Error</div>
            default:
                return null
        }
    }

    return (
        <AppLayout projects={projects}>
            <Head title="Create Article" />

            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
                <div className="container mx-auto max-w-[1600px] px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-fg">
                        <span className="hidden sm:block">Create</span>
                        <IconChevronRight className="opacity-60" />
                        <span className="font-medium text-fg">New Article</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <SaveIndicator />
                        <Button appearance="outline" size="small" onPress={() => setIsMetaCollapsed(v => !v)}>
                            {isMetaCollapsed ? <><IconChevronRight /> Show meta</> : <><IconChevronLeft /> Hide meta</>}
                        </Button>
                        <Button intent="primary" onPress={handleSubmit} isDisabled={!canSubmit || isSubmitting}>
                            {isSubmitting ? 'Publishing…' : 'Publish'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className={`container mx-auto max-w-[1600px] px-4 py-6 grid grid-cols-1 ${isMetaCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-[18rem,1fr]'} gap-6`}>
                {/* Left rail - Meta */}
                {!isMetaCollapsed && (
                <div className="space-y-6">
                    <Card className="p-5">
                        <Card.Header>
                            <Card.Title>Basics</Card.Title>
                            <Card.Description>Section and title</Card.Description>
                        </Card.Header>
                        <Card.Content className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-fg">Section</span>
                                <Button appearance="plain" size="small" onPress={() => setCreateNewSection(v => !v)}>
                                    {createNewSection ? 'Use existing' : 'New section'}
                                </Button>
                            </div>
                            {!createNewSection ? (
                                <Select aria-label="Sidebar Section" placeholder="Select a section" onSelectionChange={(key) => {
                                    const sec = sidebarSections.find(s => s.id === key)
                                    if (sec) setSelectedSection(sec)
                                }}>
                                    <Select.Trigger />
                                    <Select.List items={sidebarSections}>
                                        {(ss) => (
                                            <Select.Option key={ss.id} textValue={ss.title_section}>
                                                {ss.title_section}
                                            </Select.Option>
                                        )}
                                    </Select.List>
                                </Select>
                            ) : (
                                <TextField label="New Section" placeholder="e.g. Deep Learning" value={newSectionName} onChange={setNewSectionName} />
                            )}

                            <TextField label="Article Title" placeholder="e.g. Attention Mechanisms, Demystified" value={itemTitle} onChange={setItemTitle} />
                        </Card.Content>
                    </Card>

                    <Card className="p-5">
                        <Card.Header>
                            <Card.Title>Cover & Tags</Card.Title>
                            <Card.Description>Optional enhancements</Card.Description>
                        </Card.Header>
                        <Card.Content className="space-y-4">
                            <TextField label="Cover Image URL" placeholder="https://images.unsplash.com/..." value={coverImageUrl} onChange={setCoverImageUrl} />
                            <div>
                                <label className="block text-sm font-medium text-muted-fg mb-2">Tags</label>
                                <div className="flex gap-2">
                                    <input className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag and press +" />
                                    <Button onPress={handleAddTag} appearance="outline"><IconPlus /></Button>
                                </div>
                                {tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {tags.map(t => (
                                            <span key={t} className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-secondary border border-border">
                                                {t}
                                                <button className="opacity-60 hover:opacity-100" onClick={() => handleRemoveTag(t)} aria-label={`Remove ${t}`}>
                                                    <IconX />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card.Content>
                    </Card>

                    <Card className="p-5">
                        <Card.Header>
                            <Card.Title>Assist</Card.Title>
                            <Card.Description>Kickstart with AI</Card.Description>
                        </Card.Header>
                        <Card.Content className="space-y-3">
                            <Button appearance="outline" onPress={handleAIGenerate} isDisabled={isSubmitting}>
                                <IconBrain /> {isSubmitting ? 'Generating...' : 'Generate with AI'}
                            </Button>
                            <p className="text-xs text-muted-fg">AI will generate content based on your title, tags, and existing content as context.</p>
                        </Card.Content>
                    </Card>
                </div>
                )}

                {/* Editor/Preview */}
                <div className="min-h-[70vh]">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 bg-secondary rounded-lg p-1">
                            <button onClick={() => setViewMode('edit')} className={`px-3 py-1.5 text-sm rounded ${viewMode==='edit'?'bg-background text-foreground shadow-sm':'text-muted-fg hover:text-fg'}`}>Edit</button>
                            <button onClick={() => setViewMode('split')} className={`px-3 py-1.5 text-sm rounded ${viewMode==='split'?'bg-background text-foreground shadow-sm':'text-muted-fg hover:text-fg'}`}>Split</button>
                            <button onClick={() => setViewMode('preview')} className={`px-3 py-1.5 text-sm rounded ${viewMode==='preview'?'bg-background text-foreground shadow-sm':'text-muted-fg hover:text-fg'}`}>Preview</button>
                        </div>
                        <Button appearance="outline" onPress={() => setContent(v => `${v}\n\n## Next section\nWrite here...`)}>
                            <IconSparklesTwo /> Suggest section
                        </Button>
                    </div>

                    <div className={`grid ${viewMode==='split'?'md:grid-cols-2':'grid-cols-1'} border border-border rounded-lg overflow-hidden`}>
                        {(viewMode==='edit' || viewMode==='split') && (
                            <div className={viewMode==='split' ? 'border-r border-border' : ''}>
                                <div className="bg-secondary/30 px-4 py-2 border-b border-border"><h3 className="text-sm font-semibold text-muted-fg">Markdown Editor</h3></div>
                                <div className="p-4" data-color-mode="dark">
                                    <MDEditor value={content} onChange={(val) => setContent(val || '')} height={viewMode==='split'?600:720} preview="edit" data-color-mode="dark" />
                                </div>
                            </div>
                        )}
                        {(viewMode==='preview' || viewMode==='split') && (
                            <div>
                                <div className="bg-secondary/30 px-4 py-2 border-b border-border"><h3 className="text-sm font-semibold text-muted-fg">Live Preview</h3></div>
                                <div className="p-6 prose prose-invert max-w-none overflow-auto" style={{ height: viewMode==='split'?600:720 }}>
                                    <MDEditor.Markdown source={[coverImageUrl?`![cover](${coverImageUrl})`:'', content || '*Start writing your article…*'].filter(Boolean).join('\n\n')} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default CreateArticlePage


