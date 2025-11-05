import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Palette, Type, Image, Layout } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface XAgentDesignManagerProps {
  agentId: string;
  editCode: string;
}

interface DesignSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  headerImage?: string;
  storeName?: string;
  storeTagline?: string;
  layoutStyle?: 'grid' | 'list' | 'masonry';
  buttonStyle?: 'rounded' | 'square' | 'pill';
}

export const XAgentDesignManager = ({ agentId, editCode }: XAgentDesignManagerProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    primaryColor: '#81f4aa',
    secondaryColor: '#000000',
    fontFamily: 'Inter',
    layoutStyle: 'grid',
    buttonStyle: 'rounded',
  });

  useEffect(() => {
    loadDesignSettings();
  }, [agentId]);

  const loadDesignSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('advisors')
        .select('social_links')
        .eq('id', agentId)
        .single();

      if (error) throw error;

      // Extract design settings from social_links (we'll store them there temporarily)
      const socialLinks = data?.social_links as any;
      if (socialLinks?.design_settings) {
        setDesignSettings({ ...designSettings, ...socialLinks.design_settings });
      }
    } catch (error) {
      console.error('Error loading design settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get current social_links
      const { data: currentData, error: fetchError } = await supabase
        .from('advisors')
        .select('social_links')
        .eq('id', agentId)
        .single();

      if (fetchError) throw fetchError;

      const currentSocialLinks = currentData?.social_links || {};

      // Update with design settings
      const updatedSocialLinks = typeof currentSocialLinks === 'object' && currentSocialLinks !== null
        ? { ...currentSocialLinks, design_settings: designSettings }
        : { design_settings: designSettings };

      const { error } = await supabase
        .from('advisors')
        .update({
          social_links: updatedSocialLinks as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentId)
        .eq('edit_code', editCode);

      if (error) throw error;

      toast.success("Design settings saved successfully!");
    } catch (error) {
      console.error('Error saving design settings:', error);
      toast.error("Failed to save design settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Colors</CardTitle>
          </div>
          <CardDescription>
            Customize the color scheme of your store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={designSettings.primaryColor}
                  onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={designSettings.primaryColor}
                  onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                  placeholder="#81f4aa"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={designSettings.secondaryColor}
                  onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={designSettings.secondaryColor}
                  onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <CardTitle>Typography</CardTitle>
          </div>
          <CardDescription>
            Choose fonts for your store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select
              value={designSettings.fontFamily}
              onValueChange={(value) => setDesignSettings({ ...designSettings, fontFamily: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Branding Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle>Branding</CardTitle>
          </div>
          <CardDescription>
            Customize your store's branding elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name (Optional)</Label>
            <Input
              id="storeName"
              type="text"
              value={designSettings.storeName || ''}
              onChange={(e) => setDesignSettings({ ...designSettings, storeName: e.target.value })}
              placeholder="My Awesome Store"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeTagline">Store Tagline (Optional)</Label>
            <Textarea
              id="storeTagline"
              value={designSettings.storeTagline || ''}
              onChange={(e) => setDesignSettings({ ...designSettings, storeTagline: e.target.value })}
              placeholder="Your one-stop shop for..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headerImage">Header Image URL (Optional)</Label>
            <Input
              id="headerImage"
              type="url"
              value={designSettings.headerImage || ''}
              onChange={(e) => setDesignSettings({ ...designSettings, headerImage: e.target.value })}
              placeholder="https://example.com/header.jpg"
            />
            {designSettings.headerImage && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img 
                  src={designSettings.headerImage} 
                  alt="Header preview" 
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Layout Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            <CardTitle>Layout</CardTitle>
          </div>
          <CardDescription>
            Configure how your offerings are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="layoutStyle">Layout Style</Label>
            <Select
              value={designSettings.layoutStyle}
              onValueChange={(value: any) => setDesignSettings({ ...designSettings, layoutStyle: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="masonry">Masonry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonStyle">Button Style</Label>
            <Select
              value={designSettings.buttonStyle}
              onValueChange={(value: any) => setDesignSettings({ ...designSettings, buttonStyle: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select button style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="pill">Pill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          size="lg"
          className="min-w-32"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Design'
          )}
        </Button>
      </div>
    </div>
  );
};
