<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\PageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AutoGenerateArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'articles:auto-generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically generate articles using Z.AI API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting auto-article generation...');
        
        try {
            $controller = new PageController();
            $result = $controller->autoGenerateArticle();
            
            if ($result->getData()->success ?? false) {
                $this->info('Article generated successfully! ID: ' . ($result->getData()->article_id ?? 'unknown'));
                Log::info('Auto-article generation completed successfully via command');
            } else {
                $this->error('Failed to generate article: ' . ($result->getData()->error ?? 'Unknown error'));
                Log::error('Auto-article generation failed via command: ' . ($result->getData()->error ?? 'Unknown error'));
            }
        } catch (\Exception $e) {
            $this->error('Exception occurred: ' . $e->getMessage());
            Log::error('Auto-article generation exception: ' . $e->getMessage());
        }
        
        $this->info('Auto-article generation process completed.');
    }
}
