
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Activity, Play } from "lucide-react";

export function Demos() {
  return (
    <section id="labs" className="py-24 bg-neutral-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4 border-orange-900/50 text-orange-500 bg-orange-950/10">
            RESTRICTED ACCESS
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Project Labs</h2>
          <p className="text-slate-400">
            Live demonstration environments for experimental agents and scrapers.
          </p>
        </div>

        <Tabs defaultValue="sentiment" className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-12 overflow-x-auto pb-2">
            <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
              <TabsTrigger 
                value="sentiment"
                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white px-6"
              >
                SentimentScope
              </TabsTrigger>
              <TabsTrigger 
                value="scraper"
                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white px-6"
              >
                Enterprise Scrapers
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SentimentScope Tab */}
          <TabsContent value="sentiment" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8 items-center bg-neutral-900/30 border border-neutral-800 rounded-xl p-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-sm">
                  <Activity size={16} />
                  <span>LIVE FEED // ANALYSIS</span>
                </div>
                <h3 className="text-2xl font-bold text-white">SentimentScope</h3>
                <p className="text-slate-400 leading-relaxed">
                  Real-time NLP engine capable of processing 50k+ tokens/sec. 
                  Detects micro-trends in financial markets using transformer-based sentiment analysis.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">Python</Badge>
                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">FastAPI</Badge>
                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">Transformers</Badge>
                </div>
                <Button className="bg-white text-black hover:bg-neutral-200">
                  <Play className="mr-2 h-4 w-4" /> Launch Demo
                </Button>
              </div>
              
              {/* Fake UI Preview */}
              <div className="aspect-video bg-neutral-950 rounded-lg border border-neutral-800 p-4 font-mono text-xs overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="mt-8 space-y-2 text-green-500/80">
                  <p>{`> init_model('sentiment_v4')`}</p>
                  <p>{`> [SUCCESS] weights loaded (400ms)`}</p>
                  <p>{`> connecting to stream...`}</p>
                  <p className="text-white">{`[BTC] Bullish signal detected (Confidence: 0.89)`}</p>
                  <p className="text-white">{`[ETH] Neutral sentiment, high volatility`}</p>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scraper Tab */}
          <TabsContent value="scraper" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-8 items-center bg-neutral-900/30 border border-neutral-800 rounded-xl p-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-orange-400 font-mono text-sm">
                  <Terminal size={16} />
                  <span>PIPELINE // RESILIENT</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Resilient Scraper</h3>
                <p className="text-slate-400 leading-relaxed">
                  Distributed scraping network with automatic IP rotation and CAPTCHA solving. 
                  Designed for high-frequency data extraction without detection.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">Puppeteer</Badge>
                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">Redis</Badge>
                  <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">Docker</Badge>
                </div>
                <Button className="bg-white text-black hover:bg-neutral-200">
                  <Play className="mr-2 h-4 w-4" /> View Architecture
                </Button>
              </div>
              
              {/* Fake Terminal Preview */}
              <div className="aspect-video bg-neutral-950 rounded-lg border border-neutral-800 p-4 font-mono text-xs overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-8 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
                   <div className="text-neutral-500">worker-node-01</div>
                </div>
                <div className="mt-8 space-y-1 text-neutral-400">
                  <div className="flex justify-between">
                    <span>Target: e-commerce-giant.com</span>
                    <span className="text-green-500">200 OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target: competitor-pricing.net</span>
                    <span className="text-green-500">200 OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proxy: 192.168.x.x (Rotated)</span>
                    <span className="text-orange-500">New Identity</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1 mt-4 rounded-full overflow-hidden">
                    <div className="bg-orange-500 w-3/4 h-full"></div>
                  </div>
                  <div className="text-center mt-2 text-orange-500">Processing Batch 419...</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
