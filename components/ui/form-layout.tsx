"use client"

import { useState } from "react"
import { Check, CircleCheck, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const highlights = [
  {
    id: 1,
    feature: "Demander les informations que le client n'a pas encore precisees",
  },
  {
    id: 2,
    feature: "Fixer une pretention salariale claire avant l'envoi au client",
  },
  {
    id: 3,
    feature: "Generer un formulaire dynamique avant la confirmation finale",
  },
]

const plans = [
  {
    name: "Qualification rapide",
    features: [
      { feature: "Questions essentielles sur le besoin" },
      { feature: "Disponibilite du client a verifier" },
      { feature: "Informations minimales avant reponse" },
      { feature: "Formulaire court a envoyer" },
    ],
    price: "Rapide",
    href: "#",
    isRecommended: false,
  },
  {
    name: "Qualification standard",
    features: [
      { feature: "Questions techniques complementaires" },
      { feature: "Pretention salariale ou fourchette" },
      { feature: "Adresse ou disponibilite a confirmer" },
      { feature: "Generation du formulaire client" },
    ],
    price: "Standard",
    href: "#",
    isRecommended: true,
  },
  {
    name: "Qualification complete",
    features: [
      { feature: "Questions detaillees avant intervention" },
      { feature: "Contraintes ou details techniques" },
      { feature: "Tarif et informations complementaires" },
      { feature: "Precisions utiles avant confirmation" },
      { feature: "Formulaire complet pour le client" },
    ],
    price: "Complet",
    href: "#",
    isRecommended: false,
  },
]

export default function WorkspaceForm() {
  const [selected, setSelected] = useState(plans[0])

  return (
    <div className="flex w-full items-center justify-center p-10">
      <form className="w-full max-w-3xl space-y-8 mx-auto">
        <h3 className="text-xl font-semibold text-foreground">
          Qualifier la demande avant reponse au client
        </h3>
        <div className="">
          <div className="mt-6 lg:col-span-7">
            <div className="space-y-8 md:space-y-12">
              <div className="md:flex md:items-center md:space-x-4">
                <div className="md:w-1/4">
                  <Label htmlFor="organization" className="font-medium">
                    Type de mission
                  </Label>
                  <Select defaultValue="1">
                    <SelectTrigger id="organization" name="organization" className="mt-2 w-full">
                      <SelectValue placeholder="Choisir une mission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Depannage</SelectItem>
                      <SelectItem value="2">Installation</SelectItem>
                      <SelectItem value="3">Diagnostic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4 md:mt-0 md:w-3/4">
                  <Label htmlFor="workspace" className="font-medium">
                    Information supplementaire a demander
                  </Label>
                  <Input
                    id="workspace"
                    name="workspace"
                    className="mt-2"
                    placeholder="Ex: marque de l'appareil, adresse, disponibilite..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region" className="font-medium">
                  Pretention salariale
                </Label>
                <Select defaultValue="standard">
                  <SelectTrigger id="region" name="region" className="mt-2">
                    <SelectValue placeholder="Choisir un niveau de tarif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bas">Fourchette basse</SelectItem>
                    <SelectItem value="standard">Fourchette standard</SelectItem>
                    <SelectItem value="eleve">Fourchette elevee</SelectItem>
                    <SelectItem value="sur-mesure">Sur mesure</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choisis le niveau de pretention salariale avant de generer le formulaire pour le
                  client
                </p>
              </div>
            </div>
            <h4 className="mt-14 font-medium">
              Niveau de qualification<span className="text-red-500">*</span>
            </h4>
            <RadioGroup
              value={selected.name}
              onValueChange={(value) =>
                setSelected(plans.find((plan) => plan.name === value) || plans[0])
              }
              className="mt-4 space-y-4"
            >
              {plans.map((plan) => (
                <label
                  key={plan.name}
                  htmlFor={plan.name}
                  className={cn(
                    "relative block cursor-pointer rounded-md border bg-background transition",
                    selected.name === plan.name
                      ? "border-primary/20 ring-2 ring-primary/20"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start space-x-4 px-6 py-4">
                    <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                      <RadioGroupItem value={plan.name} id={plan.name} />
                    </div>
                    <div className="w-full">
                      <p className="leading-6">
                        <span className="font-semibold text-foreground">{plan.name}</span>
                        {plan.isRecommended && (
                          <Badge variant="secondary" className="ml-2">
                            recommended
                          </Badge>
                        )}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-muted-foreground" aria-hidden={true} />
                            {feature.feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-b-md border-t border-border bg-muted px-6 py-3">
                    <a
                      href={plan.href}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline hover:underline-offset-4"
                    >
                      Learn more
                      <ExternalLink className="h-4 w-4" aria-hidden={true} />
                    </a>
                    <div>
                      <span className="text-lg font-semibold text-foreground">{plan.price}</span>
                    </div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

        </div>
        <Separator className="my-10" />
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="ghost">
            Cancel
          </Button>
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  )
}
