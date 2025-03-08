<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SidebarItem;
use App\Models\SidebarSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\URL;

class PageController extends Controller
{
    private function defaultSeo(): array
    {
        return [
            'title'       => 'Docs Bintang Miftaqul Huda - BINTANGMFHD',
            'description' => 'Welcome to BINTANGMFHD documentation, where you will find useful resources on development.',
            'image'       => "https://bintangmfhd.s3.ap-southeast-3.amazonaws.com/photos/1/Tech/64e0bb014746fpueucwmxjg.png",
            'url'         => URL::current() ?? '/',
        ];
    }

    private function defaultProjects(): array
    {
        return [
            ['name' => 'Me', 'href' => '/', 'icon' => 'IconDashboard'],
            ['name' => 'Support Me', 'href' => '/support-me', 'icon' => 'IconCreditCard'],
        ];
    }

    private function getSidebarSections()
    {
        return SidebarSection::with('sidebarItems')->get();
    }

    private function extractFirstImageUrl(string $content): ?string
    {
        // This regex matches Markdown image syntax: ![Alt Text](URL)
        $pattern = '/!\[.*?\]\((.*?)\)/';
        if (preg_match($pattern, $content, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function index()
    {
        $sidebarSections = $this->getSidebarSections();
        $serverSeo       = $this->defaultSeo();

        return Inertia::render('home', [
            'sidebarSections' => $sidebarSections,
            'projects'        => $this->defaultProjects(),
        ])->withViewData(compact('serverSeo'));
    }

    public function setting()
    {
        $sidebarSections = $this->getSidebarSections();
        $serverSeo       = $this->defaultSeo();

        return Inertia::render('setting', [
            'title'           => "Setting",
            'sidebarSections' => $sidebarSections,
            'projects'        => $this->defaultProjects(),
        ])->withViewData(compact('serverSeo'));
    }

    public function supportMe()
    {
        $sidebarSections = $this->getSidebarSections();
        $serverSeo       = $this->defaultSeo();

        return Inertia::render('support-me', [
            'sidebarSections' => $sidebarSections,
            'projects'        => $this->defaultProjects(),
        ])->withViewData(compact('serverSeo'));
    }

    public function show(Request $request, $slug)
    {
        $page            = Page::with('sidebarItem')->where('slug', $slug)->firstOrFail();
        $sidebarSections = $this->getSidebarSections();

        $firstImage = $this->extractFirstImageUrl($page->content);

        // Merge default SEO with page-specific data
        $serverSeo = array_merge($this->defaultSeo(), [
            'title'       => $page->title ?? $this->defaultSeo()['title'],
            'description' => $page->content
                ? Str::limit(strip_tags($page->content), 150)
                : $this->defaultSeo()['description'],
            'image'       => $firstImage ?? $this->defaultSeo()['image'],
            'url'         => URL::current() ?? '/',
        ]);

        return Inertia::render('page', [
            'page'            => $page,
            'sidebarSections' => $sidebarSections,
            'projects'        => $this->defaultProjects(),
            'clientSeo'       => $serverSeo,
        ])->withViewData(compact('serverSeo'))
          ->with('key', $slug);
    }

    public function getPageBySidebarItem($sidebarItemId)
    {
        $page = Page::where('sidebar_item_id', $sidebarItemId)->firstOrFail();
        return response()->json(['content' => $page->content]);
    }

    public function createOrUpdate(Request $request)
    {
        $request->validate([
            'sidebarItemId'     => 'nullable',
            'content'           => 'required',
            'sidebarSectionId'  => 'nullable',
            'sidebarSectionName'=> 'nullable|string',
            'sidebarItemName'   => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Create or retrieve SidebarSection
            if (is_null($request->sidebarSectionId)) {
                $sidebarSection = SidebarSection::create([
                    'title_section' => $request->sidebarSectionName,
                ]);
            } else {
                $sidebarSection = SidebarSection::findOrFail($request->sidebarSectionId);
            }

            // Create or retrieve SidebarItem
            if (is_null($request->sidebarItemId)) {
                $sidebarItem = SidebarItem::create([
                    'sidebar_section_id' => $sidebarSection->id,
                    'title'              => $request->sidebarItemName,
                    'url'                => '/page/' . Str::slug($sidebarSection->title_section) . '/' . Str::slug($request->sidebarItemName),
                ]);
            } else {
                $sidebarItem = SidebarItem::findOrFail($request->sidebarItemId);
            }

            // Update or create the page
            Page::updateOrCreate(
                ['sidebar_item_id' => $sidebarItem->id],
                [
                    'title'   => $sidebarItem->title,
                    'content' => $request->content,
                    'slug'    => Str::slug($sidebarSection->title_section) . '/' . Str::slug($sidebarItem->title),
                ]
            );

            DB::commit();
            flashMessage('success', $sidebarItem->title . ' was updated');
            return response()->json(['success' => true]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['errors' => $th->getMessage()], 500);
        }
    }

    public function updateSidebarItem(Request $request)
    {
        $request->validate([
            'sidebarTitleName' => 'required',
            'pageId'           => 'required',
        ]);

        try {
            DB::beginTransaction();

            $sidebarItem = SidebarItem::findOrFail($request->pageId);

            $sidebarItem->update([
                'title' => $request->sidebarTitleName,
                'url'   => '/page/' . Str::slug($sidebarItem->sidebarSection->title_section) . '/' . Str::slug($request->sidebarTitleName),
            ]);

            // Update the associated page as well
            $sidebarItem->page->update([
                'title' => $request->sidebarTitleName,
                'slug'  => Str::slug($sidebarItem->sidebarSection->title_section) . '/' . Str::slug($request->sidebarTitleName),
            ]);

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['errors' => $th->getMessage()], 500);
        }
    }

    public function getSidebarData()
    {
        $sidebarSections = SidebarSection::with([
            'sidebarItems' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
        ])
        ->withMax('sidebarItems', 'created_at')
        ->orderBy('sidebar_items_max_created_at', 'desc')
        ->limit(50)
        ->get();

        return response()->json($sidebarSections);
    }

    public function search(Request $request)
    {
        $searchQuery = $request->input('query', '');

        if (empty($searchQuery)) {
            $sections = SidebarSection::with([
                'sidebarItems' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                },
            ])
            ->withMax('sidebarItems', 'created_at')
            ->orderBy('sidebar_items_max_created_at', 'desc')
            ->limit(50)
            ->get();

            return response()->json($sections);
        }

        $sections = SidebarSection::with([
            'sidebarItems' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
        ])
        ->where(function ($query) use ($searchQuery) {
            $query->where('title_section', 'like', '%' . $searchQuery . '%')
                  ->orWhereHas('sidebarItems', function ($q) use ($searchQuery) {
                      $q->where('title', 'like', '%' . $searchQuery . '%');
                  });
        })
        ->withMax('sidebarItems', 'created_at')
        ->orderBy('sidebar_items_max_created_at', 'desc')
        ->limit(50)
        ->get();

        // Filter items for sections that only matched by item title.
        $sections = $sections->map(function ($section) use ($searchQuery) {
            if (stripos($section->title_section, $searchQuery) === false) {
                $section->sidebarItems = $section->sidebarItems->filter(function ($item) use ($searchQuery) {
                    return stripos($item->title, $searchQuery) !== false;
                })->values();
            }
            return $section;
        });

        $sections = $sections->filter(function ($section) use ($searchQuery) {
            $titleMatches = (stripos($section->title_section, $searchQuery) !== false);
            return $titleMatches || $section->sidebarItems->count() > 0;
        })->values();

        $transformed = $sections->map(function ($section) {
            return [
                'id'            => $section->id,
                'title_section' => $section->title_section,
                'created_at'    => $section->created_at,
                'sidebar_items'=> $section->sidebarItems->map(function ($item) {
                    return [
                        'id'                => $item->id,
                        'title'             => $item->title,
                        'is_current'        => $item->is_current,
                        'sidebar_section_id'=> $item->sidebar_section_id,
                        'url'               => $item->url,
                        'created_at'        => $item->created_at,
                        'updated_at'        => $item->updated_at,
                    ];
                }),
            ];
        });

        return response()->json($transformed);
    }
}
