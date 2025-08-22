import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, FileText, Trash2, Plus, Brain } from "lucide-react";
import { useSim } from "@/hooks/useSim";

interface CoreKnowledgeProps {
  advisorId?: string;
  advisorName?: string;
}

const CoreKnowledge = ({ advisorId, advisorName }: CoreKnowledgeProps) => {
  const { sim, updateCoreKnowledgeStatus, isLoading } = useSim();
  const [knowledgeItems, setKnowledgeItems] = useState<Array<{
    id: string;
    title: string;
    content: string;
    type: 'text' | 'document';
  }>>([]);

  // Use sim?.id if available, fallback to advisorId prop
  const effectiveAdvisorId = sim?.id || advisorId;
  const effectiveAdvisorName = sim?.name || advisorName;

  const addKnowledgeItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: '',
      content: '',
      type: 'text' as const
    };
    setKnowledgeItems([...knowledgeItems, newItem]);
  };

  const removeKnowledgeItem = (id: string) => {
    setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));
  };

  const updateKnowledgeItem = (id: string, field: 'title' | 'content', value: string) => {
    setKnowledgeItems(knowledgeItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    try {
      // For now, we'll just mark core knowledge as complete
      // In Phase 2, we'll implement actual document processing and embedding
      await updateCoreKnowledgeStatus();
    } catch (error) {
      console.error('Error saving core knowledge:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Core Knowledge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Upload documents, add personal experiences, and share your expertise to build your Sim's knowledge base. 
            This helps your Sim give more accurate and personalized responses.
          </p>

          {/* Knowledge Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Knowledge Items</Label>
              <Button onClick={addKnowledgeItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge
              </Button>
            </div>

            {knowledgeItems.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-medium mb-2">No knowledge items yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your expertise, experiences, and documents to help your Sim provide better responses.
                  </p>
                  <Button onClick={addKnowledgeItem} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Knowledge Item
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {knowledgeItems.map((item, index) => (
                  <Card key={item.id} className="border-dashed">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Knowledge Item {index + 1}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeKnowledgeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`title-${item.id}`} className="text-sm">
                            Title/Topic
                          </Label>
                          <Input
                            id={`title-${item.id}`}
                            placeholder="e.g., My experience with project management, Marketing strategies I've used..."
                            value={item.title}
                            onChange={(e) => updateKnowledgeItem(item.id, 'title', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`content-${item.id}`} className="text-sm">
                            Content/Details
                          </Label>
                          <Textarea
                            id={`content-${item.id}`}
                            placeholder="Share your knowledge, experiences, methodologies, or any information that would help your Sim respond as you would..."
                            value={item.content}
                            onChange={(e) => updateKnowledgeItem(item.id, 'content', e.target.value)}
                            className="mt-1 min-h-[120px]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Document Upload Section - Placeholder for Phase 2 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Document Upload</Label>
            <p className="text-sm text-muted-foreground">
              Upload PDFs, Word documents, or text files to add to your Sim's knowledge base.
            </p>
            <Card className="border-dashed border-muted">
              <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Document upload coming in Phase 2
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              className="px-8"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Core Knowledge'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Building Your Knowledge Base</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include your professional experiences and methodologies</li>
            <li>• Add personal anecdotes that show your perspective and approach</li>
            <li>• Share your expertise in specific domains or industries</li>
            <li>• Include your opinions on topics you're passionate about</li>
            <li>• Add any frameworks or processes you use in your work</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoreKnowledge;
