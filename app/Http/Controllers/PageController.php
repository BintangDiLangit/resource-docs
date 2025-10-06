<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SidebarItem;
use App\Models\SidebarSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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

    public function articleAi()
    {
        $sidebarSections = SidebarSection::with('sidebarItems')->get();
        $serverSeo       = $this->defaultSeo();
    
        return Inertia::render('article-ai', [
            'title'           => 'AI Article Generator',
            'content'         => '',
            'sidebarSections' => $sidebarSections,
            'projects'        => $this->defaultProjects(),
        ])->withViewData(compact('serverSeo'));
    }

    public function createArticle()
    {
        $sidebarSections = $this->getSidebarSections();
        $serverSeo       = $this->defaultSeo();

        return Inertia::render('create-article', [
            'sidebarSections' => $sidebarSections,
            'projects'        => $this->defaultProjects(),
        ])->withViewData(compact('serverSeo'));
    }

    public function editArticle($id)
    {
        $page = Page::with(['sidebarItem.sidebarSection'])->findOrFail($id);
        $sidebarSections = $this->getSidebarSections();
        $serverSeo = $this->defaultSeo();

        return Inertia::render('edit-article', [
            'editingPage'     => $page,
            'sidebarSections' => $sidebarSections,
            'projects'        => $this->defaultProjects(),
        ])->withViewData(compact('serverSeo'));
    }

    public function generateArticleFromPrompt(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|min:5',
        ]);

        $prompt = $request->input('prompt');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.zai.api_key'),
                'Content-Type' => 'application/json',
                'Accept-Language' => 'en-US,en'
            ])->post(config('services.zai.base_url') . '/chat/completions', [
                'model' => 'glm-4.5',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful assistant that writes well-structured articles in Markdown format.'],
                    ['role' => 'user', 'content' => <<<EOT
Write a complete, comprehensive markdown article based on the following prompt:

"{$prompt}"

Requirements:
- Start with a compelling title (use "# [Title]")
- Include a relevant header image (use Markdown ![]() syntax with a professional tech image from Unsplash)
- Write a complete article with at least 4-5 main sections
- Include practical examples, code snippets, or real-world applications where relevant
- End with a proper conclusion
- Make it informative, engaging, and professional
- Minimum 800 words, aim for 1200-1500 words
- Use proper markdown formatting with headers, lists, and emphasis
- Ensure the article is complete and doesn't end abruptly

Write the full, complete article now:
EOT],
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
                'stream' => false,
            ]);
            
            Log::info('Z.AI API Response: ', $response->json());

            $responseData = $response->json();
            $generated = $responseData['choices'][0]['message']['content'] ?? '';

            return response()->json(['markdown' => $generated]);
        } catch (\Exception $e) {
            Log::error('Z.AI API Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function autoGenerateArticle()
    {
        try {
            // Generate a random prompt for automatic article generation
            $prompts = [
                'Latest trends in web development',
                'Introduction to machine learning for beginners',
                'Best practices for database optimization',
                'Modern JavaScript frameworks comparison',
                'Cloud computing benefits and challenges',
                'Cybersecurity tips for developers',
                'API design principles and best practices',
                'Mobile app development strategies',
                'DevOps culture and practices',
                'Artificial intelligence in business applications'
            ];

            $randomPrompt = $prompts[array_rand($prompts)];
            
            Log::info('Auto-generating article with prompt: ' . $randomPrompt);

            $apiKey = config('services.zai.api_key');
            $baseUrl = config('services.zai.base_url');
            
            Log::info('Z.AI API Configuration - Key exists: ' . (!empty($apiKey) ? 'Yes' : 'No') . ', Base URL: ' . $baseUrl);
            
            if (empty($apiKey)) {
                Log::error('Z.AI API key is not configured');
                return response()->json(['error' => 'Z.AI API key is not configured'], 500);
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'Accept-Language' => 'en-US,en'
            ])->post($baseUrl . '/chat/completions', [
                'model' => 'glm-4.5',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful assistant that writes well-structured articles in Markdown format.'],
                    ['role' => 'user', 'content' => <<<EOT
Write a complete, comprehensive markdown article based on the following prompt:

"{$randomPrompt}"

Requirements:
- Start with a compelling title (use "# [Title]")
- Include a relevant header image (use Markdown ![]() syntax with a professional tech image from Unsplash)
- Write a complete article with at least 4-5 main sections
- Include practical examples, code snippets, or real-world applications where relevant
- End with a proper conclusion
- Make it informative, engaging, and professional
- Minimum 800 words, aim for 1200-1500 words
- Use proper markdown formatting with headers, lists, and emphasis
- Ensure the article is complete and doesn't end abruptly

Write the full, complete article now:
EOT],
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
                'stream' => false,
            ]);
            
            Log::info('Z.AI API Response Status: ' . $response->status());
            Log::info('Z.AI API Response Body: ' . $response->body());
            
            if (!$response->successful()) {
                Log::error('Z.AI API request failed with status: ' . $response->status() . ', body: ' . $response->body());
                return response()->json(['error' => 'API request failed: ' . $response->status() . ' - ' . $response->body()], 500);
            }
            
            $responseData = $response->json();
            Log::info('Z.AI API Response Data: ', $responseData);
            
            $generated = $responseData['choices'][0]['message']['content'] ?? '';
            Log::info('Generated content length: ' . strlen($generated));
            Log::info('Generated content preview: ' . substr($generated, 0, 200) . '...');

            if (!empty($generated)) {
                // Get or create sidebar section for AI-generated articles
                $aiSection = SidebarSection::firstOrCreate(
                    ['title_section' => 'Latest Tech Insights'],
                    ['title_section' => 'Latest Tech Insights']
                );

                // Get or create sidebar item for this article
                $sidebarItem = SidebarItem::firstOrCreate(
                    [
                        'sidebar_section_id' => $aiSection->id,
                        'title' => $this->extractTitleFromMarkdown($generated)
                    ],
                    [
                        'sidebar_section_id' => $aiSection->id,
                        'title' => $this->extractTitleFromMarkdown($generated),
                        'url' => '/page/' . $this->generateSlug($this->extractTitleFromMarkdown($generated)),
                        'is_current' => false
                    ]
                );

                // Create a new page with the generated content
                $page = Page::create([
                    'sidebar_item_id' => $sidebarItem->id,
                    'title' => $this->extractTitleFromMarkdown($generated),
                    'content' => $generated,
                    'slug' => $this->generateSlug($this->extractTitleFromMarkdown($generated)),
                    'meta_description' => 'Auto-generated article about ' . $randomPrompt,
                ]);

                Log::info('Auto-generated article created successfully with ID: ' . $page->id . ', Sidebar Item ID: ' . $sidebarItem->id);
                return response()->json(['success' => true, 'message' => 'Article generated successfully', 'article_id' => $page->id]);
            }

            Log::error('Generated content is empty. Response structure: ', $responseData);
            return response()->json(['error' => 'Generated content is empty'], 500);
        } catch (\Exception $e) {
            Log::error('Auto-generation exception: ' . $e->getMessage());
            Log::error('Auto-generation exception trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Exception: ' . $e->getMessage()], 500);
        }
    }

    private function extractTitleFromMarkdown($markdown)
    {
        if (preg_match('/^#\s+(.+)$/m', $markdown, $matches)) {
            return trim($matches[1]);
        }
        return 'Auto-Generated Article - ' . date('Y-m-d H:i:s');
    }

    private function generateSlug($title)
    {
        return 'auto-' . strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $title)) . '-' . time();
    }
}
