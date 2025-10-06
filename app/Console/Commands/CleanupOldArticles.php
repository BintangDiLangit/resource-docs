<?php

namespace App\Console\Commands;

use App\Models\SidebarSection;
use App\Models\SidebarItem;
use App\Models\Page;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupOldArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:cleanup {sectionId} {--keep=10}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old articles from a section, keeping only the newest ones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sectionId = $this->argument('sectionId');
        $keepCount = $this->option('keep');

        $section = SidebarSection::find($sectionId);
        
        if (!$section) {
            $this->error("❌ Section with ID {$sectionId} not found!");
            return 1;
        }

        $this->info("🔍 Processing section: {$section->title_section} (ID: {$sectionId})");
        $this->newLine();

        // Get all sidebar items for this section, ordered by newest first
        $allItems = SidebarItem::where('sidebar_section_id', $sectionId)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalItems = $allItems->count();
        
        if ($totalItems <= $keepCount) {
            $this->info("✅ Only {$totalItems} items found. Nothing to delete (keeping {$keepCount}).");
            return 0;
        }

        // Items to keep (newest)
        $itemsToKeep = $allItems->take($keepCount);
        
        // Items to delete (oldest)
        $itemsToDelete = $allItems->skip($keepCount);
        
        $deleteCount = $itemsToDelete->count();

        $this->warn("📊 Statistics:");
        $this->info("   Total items: {$totalItems}");
        $this->info("   Items to keep: {$keepCount} (newest)");
        $this->info("   Items to delete: {$deleteCount} (oldest)");
        $this->newLine();

        if (!$this->confirm("Do you want to proceed with deletion?", true)) {
            $this->info("❌ Cancelled by user.");
            return 0;
        }

        $this->newLine();
        $this->info("🗑️  Starting cleanup...");
        
        DB::beginTransaction();
        
        try {
            $deletedPages = 0;
            $deletedItems = 0;
            
            foreach ($itemsToDelete as $item) {
                // Delete associated pages first
                $pagesCount = Page::where('sidebar_item_id', $item->id)->count();
                if ($pagesCount > 0) {
                    Page::where('sidebar_item_id', $item->id)->delete();
                    $deletedPages += $pagesCount;
                    $this->line("   ✓ Deleted {$pagesCount} page(s) for item: {$item->title}");
                }
                
                // Delete sidebar item
                $item->delete();
                $deletedItems++;
            }
            
            DB::commit();
            
            $this->newLine();
            $this->info("✅ Cleanup completed successfully!");
            $this->info("   🗑️  Deleted {$deletedItems} sidebar items");
            $this->info("   🗑️  Deleted {$deletedPages} pages");
            $this->newLine();
            
            $this->info("📋 Remaining items in '{$section->title_section}':");
            foreach ($itemsToKeep as $item) {
                $this->line("   • {$item->title} (created: {$item->created_at})");
            }
            
            return 0;
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("❌ Error during cleanup: {$e->getMessage()}");
            return 1;
        }
    }
}
