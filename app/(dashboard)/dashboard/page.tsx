"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Task } from "@/lib/models/types";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("today");

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        // Get tasks for the last 7 days
        const sevenDaysAgo = subDays(new Date(), 7);
        const response = await fetch(`/api/tasks?date=${sevenDaysAgo.toISOString()}`);
        
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
  }, [session]);

  // Filter tasks based on selected tab
  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (selectedTab) {
      case "today":
        return tasks.filter(task => {
          const taskDate = new Date(task.scheduledDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
      case "week":
        return tasks;
      default:
        return tasks;
    }
  };

  // Prepare data for charts
  const prepareStatusData = (filteredTasks: Task[]) => {
    const statusCounts = {
      pending: 0,
      done: 0,
      not_done: 0
    };
    
    filteredTasks.forEach(task => {
      statusCounts[task.status]++;
    });
    
    return [
      { name: "En attente", value: statusCounts.pending },
      { name: "Terminé", value: statusCounts.done },
      { name: "Non fait", value: statusCounts.not_done }
    ];
  };
  
  const prepareLotData = (filteredTasks: Task[]) => {
    const lotCounts: Record<string, number> = {};
    
    filteredTasks.forEach(task => {
      lotCounts[task.lot] = (lotCounts[task.lot] || 0) + 1;
    });
    
    return Object.entries(lotCounts).map(([lot, count]) => ({
      name: lot,
      tasks: count
    }));
  };
  
  const prepareDailyData = () => {
    const dailyData: Record<string, { date: string, pending: number, done: number, not_done: number }> = {};
    
    // Initialize data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      dailyData[dateStr] = {
        date: format(date, "EEE", { locale: fr }),
        pending: 0,
        done: 0,
        not_done: 0
      };
    }
    
    // Fill in the data
    tasks.forEach(task => {
      const taskDate = format(new Date(task.scheduledDate), "yyyy-MM-dd");
      if (dailyData[taskDate]) {
        dailyData[taskDate][task.status]++;
      }
    });
    
    return Object.values(dailyData);
  };

  const filteredTasks = getFilteredTasks();
  const statusData = prepareStatusData(filteredTasks);
  const lotData = prepareLotData(filteredTasks);
  const dailyData = prepareDailyData();
  
  const COLORS = ["#ff9800", "#4caf50", "#f44336"];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Bienvenue, {session?.user?.name}. Voici un aperçu de l&apos;avancement des tâches.
        </p>
      </div>

      <Tabs defaultValue="today" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="today">Aujourd&apos;hui</TabsTrigger>
          <TabsTrigger value="week">Cette semaine</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tâches totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredTasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tâches terminées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredTasks.filter(t => t.status === "done").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredTasks.length > 0 
                    ? `${Math.round((filteredTasks.filter(t => t.status === "done").length / filteredTasks.length) * 100)}%` 
                    : "0%"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Statut des tâches</CardTitle>
                <CardDescription>Répartition des tâches par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tâches par lot</CardTitle>
                <CardDescription>Nombre de tâches par lot de travaux</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lotData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tasks" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="week" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution sur 7 jours</CardTitle>
              <CardDescription>Nombre de tâches par jour et par statut</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pending" name="En attente" stackId="a" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="done" name="Terminé" stackId="a" fill="hsl(var(--chart-2))" />
                    <Bar dataKey="not_done" name="Non fait" stackId="a" fill="hsl(var(--chart-3))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Statut des tâches</CardTitle>
                <CardDescription>Répartition des tâches par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tâches par lot</CardTitle>
                <CardDescription>Nombre de tâches par lot de travaux</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lotData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="tasks" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}