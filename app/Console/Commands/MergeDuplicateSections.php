<?php

namespace App\Console\Commands;

use App\Models\SidebarSection;
use App\Models\SidebarItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MergeDuplicateSections extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sections:merge-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Merge duplicate sidebar sections and reassign their items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Searching for duplicate sections...');
        
        // Find duplicate sections
        $duplicates = SidebarSection::select('title_section')
            ->groupBy('title_section')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('✅ No duplicate sections found!');
            return 0;
        }

        $this->info("Found {$duplicates->count()} duplicate section name(s):");
        
        foreach ($duplicates as $duplicate) {
            $sections = SidebarSection::where('title_section', $duplicate->title_section)
                ->orderBy('created_at', 'asc')
                ->get();

            $this->newLine();
            $this->warn("📂 Section: {$duplicate->title_section}");
            $this->info("   Found {$sections->count()} duplicates");

            // Keep the oldest one
            $keepSection = $sections->first();
            $deleteSection = $sections->skip(1);

            $this->info("   ✓ Keeping section ID: {$keepSection->id} (created: {$keepSection->created_at})");

            foreach ($deleteSection as $section) {
                $itemsCount = $section->sidebarItems()->count();
                
                if ($itemsCount > 0) {
                    $this->info("   ↻ Moving {$itemsCount} items from section ID {$section->id} to {$keepSection->id}");
                    
                    // Move all sidebar items to the kept section
                    SidebarItem::where('sidebar_section_id', $section->id)
                        ->update(['sidebar_section_id' => $keepSection->id]);
                }
                
                $this->info("   ✗ Deleting duplicate section ID: {$section->id}");
                $section->delete();
            }

            $totalItems = $keepSection->sidebarItems()->count();
            $this->info("   ✅ Final: Section '{$keepSection->title_section}' now has {$totalItems} items");
        }

        $this->newLine();
        $this->info('🎉 Duplicate sections merged successfully!');
        
        return 0;
    }
}
