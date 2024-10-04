<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\SidebarItem;
use App\Models\SidebarSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\support\Str;

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
        $page = Page::with('sidebarItem')->where('slug', $slug)->firstOrFail();


        $sidebarSections = SidebarSection::with('sidebarItems')->get();

        return Inertia::render('page', [
            'page' => $page,
            'sidebarSections' => $sidebarSections,
            'projects' => [
                ['name' => 'Me', 'href' => '/', 'icon' => 'IconDashboard'],
                ['name' => 'Support Me', 'href' => '/support-me', 'icon' => 'IconCreditCard'],
            ]
        ]);
    }

    public function getPageBySidebarItem($sidebarItemId)
    {
        $page = Page::where('sidebar_item_id', $sidebarItemId)->firstOrFail();

        return response()->json(['content' => $page ? $page->content : '']);
    }

    public function createOrUpdate(Request $request)
    {
        $request->validate([
            'sidebarItemId' => 'nullable',
            'content' => 'required',
        ]);

        try {
            DB::beginTransaction();
            $sidebarSectionId = 0;
            $sidebarItemId = 0;

            if ($request->sidebarSectionId == null) {
                $ss = SidebarSection::create([
                    'title_section' => $request->sidebarSectionName
                ]);
                $sidebarSectionId = $ss->id;
            } else {
                $sidebarSectionId = $request->sidebarSectionId;
            }

            $sidebarSection = SidebarSection::find($sidebarSectionId);

            if ($request->sidebarItemId == null) {
                $si =  SidebarItem::create([
                    'sidebar_section_id' => $sidebarSectionId,
                    'title' => $request->sidebarItemName,
                    'url' => '/page/' . Str::slug($sidebarSection->title_section) . '/' . Str::slug($request->sidebarItemName),
                ]);

                $sidebarItemId = $si->id;
            } else {
                $sidebarItemId = $request->sidebarItemId;
            }

            $sidebarItem = SidebarItem::find($sidebarItemId);


            Page::updateOrCreate(
                [
                    // The conditions used to find an existing record
                    'sidebar_item_id' => $sidebarItemId,
                ],
                [
                    // The values to update or create the record
                    'title' => $sidebarItem->title,
                    'content' => $request->content,
                    'slug' => Str::slug($sidebarSection->title_section) . '/' . Str::slug($sidebarItem->title),
                ]
            );

            DB::commit();

            flashMessage('success', $sidebarItem->title . 'was updated');
            return response()->json(['success' => true]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['errors' => $th->getMessage()]);
        }
    }

    public function updateSidebarItem(Request $request)
    {
        $request->validate([
            'sidebarTitleName' => 'required',
            'pageId' => 'required',
        ]);

        try {
            DB::beginTransaction();

            $sidebarItem = SidebarItem::find($request->pageId);

            if ($sidebarItem) {
                $sidebarItem->update([
                    'title' => $request->sidebarTitleName,
                    'url' => '/page/' . Str::slug($sidebarItem->sidebarSection->title_section) . '/' . Str::slug($request->sidebarTitleName),
                ]);

                $sidebarItem->page->update([
                    'title' => $request->sidebarTitleName,
                    'slug' => Str::slug($sidebarItem->sidebarSection->title_section) . '/' . Str::slug($sidebarItem->title)
                ]);
            } else {
                return response()->json(['error' => 'Page or SidebarItem not found'], 404);
            }

            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json(['errors' => $th->getMessage()]);
        }
    }

    public function getSidebarData()
    {
        $sidebarSections = SidebarSection::with('sidebarItems')->get();

        return response()->json($sidebarSections);
    }
}
