/**
 * Edit Article Page
 * 
 * A modern, feature-rich article editor with best practices:
 * - Autosave functionality (saves 3 seconds after last change)
 * - Live preview with split-view mode
 * - Keyboard shortcuts (Cmd/Ctrl + S to save)
 * - Save status indicators
 * - Unsaved changes warning
 * - Responsive design
 * - Accessibility features
 * 
 * @author BINTANGMFHD
 * @version 2.0
 */

import { Button, TextField } from '@/components/ui'
import { AppLayout } from '@/layouts'
import { csrfToken, type Page, type Project, type SidebarSection } from '@/types/type'
import { Head, router } from '@inertiajs/react'
import MDEditor from '@uiw/react-md-editor'
import { IconArrowLeft, IconCheck, IconLoader, IconX } from 'justd-icons'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface EditArticleProps {
    editingPage: Page
    sidebarSections: SidebarSection[]
    projects: Project[]
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const EditArticle: React.FC<EditArticleProps> = ({ editingPage, sidebarSections, projects }) => {
    // State management
    const [title, setTitle] = useState(editingPage.title || '')
    const [content, setContent] = useState(editingPage.content || '')
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split')
    
    // Refs for autosave
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
    const initialContentRef = useRef({ title: editingPage.title, content: editingPage.content })

    // Check for unsaved changes
    useEffect(() => {
        const hasChanges = 
            title !== initialContentRef.current.title || 
            content !== initialContentRef.current.content
        setHasUnsavedChanges(hasChanges)
    }, [title, content])

    // Autosave functionality
    useEffect(() => {
        if (!hasUnsavedChanges) return

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
        }

        // Set new timer for autosave (3 seconds after last change)
        autoSaveTimerRef.current = setTimeout(() => {
            handleSave(true)
        }, 3000)

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [title, content, hasUnsavedChanges])

    // Prevent accidental navigation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + S to save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault()
                handleSave(false)
            }
            // Cmd/Ctrl + Shift + P to toggle preview
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
                e.preventDefault()
                setViewMode(prev => prev === 'preview' ? 'split' : 'preview')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleSave = async (isAutoSave: boolean = false) => {
        if (saveStatus === 'saving') return

        setSaveStatus('saving')

        const payload = {
            sidebarItemId: editingPage.sidebar_item_id,
            content: content,
            sidebarSectionId: editingPage.sidebar_item?.sidebar_section?.id,
            sidebarSectionName: editingPage.sidebar_item?.sidebar_section?.title_section,
            sidebarItemName: title,
        }

        try {
            const response = await fetch('/article/create-or-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken ?? '',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (data.success) {
                setSaveStatus('saved')
                setLastSaved(new Date())
                initialContentRef.current = { title, content }
                setHasUnsavedChanges(false)
                
                if (!isAutoSave) {
                    toast.success('Article saved successfully!')
                }

                // Reset status after 2 seconds
                setTimeout(() => {
                    setSaveStatus('idle')
                }, 2000)
            } else {
                setSaveStatus('error')
                toast.error(data.message || 'Failed to save article')
                setTimeout(() => setSaveStatus('idle'), 3000)
            }
        } catch (error) {
            setSaveStatus('error')
            console.error('Save error:', error)
            toast.error('An error occurred while saving')
            setTimeout(() => setSaveStatus('idle'), 3000)
        }
    }

    const handleBack = () => {
        if (hasUnsavedChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                router.visit('/dashboard')
            }
        } else {
            router.visit('/dashboard')
        }
    }

    const SaveStatusIndicator = () => {
        switch (saveStatus) {
            case 'saving':
                return (
                    <div className="flex items-center gap-2 text-blue-500 text-sm">
                        <IconLoader className="animate-spin" />
                        <span>Saving...</span>
                    </div>
                )
            case 'saved':
                return (
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                        <IconCheck />
                        <span>Saved {lastSaved && `at ${lastSaved.toLocaleTimeString()}`}</span>
                    </div>
                )
            case 'error':
                return (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                        <IconX />
                        <span>Save failed</span>
                    </div>
                )
            default:
                return hasUnsavedChanges ? (
                    <div className="flex items-center gap-2 text-yellow-500 text-sm">
                        <span>Unsaved changes</span>
                    </div>
                ) : null
        }
    }

    return (
        <AppLayout projects={projects}>
            <Head title={`Edit: ${editingPage.title}`} />
            
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left side - Back button and breadcrumb */}
                        <div className="flex items-center gap-4">
                            <Button 
                                appearance="plain" 
                                size="small"
                                onPress={handleBack}
                                className="flex items-center gap-2"
                            >
                                <IconArrowLeft />
                                Back
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                <span className="hover:text-foreground cursor-pointer" onClick={handleBack}>
                                    Dashboard
                                </span>
                                <span className="mx-2">/</span>
                                <span className="text-foreground font-medium">Edit Article</span>
                            </div>
                        </div>

                        {/* Center - Save status */}
                        <div className="flex-1 flex justify-center">
                            <SaveStatusIndicator />
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-3">
                            {/* View mode toggle */}
                            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('edit')}
                                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                                        viewMode === 'edit' 
                                            ? 'bg-background text-foreground shadow-sm' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setViewMode('split')}
                                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                                        viewMode === 'split' 
                                            ? 'bg-background text-foreground shadow-sm' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Split
                                </button>
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                                        viewMode === 'preview' 
                                            ? 'bg-background text-foreground shadow-sm' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Preview
                                </button>
                            </div>

                            <Button 
                                intent="primary"
                                onPress={() => handleSave(false)}
                                isDisabled={saveStatus === 'saving' || !hasUnsavedChanges}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Article Meta Information */}
                <div className="mb-6 bg-secondary/50 rounded-lg p-4 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Section (Read Only)
                            </label>
                            <div className="text-sm font-medium bg-secondary/30 px-3 py-2 rounded border border-border">
                                {editingPage.sidebar_item?.sidebar_section?.title_section || 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                ℹ️ Section is fixed for URL consistency
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Last Updated
                            </label>
                            <div className="text-sm font-medium bg-secondary/30 px-3 py-2 rounded border border-border">
                                {new Date(editingPage.updated_at || '').toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Titles */}
                <div className="mb-6 space-y-4">
                    <TextField
                        label="Sidebar Menu Name"
                        description="This is the name shown in the sidebar navigation"
                        value={title}
                        onChange={setTitle}
                        placeholder="e.g. Machine Learning Basics"
                        className="font-medium"
                    />
                </div>

                {/* Content Editor - Responsive Layout */}
                <div className="bg-background rounded-lg border border-border overflow-hidden">
                    <div className={`grid ${viewMode === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'} gap-0`}>
                        {/* Editor */}
                        {(viewMode === 'edit' || viewMode === 'split') && (
                            <div className={`${viewMode === 'split' ? 'border-r border-border' : ''}`}>
                                <div className="bg-secondary/30 px-4 py-2 border-b border-border">
                                    <h3 className="text-sm font-semibold text-muted-foreground">Markdown Editor</h3>
                                </div>
                                <div className="p-4" data-color-mode="dark">
                                    <MDEditor
                                        value={content}
                                        onChange={(val) => setContent(val || '')}
                                        height={viewMode === 'split' ? 600 : 700}
                                        preview="edit"
                                        hideToolbar={false}
                                        data-color-mode="dark"
                                        textareaProps={{
                                            placeholder: 'Start writing your article in Markdown...',
                                            style: {
                                                color: '#ffffff',
                                                WebkitTextFillColor: '#ffffff',
                                                opacity: 1
                                            }
                                        }}
                                        style={{
                                            color: '#ffffff'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Preview */}
                        {(viewMode === 'preview' || viewMode === 'split') && (
                            <div>
                                <div className="bg-secondary/30 px-4 py-2 border-b border-border">
                                    <h3 className="text-sm font-semibold text-muted-foreground">Live Preview</h3>
                                </div>
                                <div className="p-6 prose prose-invert max-w-none overflow-auto" style={{ height: viewMode === 'split' ? '600px' : '700px' }}>
                                    <MDEditor.Markdown 
                                        source={content || '*No content yet. Start typing to see preview...*'} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Helpful Tips */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-blue-400">💡 Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Press <kbd className="px-2 py-1 bg-secondary rounded text-xs">Cmd/Ctrl + S</kbd> to save manually</li>
                        <li>• Your changes auto-save after 3 seconds of inactivity</li>
                        <li>• Use the view mode toggle to switch between edit, split, and preview</li>
                        <li>• Markdown syntax is fully supported with live preview</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    )
}

export default EditArticle
