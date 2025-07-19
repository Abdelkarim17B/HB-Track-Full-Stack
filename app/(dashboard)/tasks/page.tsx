"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Task, Lot } from "@/lib/models/types";
import { CheckCircle, XCircle, Clock, Plus, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import CameraUpload from "@/components/CameraUpload";

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    lot: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd")
  });
  
  // Task update form state
  const [taskUpdate, setTaskUpdate] = useState({
    taskId: "",
    status: "",
    comment: "",
    photoUrl: ""
  });
  
  // Task delete state
  const [deleteTaskId, setDeleteTaskId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  const isManagement = session?.user?.role && ['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await fetch("/api/lots");
        if (response.ok) {
          const data = await response.json();
          setLots(data);
          
          // If user is not management, set their lot as selected
          if (session?.user?.lot && !isManagement) {
            setSelectedLot(session.user.lot);
          }
        }
      } catch (error) {
        console.error("Failed to fetch lots:", error);
      }
    };

    if (session) {
      fetchLots();
    }
  }, [session, isManagement]);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const dateParam = format(selectedDate, "yyyy-MM-dd");
        const lotParam = selectedLot ? `&lot=${selectedLot}` : "";
        
        const response = await fetch(`/api/tasks?date=${dateParam}${lotParam}`);
        
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchTasks();
    }
  }, [session, selectedDate, selectedLot]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title || !newTask.description || !newTask.lot) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error("Échec de la création de la tâche");
      }

      toast.success("Tâche créée avec succès");
      
      // Reset form and refresh tasks
      setNewTask({
        title: "",
        description: "",
        lot: "",
        scheduledDate: format(selectedDate, "yyyy-MM-dd")
      });
      
      setIsDialogOpen(false);
      
      // Refresh tasks
      const dateParam = format(selectedDate, "yyyy-MM-dd");
      const lotParam = selectedLot ? `&lot=${selectedLot}` : "";
      const tasksResponse = await fetch(`/api/tasks?date=${dateParam}${lotParam}`);
      
      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        setTasks(data);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la création de la tâche");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/tasks/${taskUpdate.taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: taskUpdate.status,
          comment: taskUpdate.comment,
          photoUrl: taskUpdate.photoUrl
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour de la tâche");
      }

      toast.success("Tâche mise à jour avec succès");
      
      // Reset form and refresh tasks
      setTaskUpdate({
        taskId: "",
        status: "",
        comment: "",
        photoUrl: ""
      });
      
      setUpdateDialogOpen(false);
      
      // Refresh tasks
      const dateParam = format(selectedDate, "yyyy-MM-dd");
      const lotParam = selectedLot ? `&lot=${selectedLot}` : "";
      const tasksResponse = await fetch(`/api/tasks?date=${dateParam}${lotParam}`);
      
      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        setTasks(data);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour de la tâche");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/tasks/${deleteTaskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression de la tâche");
      }

      toast.success("Tâche supprimée avec succès");
      
      // Reset and close dialog
      setDeleteTaskId("");
      setDeleteDialogOpen(false);
      
      // Refresh tasks
      const dateParam = format(selectedDate, "yyyy-MM-dd");
      const lotParam = selectedLot ? `&lot=${selectedLot}` : "";
      const tasksResponse = await fetch(`/api/tasks?date=${dateParam}${lotParam}`);
      
      if (tasksResponse.ok) {
        const data = await tasksResponse.json();
        setTasks(data);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression de la tâche");
    } finally {
      setIsDeleting(false);
    }
  };

  const openUpdateDialog = (task: Task) => {
    setTaskUpdate({
      taskId: task._id || "",
      status: "",
      comment: "",
      photoUrl: ""
    });
    setUpdateDialogOpen(true);
  };
  
  const openDeleteDialog = (taskId: string) => {
    setDeleteTaskId(taskId);
    setDeleteDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "not_done":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "done":
        return "Terminé";
      case "not_done":
        return "Non fait";
      default:
        return "En attente";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground">
            Gérez et suivez les tâches quotidiennes du chantier.
          </p>
        </div>
        {isManagement && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle tâche</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle tâche pour le chantier.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Titre de la tâche"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Description détaillée de la tâche"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lot">Lot</Label>
                    <Select
                      value={newTask.lot}
                      onValueChange={(value) => setNewTask({ ...newTask, lot: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un lot" />
                      </SelectTrigger>
                      <SelectContent>
                      {lots.map((lot) => (
                        // Only render items with non-empty names
                        lot.name && (
                          <SelectItem key={lot._id} value={lot.name}>
                            {lot.name}
                          </SelectItem>
                        )
                      ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Date prévue</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={newTask.scheduledDate}
                      onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Créer la tâche</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[330px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Date</CardTitle>
              <CardDescription>Sélectionnez une date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                locale={fr}
              />
            </CardContent>
          </Card>

          {isManagement && (
            <Card>
              <CardHeader>
                <CardTitle>Filtrer par lot</CardTitle>
                <CardDescription>Sélectionnez un lot</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedLot}
                  onValueChange={setSelectedLot}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les lots" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les lots</SelectItem>
                    {lots.map((lot) => (
                      // Only render items with non-empty names
                      lot.name && (
                        <SelectItem key={lot._id} value={lot.name}>
                          {lot.name}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                Tâches du {format(selectedDate, "d MMMM yyyy", { locale: fr })}
              </CardTitle>
              <CardDescription>
                {selectedLot 
                  ? `Lot: ${selectedLot}` 
                  : isManagement 
                    ? "Tous les lots" 
                    : `Lot: ${session?.user?.lot}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task._id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{task.title}</CardTitle>
                            <CardDescription>
                              Lot: {task.lot} | Créé par: {task.createdBy}
                            </CardDescription>
                          </div>
                          <Badge 
                            variant={
                              task.status === "done" 
                                ? "default" 
                                : task.status === "not_done" 
                                  ? "destructive" 
                                  : "secondary"
                            }
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(task.status)}
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{task.description}</p>
                        
                        {task.comments && task.comments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="font-semibold">Commentaires:</h4>
                            {task.comments.map((comment) => (
                              <div key={comment._id} className="bg-muted p-3 rounded-md">
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium">{comment.userName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm")}
                                  </p>
                                </div>
                                <p className="text-sm mt-1">{comment.text}</p>
                                {comment.photoUrl && (
                                  <a 
                                    href={comment.photoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-1 inline-block"
                                  >
                                    Voir la photo
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div>
                          {(task.status === "pending" || isManagement) && (
                            <Button 
                              variant="outline" 
                              onClick={() => openUpdateDialog(task)}
                            >
                              Mettre à jour
                            </Button>
                          )}
                        </div>
                        {isManagement && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteDialog(task._id || "")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune tâche pour cette date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Mettre à jour la tâche</DialogTitle>
      <DialogDescription>
        Mettez à jour le statut de la tâche et ajoutez un commentaire si nécessaire.
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={handleUpdateTask}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={taskUpdate.status}
            onValueChange={(value) => setTaskUpdate({ ...taskUpdate, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="done">Terminé</SelectItem>
              <SelectItem value="not_done">Non fait</SelectItem>
              {isManagement && <SelectItem value="pending">En attente</SelectItem>}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="comment">Commentaire</Label>
          <Textarea
            id="comment"
            value={taskUpdate.comment}
            onChange={(e) => setTaskUpdate({ ...taskUpdate, comment: e.target.value })}
            placeholder="Ajoutez un commentaire (obligatoire si 'Non fait')"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photoUrl">Photo</Label>
          {/* Remplacer l'input text par le composant CameraUpload */}
          <CameraUpload
            onPhotoUrlChange={(url) => setTaskUpdate({ ...taskUpdate, photoUrl: url })}
            initialUrl={taskUpdate.photoUrl}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour...
            </>
          ) : (
            "Mettre à jour"
          )}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette tâche? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}