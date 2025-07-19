"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lot } from "@/lib/models/types";
import { Plus, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLotName, setNewLotName] = useState("");

  const isManagement = session?.user?.role && ['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role);

  useEffect(() => {
    const fetchLots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/lots");
        
        if (response.ok) {
          const data = await response.json();
          setLots(data);
        }
      } catch (error) {
        console.error("Failed to fetch lots:", error);
        toast.error("Erreur lors du chargement des lots");
      } finally {
        setIsLoading(false);
      }
    };

    if (session && isManagement) {
      fetchLots();
    }
  }, [session, isManagement]);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newLotName) {
      toast.error("Veuillez saisir un nom de lot");
      return;
    }
    
    try {
      const response = await fetch("/api/lots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newLotName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de la création du lot");
      }

      toast.success("Lot créé avec succès");
      
      // Reset form and refresh lots
      setNewLotName("");
      setIsDialogOpen(false);
      
      // Refresh lots
      const lotsResponse = await fetch("/api/lots");
      
      if (lotsResponse.ok) {
        const lotsData = await lotsResponse.json();
        setLots(lotsData);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue lors de la création du lot");
      }
    }
  };

  if (!isManagement) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Vous n&apos;avez pas accès à cette page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de l&apos;application.
        </p>
      </div>

      <Tabs defaultValue="lots">
        <TabsList>
          <TabsTrigger value="lots">Lots de travaux</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lots" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Lots de travaux</h2>
              <p className="text-muted-foreground">
                Gérez les différents lots de travaux disponibles dans l&apos;application.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau lot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau lot</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau lot de travaux à l&apos;application.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateLot}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du lot</Label>
                      <Input
                        id="name"
                        value={newLotName}
                        onChange={(e) => setNewLotName(e.target.value)}
                        placeholder="Ex: Électricité"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Créer le lot</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des lots</CardTitle>
              <CardDescription>
                Tous les lots de travaux disponibles dans l&apos;application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : lots.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du lot</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date de création</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lots.map((lot) => (
                      <TableRow key={lot._id}>
                        <TableCell className="font-medium">{lot.name}</TableCell>
                        <TableCell>{lot.isDefault ? "Par défaut" : "Personnalisé"}</TableCell>
                        <TableCell>{new Date(lot.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun lot trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}