
import React, { useState } from 'react';
import { Globe, Database, FileText, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { externalDocumentService } from '@/services/externalDocumentService';
import { toast } from 'sonner';

interface ExternalDocumentImporterProps {
  advisorId: string;
  onImportComplete: () => void;
}

export const ExternalDocumentImporter: React.FC<ExternalDocumentImporterProps> = ({
  advisorId,
  onImportComplete
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [webUrl, setWebUrl] = useState('');
  const [webSelector, setWebSelector] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiHeaders, setApiHeaders] = useState('');
  const [apiBody, setApiBody] = useState('');
  const [googleDocId, setGoogleDocId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleWebScraping = async () => {
    if (!webUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsImporting(true);
    try {
      const result = await externalDocumentService.scrapeWebPage(advisorId, {
        url: webUrl.trim(),
        selector: webSelector.trim() || undefined,
        respectRobots: true
      });

      if (result.success) {
        toast.success(`Successfully imported: ${result.title}`);
        setWebUrl('');
        setWebSelector('');
        onImportComplete();
      } else {
        toast.error(result.error || 'Failed to scrape webpage');
      }
    } catch (error) {
      console.error('Web scraping error:', error);
      toast.error('Web scraping failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleApiImport = async () => {
    if (!apiEndpoint.trim()) {
      toast.error('Please enter an API endpoint');
      return;
    }

    setIsImporting(true);
    try {
      let headers = {};
      if (apiHeaders.trim()) {
        try {
          headers = JSON.parse(apiHeaders);
        } catch {
          toast.error('Invalid JSON in headers field');
          setIsImporting(false);
          return;
        }
      }

      let body = undefined;
      if (apiBody.trim()) {
        try {
          body = JSON.parse(apiBody);
        } catch {
          toast.error('Invalid JSON in body field');
          setIsImporting(false);
          return;
        }
      }

      const result = await externalDocumentService.fetchFromAPI(advisorId, {
        endpoint: apiEndpoint.trim(),
        method: 'GET',
        headers,
        body
      });

      if (result.success) {
        toast.success(`Successfully imported: ${result.title}`);
        setApiEndpoint('');
        setApiHeaders('');
        setApiBody('');
        onImportComplete();
      } else {
        toast.error(result.error || 'Failed to import from API');
      }
    } catch (error) {
      console.error('API import error:', error);
      toast.error('API import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleGoogleDocsImport = async () => {
    if (!googleDocId.trim() || !accessToken.trim()) {
      toast.error('Please enter both Document ID and Access Token');
      return;
    }

    setIsImporting(true);
    try {
      const result = await externalDocumentService.importFromGoogleDocs(
        advisorId,
        googleDocId.trim(),
        accessToken.trim()
      );

      if (result.success) {
        toast.success(`Successfully imported: ${result.title}`);
        setGoogleDocId('');
        setAccessToken('');
        onImportComplete();
      } else {
        toast.error(result.error || 'Failed to import from Google Docs');
      }
    } catch (error) {
      console.error('Google Docs import error:', error);
      toast.error('Google Docs import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Import External Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="web" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="web" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Web Scraping
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              API Import
            </TabsTrigger>
            <TabsTrigger value="google" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Google Docs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="web" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="web-url">Website URL *</Label>
                <Input
                  id="web-url"
                  placeholder="https://example.com/page"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  disabled={isImporting}
                />
              </div>
              
              <div>
                <Label htmlFor="web-selector">CSS Selector (optional)</Label>
                <Input
                  id="web-selector"
                  placeholder=".content, #main-article, etc."
                  value={webSelector}
                  onChange={(e) => setWebSelector(e.target.value)}
                  disabled={isImporting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to extract all content
                </p>
              </div>
              
              <Alert>
                <AlertDescription>
                  Web scraping respects robots.txt and rate limits. Some sites may block automated access.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleWebScraping}
                disabled={isImporting || !webUrl.trim()}
                className="w-full"
              >
                {isImporting ? 'Scraping...' : 'Import from Web'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="api-endpoint">API Endpoint *</Label>
                <Input
                  id="api-endpoint"
                  placeholder="https://api.example.com/data"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  disabled={isImporting}
                />
              </div>
              
              <div>
                <Label htmlFor="api-headers">Headers (JSON)</Label>
                <Textarea
                  id="api-headers"
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  value={apiHeaders}
                  onChange={(e) => setApiHeaders(e.target.value)}
                  disabled={isImporting}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="api-body">Request Body (JSON, optional)</Label>
                <Textarea
                  id="api-body"
                  placeholder='{"query": "search terms"}'
                  value={apiBody}
                  onChange={(e) => setApiBody(e.target.value)}
                  disabled={isImporting}
                  rows={3}
                />
              </div>
              
              <Button
                onClick={handleApiImport}
                disabled={isImporting || !apiEndpoint.trim()}
                className="w-full"
              >
                {isImporting ? 'Importing...' : 'Import from API'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="google-doc-id">Google Docs Document ID *</Label>
                <Input
                  id="google-doc-id"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={googleDocId}
                  onChange={(e) => setGoogleDocId(e.target.value)}
                  disabled={isImporting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Extract from the Google Docs URL
                </p>
              </div>
              
              <div>
                <Label htmlFor="access-token">Access Token *</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="Google API Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  disabled={isImporting}
                />
              </div>
              
              <Alert>
                <AlertDescription>
                  You need a valid Google API access token with Google Docs API permissions.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleGoogleDocsImport}
                disabled={isImporting || !googleDocId.trim() || !accessToken.trim()}
                className="w-full"
              >
                {isImporting ? 'Importing...' : 'Import from Google Docs'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
