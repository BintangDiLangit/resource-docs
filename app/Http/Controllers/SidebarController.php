<?php

namespace App\Http\Controllers;

use App\Models\SidebarItem;
use App\Models\Page;
use Illuminate\Http\Request;

class SidebarController extends Controller
{
    // Show all items for a sidebar section
    public function index($sidebarSectionId)
    {
        $items = SidebarItem::where('sidebar_section_id', $sidebarSectionId)->with('pages')->get();
        return view('sidebar-items.index', compact('items'));
    }

    // Show form for creating new SidebarItem and its Page
    public function create($sidebarSectionId)
    {
        return view('sidebar-items.create', ['sidebar_section_id' => $sidebarSectionId]);
    }

    // Store a new SidebarItem and its Page
    public function store(Request $request, $sidebarSectionId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url',
            'is_current' => 'boolean',
            'page_title' => 'required|string|max:255',
            'page_slug' => 'required|string|max:255|unique:pages,slug',
            'page_content' => 'required|string',
        ]);

        $sidebarItem = SidebarItem::create([
            'sidebar_section_id' => $sidebarSectionId,
            'title' => $validated['title'],
            'url' => $validated['url'],
            'is_current' => $validated['is_current'] ?? false,
        ]);

        Page::create([
            'sidebar_item_id' => $sidebarItem->id,
            'title' => $validated['page_title'],
            'slug' => $validated['page_slug'],
            'content' => $validated['page_content'],
        ]);

        return redirect()->route('sidebar-sections.sidebar-items.index', $sidebarSectionId);
    }

    // Show specific SidebarItem and its Page
    public function show($sidebarItemId)
    {
        $item = SidebarItem::with('pages')->findOrFail($sidebarItemId);
        return view('sidebar-items.show', compact('item'));
    }

    // Show form for editing SidebarItem and its Page
    public function edit($sidebarItemId)
    {
        $item = SidebarItem::with('pages')->findOrFail($sidebarItemId);
        return view('sidebar-items.edit', compact('item'));
    }

    // Update SidebarItem and its Page
    public function update(Request $request, $sidebarItemId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|url',
            'is_current' => 'boolean',
            'page_title' => 'required|string|max:255',
            'page_slug' => 'required|string|max:255|unique:pages,slug,' . $request->page_id,
            'page_content' => 'required|string',
        ]);

        $sidebarItem = SidebarItem::findOrFail($sidebarItemId);
        $sidebarItem->update([
            'title' => $validated['title'],
            'url' => $validated['url'],
            'is_current' => $validated['is_current'] ?? false,
        ]);

        $page = Page::where('sidebar_item_id', $sidebarItemId)->first();
        $page->update([
            'title' => $validated['page_title'],
            'slug' => $validated['page_slug'],
            'content' => $validated['page_content'],
        ]);

        return redirect()->route('sidebar-items.show', $sidebarItemId);
    }

    // Delete SidebarItem and its Page
    public function destroy($sidebarItemId)
    {
        $sidebarItem = SidebarItem::findOrFail($sidebarItemId);
        $sidebarItem->pages()->delete();  // Delete associated pages
        $sidebarItem->delete();  // Delete the sidebar item

        return redirect()->route('sidebar-sections.index');
    }
}
