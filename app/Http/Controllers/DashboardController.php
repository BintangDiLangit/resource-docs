<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SidebarSection;
use App\Models\SidebarItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\URL;

class DashboardController extends Controller
{
    private function defaultSeo(): array
    {
        return [
            'title'       => 'Dashboard - BINTANGMFHD',
            'description' => 'Article management dashboard for BINTANGMFHD documentation.',
            'image'       => "https://bintangmfhd.s3.ap-southeast-3.amazonaws.com/photos/1/Tech/64e0bb014746fpueucwmxjg.png",
            'url'         => URL::current() ?? '/dashboard',
        ];
    }

    private function defaultProjects(): array
    {
        return [
            ['name' => 'Me', 'href' => '/', 'icon' => 'IconDashboard'],
            ['name' => 'Support Me', 'href' => '/support-me', 'icon' => 'IconCreditCard'],
        ];
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        // Get article statistics
        $totalArticles = Page::count();
        $totalSections = SidebarSection::count();
        $totalSidebarItems = SidebarItem::count();
        
        // Get recent articles (last 10)
        $recentArticles = Page::with(['sidebarItem.sidebarSection'])
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'section' => $page->sidebarItem?->sidebarSection?->title_section ?? 'Uncategorized',
                    'updated_at' => $page->updated_at,
                    'url' => $page->sidebarItem?->url ?? '#',
                ];
            });

        // Get articles by section
        $articlesBySection = SidebarSection::withCount(['sidebarItems as articles_count'])
            ->with('sidebarItems.page')
            ->get()
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'title' => $section->title_section,
                    'articles_count' => $section->articles_count,
                    'pages_count' => $section->sidebarItems->sum(function ($item) {
                        return $item->page ? 1 : 0;
                    }),
                ];
            });

        // Get sidebar sections for navigation
        $sidebarSections = SidebarSection::with('sidebarItems')->get();

        $serverSeo = $this->defaultSeo();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_articles' => $totalArticles,
                'total_sections' => $totalSections,
                'total_sidebar_items' => $totalSidebarItems,
            ],
            'recent_articles' => $recentArticles,
            'articles_by_section' => $articlesBySection,
            'sidebarSections' => $sidebarSections,
            'projects' => $this->defaultProjects(),
        ])->withViewData(compact('serverSeo'));
    }
}
