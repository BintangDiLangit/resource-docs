<?php

namespace App\Http\Controllers;

use App\Models\SidebarSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SidebarSectionController extends Controller
{
    // Display a listing of sidebar sections
    public function index()
    {
        $sections = SidebarSection::all();

        // Return data using Inertia
        return Inertia::render('SidebarSections/Index', [
            'sections' => $sections
        ]);
    }

    // Show the form for creating a new sidebar section
    public function create()
    {
        return Inertia::render('SidebarSections/Create');
    }

    // Store a newly created sidebar section in the database
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title_section' => 'required|string|max:255',
        ]);

        SidebarSection::create($validated);

        // Redirect back to index page after creation
        return redirect()->route('sidebar-sections.index')->with('success', 'Sidebar Section created successfully.');
    }

    // Show specific sidebar section details
    public function show(SidebarSection $sidebarSection)
    {
        return Inertia::render('SidebarSections/Show', [
            'section' => $sidebarSection
        ]);
    }

    // Show the form for editing the sidebar section
    public function edit(SidebarSection $sidebarSection)
    {
        return Inertia::render('SidebarSections/Edit', [
            'section' => $sidebarSection
        ]);
    }

    // Update the sidebar section in the database
    public function update(Request $request, SidebarSection $sidebarSection)
    {
        $validated = $request->validate([
            'title_section' => 'required|string|max:255',
        ]);

        $sidebarSection->update($validated);

        return redirect()->route('sidebar-sections.index')->with('success', 'Sidebar Section updated successfully.');
    }

    // Delete the sidebar section from the database
    public function destroy(SidebarSection $sidebarSection)
    {
        $sidebarSection->delete();

        return redirect()->route('sidebar-sections.index')->with('success', 'Sidebar Section deleted successfully.');
    }
}
