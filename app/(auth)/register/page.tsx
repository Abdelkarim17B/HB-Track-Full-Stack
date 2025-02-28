"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardHat } from "lucide-react";
import { toast } from "sonner";
import { Lot, UserRole } from "@/lib/models/types";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  role: z.string(),
  lot: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [lots, setLots] = useState<Lot[]>([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedRole = watch("role");

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await fetch("/api/lots");
        if (response.ok) {
          const data = await response.json();
          setLots(data);
        }
      } catch (error) {
        console.error("Failed to fetch lots:", error);
      }
    };

    fetchLots();
  }, []);

  useEffect(() => {
    // If role is management, set lot to TCE
    if (["ingenieur", "chef_chantier", "conducteur"].includes(selectedRole)) {
      setValue("lot", "TCE");
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Échec de l'inscription");
      }

      toast.success("Compte créé avec succès");
      router.push("/signin");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { value: "ingenieur", label: "Ingénieur travaux" },
    { value: "chef_chantier", label: "Chef de chantier" },
    { value: "conducteur", label: "Conducteur de travaux" },
    { value: "ouvrier", label: "Ouvrier" },
    { value: "sous_traitant", label: "Sous-traitant" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <HardHat className="h-12 w-12 text-primary" />
        <h1 className="text-2xl font-bold">HBTRACK</h1>
        <p className="text-muted-foreground text-sm">Créer un nouveau compte</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom et prénom</Label>
          <Input
            id="name"
            placeholder="Jean Dupont"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-destructive text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Statut</Label>
          <Select 
            onValueChange={(value) => setValue("role", value)}
            defaultValue=""
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-destructive text-sm">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lot">Lot</Label>
          <Select 
            onValueChange={(value) => setValue("lot", value)}
            defaultValue=""
            disabled={["ingenieur", "chef_chantier", "conducteur"].includes(selectedRole as UserRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un lot" />
            </SelectTrigger>
            <SelectContent>
              {lots.map((lot) => (
                <SelectItem key={lot._id} value={lot.name}>
                  {lot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.lot && (
            <p className="text-destructive text-sm">{errors.lot.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer un compte"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Déjà un compte?{" "}
          <Link href="/signin" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}