<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SidebarSection;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        // Fetch sidebar sections along with their items
        $sidebarSections = SidebarSection::with('sidebarItems')->get();

        // Render the Inertia view with the fetched sidebar data
        return Inertia::render('home', [
            'sidebarSections' => $sidebarSections,
            'projects' => [
                ['name' => 'Me', 'href' => '/', 'icon' => 'IconDashboard'],
                ['name' => 'Support Me', 'href' => '/support-me', 'icon' => 'IconCreditCard'],
            ]
        ]);
    }

    public function setting()
    {
        // Fetch sidebar sections along with their items
        $sidebarSections = SidebarSection::with('sidebarItems')->get();

        // Render the Inertia view with the fetched sidebar data
        return Inertia::render('setting', [
            'title' => "Setting",
            'sidebarSections' => $sidebarSections,
            'projects' => [
                ['name' => 'Me', 'href' => '/', 'icon' => 'IconDashboard'],
                ['name' => 'Support Me', 'href' => '/support-me', 'icon' => 'IconCreditCard'],
            ]
        ]);
    }

    public function supportMe()
    {
        $sidebarSections = SidebarSection::with('sidebarItems')->get();

        return Inertia::render('support-me', [
            'sidebarSections' => $sidebarSections,
            'projects' => [
                ['name' => 'Me', 'href' => '/', 'icon' => 'IconDashboard'],
                ['name' => 'Support Me', 'href' => '/support-me', 'icon' => 'IconCreditCard'],
            ]
        ]);
    }

    public function show($slug)
    {
        $page = Page::where('slug', $slug)->firstOrFail();

        $sidebarSections = SidebarSection::with('sidebarItems')->get();

        return Inertia::render('page', [
            'title' => $page->title,
            'content' => $page->content,
            'sidebarSections' => $sidebarSections,
            'projects' => [
                ['name' => 'Me', 'href' => '/', 'icon' => 'IconDashboard'],
                ['name' => 'Support Me', 'href' => '/support-me', 'icon' => 'IconCreditCard'],
            ]
        ]);
    }
}
