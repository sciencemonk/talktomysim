import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";

interface Offering {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_method: string;
  required_info: Array<{ label: string; type: string; required: boolean }>;
  is_active: boolean;
  created_at: string;
}

interface XAgentStoreManagerProps {
  agentId: string;
}

export function XAgentStoreManager({ agentId }: XAgentStoreManagerProps) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    delivery_method: "",
    is_active: true,
  });

  const [requiredFields, setRequiredFields] = useState<Array<{ label: string; type: string; required: boolean }>>([]);

  useEffect(() => {
    loadOfferings();
  }, [agentId]);

  const loadOfferings = async () => {
    try {
      const { data, error } = await supabase
        .from("x_agent_offerings")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOfferings((data || []) as unknown as Offering[]);
    } catch (error) {
      console.error("Error loading offerings:", error);
      toast.error("Failed to load offerings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.delivery_method) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const offeringData = {
        agent_id: agentId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        delivery_method: formData.delivery_method,
        required_info: requiredFields,
        is_active: formData.is_active,
      };

      if (editingOffering) {
        const { error } = await supabase
          .from("x_agent_offerings")
          .update(offeringData)
          .eq("id", editingOffering.id);

        if (error) throw error;
        toast.success("Offering updated successfully");
      } else {
        const { error } = await supabase
          .from("x_agent_offerings")
          .insert(offeringData);

        if (error) throw error;
        toast.success("Offering created successfully");
      }

      resetForm();
      setIsDialogOpen(false);
      loadOfferings();
    } catch (error) {
      console.error("Error saving offering:", error);
      toast.error("Failed to save offering");
    }
  };

  const handleEdit = (offering: Offering) => {
    setEditingOffering(offering);
    setFormData({
      title: offering.title,
      description: offering.description,
      price: offering.price.toString(),
      delivery_method: offering.delivery_method,
      is_active: offering.is_active,
    });
    setRequiredFields(offering.required_info || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (offeringId: string) => {
    if (!confirm("Are you sure you want to delete this offering?")) return;

    try {
      const { error } = await supabase
        .from("x_agent_offerings")
        .delete()
        .eq("id", offeringId);

      if (error) throw error;
      toast.success("Offering deleted");
      loadOfferings();
    } catch (error) {
      console.error("Error deleting offering:", error);
      toast.error("Failed to delete offering");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      delivery_method: "",
      is_active: true,
    });
    setRequiredFields([]);
    setEditingOffering(null);
  };

  const addRequiredField = () => {
    setRequiredFields([...requiredFields, { label: "", type: "text", required: true }]);
  };

  const updateRequiredField = (index: number, field: string, value: any) => {
    const updated = [...requiredFields];
    updated[index] = { ...updated[index], [field]: value };
    setRequiredFields(updated);
  };

  const removeRequiredField = (index: number) => {
    setRequiredFields(requiredFields.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading store...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Store Management</h2>
          <p className="text-muted-foreground">Manage your offerings and receive x402 payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Offering
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffering ? "Edit Offering" : "Create New Offering"}</DialogTitle>
              <DialogDescription>
                Create offerings that users can purchase with x402 payments
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 1-hour Consulting Call"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what you're offering..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USDC) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="10.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery">Delivery Method *</Label>
                <Textarea
                  id="delivery"
                  value={formData.delivery_method}
                  onChange={(e) => setFormData({ ...formData, delivery_method: e.target.value })}
                  placeholder="e.g., I'll email you within 24 hours to schedule the call"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Required Information from Buyer</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRequiredField}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Field
                  </Button>
                </div>
                {requiredFields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Field label (e.g., Email, Phone)"
                        value={field.label}
                        onChange={(e) => updateRequiredField(index, "label", e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={field.type}
                        onChange={(e) => updateRequiredField(index, "type", e.target.value)}
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="textarea">Long Text</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequiredField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Active (visible to buyers)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOffering ? "Update" : "Create"} Offering
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {offerings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No offerings yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first offering to start selling through your X agent
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {offerings.map((offering) => (
            <Card key={offering.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>{offering.title}</CardTitle>
                      {!offering.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription>{offering.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(offering)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(offering.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">${offering.price} USDC</span>
                  </div>
                  {offering.required_info && offering.required_info.length > 0 && (
                    <div className="text-muted-foreground">
                      Requires: {offering.required_info.map(f => f.label).join(", ")}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
